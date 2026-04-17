#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

STATUS_FILE="$LOG_DIR/glm-watch-monitor.json"
STATE_FILE="$LOG_DIR/.glm-watch-monitor.state"
ACTIVITY_FILE="$LOG_DIR/.glm-watch-monitor.activity"
LATEST_LOG="$(ls -1t "$LOG_DIR"/glm-watch-[0-9][0-9][0-9][0-9]-*.log 2>/dev/null | head -n 1 || true)"
STALE_MINUTES="${GLM_MONITOR_STALE_MINUTES:-20}"
STALE_SECONDS=$((STALE_MINUTES * 60))

if [[ "${1:-check}" == "status" ]]; then
  if [[ -f "$STATUS_FILE" ]]; then
    cat "$STATUS_FILE"
  else
    echo '{"state":"unknown","detail":"no glm monitor status yet","log_file":"","inactive_seconds":null}'
  fi
  exit 0
fi

session_running=false
capture=""
pane_command=""
if capture="$("$ROOT_DIR/scripts/glm-watch.sh" capture 2>/dev/null)"; then
  session_running=true
  pane_command="$("$ROOT_DIR/scripts/glm-watch.sh" command 2>/dev/null || true)"
fi

state="idle"
detail="No running glm-watch session"
inactive_seconds=""

if [[ -n "$LATEST_LOG" && -f "$LATEST_LOG" ]]; then
  :
fi

completion_regex='(最终报告|Final Report|^1\. 结果|^1\. Result|Git Pushes|Remaining Risks|晨间接手|Morning Handoff)'

detect_unsafe_runtime_processes() {
  python3 - "$ROOT_DIR" <<'PY'
import re
import subprocess
import sys

root_dir = sys.argv[1]
try:
    raw = subprocess.check_output(["ps", "-axo", "pid=,ppid=,command="], text=True, errors="ignore")
except Exception:
    sys.exit(1)

processes = {}
for line in raw.splitlines():
    parts = line.strip().split(None, 2)
    if len(parts) < 3:
        continue
    pid_text, ppid_text, command = parts
    if not pid_text.isdigit() or not ppid_text.lstrip("-").isdigit():
        continue
    processes[int(pid_text)] = (int(ppid_text), command)

direct_playwright = re.compile(
    r"((^|\s)npx(\s+-y)?\s+playwright\s+test|"
    r"(^|\s)npm\s+(exec\s+)?playwright\s+test|"
    r"node .*node_modules/.bin/playwright(\.cmd)?\s+test|"
    r"(^|\s|/)\.bin/playwright\s+test|"
    r"(^|\s)playwright\s+test)"
)
safe_runner = re.compile(r"(run-runtime-tests\.sh|run-runtime-suite\.sh|cleanup-local-runtime\.sh)")
ignore = re.compile(r"(rg .*playwright|grep .*playwright|watch-monitor\.sh)")

def ancestor_commands(pid):
    seen = set()
    commands = []
    current = pid
    while current in processes and current not in seen:
        seen.add(current)
        parent, command = processes[current]
        commands.append(command)
        current = parent
    return commands

matches = []
for pid, (_ppid, command) in processes.items():
    if "playwright" not in command or " test" not in command:
        continue
    if ignore.search(command):
        continue
    if not direct_playwright.search(command):
        continue
    chain = ancestor_commands(pid)
    if any(safe_runner.search(item) for item in chain):
        continue
    if root_dir not in " ".join(chain) and "tests/" not in command:
        continue
    matches.append(f"{pid} {command[:220]}")

if matches:
    print(matches[0])
    sys.exit(0)
sys.exit(1)
PY
}

unsafe_runtime_process="$(detect_unsafe_runtime_processes 2>/dev/null || true)"

if [[ -n "$unsafe_runtime_process" ]]; then
  state="unsafe_runtime"
  detail="Direct Playwright detected outside run-runtime-tests.sh: $unsafe_runtime_process"
elif [[ "$session_running" == true ]]; then
  now=$(date +%s)
  capture_tail="$(printf '%s' "$capture" | tail -n 120 2>/dev/null || true)"
  current_fingerprint="$(printf '%s' "$capture_tail" | cksum | awk '{print $1":"$2}')"
  previous_activity="$(cat "$ACTIVITY_FILE" 2>/dev/null || true)"
  previous_fingerprint="${previous_activity%%|*}"
  last_active_epoch="${previous_activity##*|}"

  if [[ -z "$last_active_epoch" || "$current_fingerprint" != "$previous_fingerprint" ]]; then
    last_active_epoch="$now"
    printf '%s|%s' "$current_fingerprint" "$last_active_epoch" > "$ACTIVITY_FILE"
  fi

  inactive_seconds=$((now - last_active_epoch))

  if [[ "$pane_command" =~ ^(zsh|bash|sh|fish)$ ]]; then
    state="shell"
    detail="glm-watch session is active but Claude Code is not running in the pane"
  elif printf '%s\n' "$capture_tail" | grep -E -q "$completion_regex"; then
    state="completed"
    detail="Final report markers detected in glm-watch output"
  elif [[ -n "$inactive_seconds" && "$inactive_seconds" -ge "$STALE_SECONDS" ]]; then
    state="stalled"
    detail="No glm-watch pane changes for ${STALE_MINUTES}+ minutes"
  else
    state="running"
    detail="glm-watch session is active"
  fi
fi

json_escape() {
  python3 - <<'PY' "$1"
import json, sys
print(json.dumps(sys.argv[1]))
PY
}

STATUS_TMP="$(mktemp "${STATUS_FILE}.tmp.XXXXXX")"
{
  echo "{" 
  echo "  \"checked_at\": $(json_escape "$(date -u +%Y-%m-%dT%H:%M:%SZ)"),"
  echo "  \"state\": $(json_escape "$state"),"
  echo "  \"detail\": $(json_escape "$detail"),"
  echo "  \"log_file\": $(json_escape "${LATEST_LOG:-}"),"
  echo "  \"inactive_seconds\": ${inactive_seconds:-null}"
  echo "}"
} > "$STATUS_TMP"
mv "$STATUS_TMP" "$STATUS_FILE"

current_fingerprint="$state|$detail|${LATEST_LOG:-}|${inactive_seconds:-}"
previous_fingerprint="$(cat "$STATE_FILE" 2>/dev/null || true)"

notify() {
  local title="$1"
  local body="$2"
  osascript -e "display notification $(printf '%q' "$body") with title $(printf '%q' "$title")" >/dev/null 2>&1 || true
}

if [[ "$current_fingerprint" != "$previous_fingerprint" ]]; then
  printf '%s' "$current_fingerprint" > "$STATE_FILE"
  case "$state" in
    completed)
      notify "glm-watch complete" "$detail"
      ;;
    stalled)
      notify "glm-watch may be stuck" "$detail"
      ;;
    unsafe_runtime)
      notify "glm-watch unsafe runtime" "$detail"
      ;;
  esac
fi

case "${1:-check}" in
  check)
    echo "$state: $detail"
    ;;
  *)
    echo "Usage: $0 [check|status]" >&2
    exit 1
    ;;
esac
