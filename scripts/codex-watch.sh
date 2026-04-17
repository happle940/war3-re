#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
SOCKET_DIR="${CODEX_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/war3-re-tmux}"
SOCKET="$SOCKET_DIR/codex-watch.sock"
SESSION="${CODEX_SESSION_NAME:-codex-watch}"
MODEL="${CODEX_MODEL:-gpt-5.4}"
REASONING_EFFORT="${CODEX_REASONING_EFFORT:-high}"
CODEX_BIN="${CODEX_BIN:-/Applications/Codex.app/Contents/Resources/codex}"
DEFAULT_COMMAND="\"$CODEX_BIN\" --dangerously-bypass-approvals-and-sandbox --model \"$MODEL\" -c 'model_reasoning_effort=\"$REASONING_EFFORT\"' --cd \"$ROOT_DIR\" --no-alt-screen"
RUN_COMMAND="${CODEX_COMMAND:-$DEFAULT_COMMAND}"
SUBMIT_SETTLE_SECONDS="${CODEX_SUBMIT_SETTLE_SECONDS:-1}"
SUBMIT_RETRY_SECONDS="${CODEX_SUBMIT_RETRY_SECONDS:-0.8}"
SUBMIT_VERIFY_ATTEMPTS="${CODEX_SUBMIT_VERIFY_ATTEMPTS:-3}"
CAPTURE_LINES="${CODEX_CAPTURE_LINES:-1200}"

mkdir -p "$LOG_DIR" "$SOCKET_DIR"

latest_log() {
  ls -1t "$LOG_DIR"/codex-watch-[0-9][0-9][0-9][0-9]-*.log 2>/dev/null | head -n 1 || true
}

session_exists() {
  tmux -S "$SOCKET" has-session -t "$SESSION" 2>/dev/null
}

pane_command() {
  if ! session_exists; then
    return 1
  fi
  tmux -S "$SOCKET" list-panes -t "$SESSION:0.0" -F "#{pane_current_command}" 2>/dev/null | head -n 1
}

is_shell_command() {
  local command="${1:-}"
  [[ "$command" =~ ^(zsh|bash|sh|fish)$ ]]
}

paste_payload() {
  local payload="$1"
  local buffer_name="${SESSION}-send-buffer"
  tmux -S "$SOCKET" set-buffer -b "$buffer_name" -- "$payload"
  tmux -S "$SOCKET" paste-buffer -b "$buffer_name" -d -t "$SESSION:0.0"
}

capture_recent_pane() {
  if ! session_exists; then
    return 0
  fi
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:0.0" -S -20 2>/dev/null || true
}

pane_has_queued_prompt() {
  local text="$1"
  printf '%s\n' "$text" | awk '
    {
      line = $0
      gsub(/\r/, "", line)
      gsub(/^[[:space:][:punct:]]+/, "", line)
      gsub(/[[:space:]]+$/, "", line)
      lower = tolower(line)
      gsub(/^p[[:space:]]*r[[:space:]]*e[[:space:]]*s[[:space:]]*s/, "press", lower)
      if (lower ~ /^press up to edit queued messages\.?$/) found = 1
      if (lower ~ /^press (enter|return) to send\.?$/) found = 1
      if (lower ~ /^queued prompt\.?$/) found = 1
      if (lower ~ /^message queued\.?$/) found = 1
    }
    END { exit found ? 0 : 1 }
  '
}

submit_prompt() {
  local attempt pane_text

  sleep "$SUBMIT_SETTLE_SECONDS"
  for ((attempt = 1; attempt <= SUBMIT_VERIFY_ATTEMPTS; attempt += 1)); do
    tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-m
    sleep "$SUBMIT_RETRY_SECONDS"
    pane_text="$(capture_recent_pane)"
    if ! pane_has_queued_prompt "$pane_text"; then
      return 0
    fi
    if ((attempt < SUBMIT_VERIFY_ATTEMPTS)); then
      echo "Prompt still appears queued in session '$SESSION'; sending submit attempt $((attempt + 1))/$SUBMIT_VERIFY_ATTEMPTS." >&2
    fi
  done

  echo "Prompt still appears queued in session '$SESSION' after $SUBMIT_VERIFY_ATTEMPTS submit attempts; manual submit may be required." >&2
}

wait_for_runtime() {
  local attempts="${1:-40}"
  local delay="${2:-0.25}"
  local current=""

  for ((index = 0; index < attempts; index += 1)); do
    current="$(pane_command || true)"
    if [[ -n "$current" ]] && ! is_shell_command "$current"; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

ensure_runtime() {
  if ! session_exists; then
    start_session >/dev/null
  fi

  local current
  current="$(pane_command || true)"
  if [[ -n "$current" ]] && ! is_shell_command "$current"; then
    return 0
  fi

  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-c
  paste_payload "$RUN_COMMAND"
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-m

  if wait_for_runtime 48 0.25; then
    return 0
  fi

  current="$(pane_command || true)"
  echo "Codex runtime did not come online in session '$SESSION' (pane command: ${current:-unknown})." >&2
  return 1
}

print_help() {
  cat <<USAGE
Usage: scripts/codex-watch.sh <start|attach|readonly|tail|status|capture|command|send|stop>

Commands:
  start    Start a new tmux-backed Codex session with logging
  attach   Attach to the running tmux session
  readonly Attach to the running tmux session in read-only mode
  tail     Tail the latest codex log file
  status   Show session info and recent pane output
  capture  Print more pane history to stdout
  command  Print the current tmux pane command
  send     Send a prompt into the running Codex session
  stop     Stop the running tmux session

Environment overrides:
  CODEX_MODEL=<model>            Default: gpt-5.4
  CODEX_REASONING_EFFORT=<lvl>   Default: high
  CODEX_SESSION_NAME=<name>      Default: codex-watch
  CODEX_COMMAND='<command>'      Override the command used inside tmux
  CODEX_BIN=<path>               Default: /Applications/Codex.app/Contents/Resources/codex
USAGE
}

start_session() {
  if session_exists; then
    echo "Session '$SESSION' is already running."
    echo
    echo "Attach: $0 attach"
    echo "Tail:   $0 tail"
    exit 0
  fi

  local timestamp log_file
  timestamp="$(date +%Y-%m-%d-%H%M%S)"
  log_file="$LOG_DIR/codex-watch-$timestamp.log"
  touch "$log_file"

  tmux -S "$SOCKET" new-session -d -s "$SESSION" -n shell -c "$ROOT_DIR"
  tmux -S "$SOCKET" set-option -t "$SESSION" history-limit 100000 >/dev/null
  tmux -S "$SOCKET" pipe-pane -o -t "$SESSION:0.0" "cat >> '$log_file'"
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" -l -- "$RUN_COMMAND"
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-m

  cat <<INFO
Started Codex watch session.

Session: $SESSION
Socket:  $SOCKET
Log:     $log_file

Watch live:
  $0 attach

Watch log only:
  $0 tail

Snapshot status:
  $0 status
INFO
}

attach_session() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running. Start one with: $0 start"
    exit 1
  fi
  exec tmux -S "$SOCKET" attach -t "$SESSION"
}

readonly_attach_session() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running. Start one with: $0 start"
    exit 1
  fi
  exec env TMUX= tmux -S "$SOCKET" attach-session -r -t "$SESSION"
}

tail_log() {
  local log_file
  log_file="$(latest_log)"
  if [[ -z "$log_file" ]]; then
    echo "No codex log file found in $LOG_DIR"
    exit 1
  fi
  echo "Tailing $log_file"
  exec tail -f "$log_file"
}

capture_status() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running."
    exit 1
  fi
  echo "Session: $SESSION"
  echo "Socket:  $SOCKET"
  local log_file
  log_file="$(latest_log)"
  if [[ -n "$log_file" ]]; then
    echo "Log:     $log_file"
  fi
  echo
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:0.0" -S -80
}

capture_full() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running."
    exit 1
  fi
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:0.0" -S "-$CAPTURE_LINES"
}

print_command() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running."
    exit 1
  fi
  pane_command
}

send_text() {
  local payload
  if [[ $# -gt 0 ]]; then
    payload="$*"
  else
    payload="$(cat)"
  fi

  if [[ -z "$payload" ]]; then
    echo "Nothing to send."
    exit 1
  fi

  ensure_runtime
  paste_payload "$payload"
  submit_prompt
  echo "Sent prompt to session '$SESSION'."
}

stop_session() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running."
    exit 0
  fi
  tmux -S "$SOCKET" kill-session -t "$SESSION"
  echo "Stopped session '$SESSION'."
}

cmd="${1:-help}"
case "$cmd" in
  start) start_session ;;
  attach) attach_session ;;
  readonly) readonly_attach_session ;;
  tail) tail_log ;;
  status) capture_status ;;
  capture) capture_full ;;
  command) print_command ;;
  send) shift; send_text "$@" ;;
  stop) stop_session ;;
  help|-h|--help) print_help ;;
  *)
    echo "Unknown command: $cmd" >&2
    echo
    print_help
    exit 1
    ;;
esac
