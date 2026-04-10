#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

STATUS_FILE="$LOG_DIR/glm-watch-monitor.json"
STATE_FILE="$LOG_DIR/.glm-watch-monitor.state"
LATEST_LOG="$(ls -1t "$LOG_DIR"/glm-watch-*.log 2>/dev/null | head -n 1 || true)"
STALE_MINUTES="${GLM_MONITOR_STALE_MINUTES:-20}"
STALE_SECONDS=$((STALE_MINUTES * 60))

session_running=false
capture=""
if capture="$ROOT_DIR/scripts/glm-watch.sh capture" 2>/dev/null; then
  session_running=true
fi

state="idle"
detail="No running glm-watch session"
log_age_seconds=""

if [[ -n "$LATEST_LOG" && -f "$LATEST_LOG" ]]; then
  if stat_out=$(stat -f '%m' "$LATEST_LOG" 2>/dev/null); then
    now=$(date +%s)
    log_age_seconds=$((now - stat_out))
  fi
fi

completion_regex='(最终报告|Final Report|^1\. 结果|^1\. Result|Git Pushes|Remaining Risks|晨间接手|Morning Handoff)'

if [[ "$session_running" == true ]]; then
  state="running"
  detail="glm-watch session is active"

  log_tail=""
  if [[ -n "$LATEST_LOG" && -f "$LATEST_LOG" ]]; then
    log_tail="$(tail -n 200 "$LATEST_LOG" 2>/dev/null || true)"
  fi

  if printf '%s\n%s' "$capture" "$log_tail" | grep -E -q "$completion_regex"; then
    state="completed"
    detail="Final report markers detected in glm-watch output"
  elif [[ -n "$log_age_seconds" && "$log_age_seconds" -ge "$STALE_SECONDS" ]]; then
    state="stalled"
    detail="No glm-watch log updates for ${STALE_MINUTES}+ minutes"
  fi
fi

json_escape() {
  python3 - <<'PY' "$1"
import json, sys
print(json.dumps(sys.argv[1]))
PY
}

{
  echo "{" 
  echo "  \"checked_at\": $(json_escape "$(date -u +%Y-%m-%dT%H:%M:%SZ)"),"
  echo "  \"state\": $(json_escape "$state"),"
  echo "  \"detail\": $(json_escape "$detail"),"
  echo "  \"log_file\": $(json_escape "${LATEST_LOG:-}"),"
  echo "  \"log_age_seconds\": ${log_age_seconds:-null}"
  echo "}"
} > "$STATUS_FILE"

current_fingerprint="$state|$detail|${LATEST_LOG:-}|${log_age_seconds:-}"
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
  esac
fi

case "${1:-check}" in
  check)
    echo "$state: $detail"
    ;;
  status)
    cat "$STATUS_FILE"
    ;;
  *)
    echo "Usage: $0 [check|status]" >&2
    exit 1
    ;;
esac
