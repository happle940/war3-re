#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
SOCKET_DIR="${GLM_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/war3-re-tmux}"
SOCKET="$SOCKET_DIR/glm-watch.sock"
SESSION="${GLM_SESSION_NAME:-glm-watch}"
EFFORT="${GLM_EFFORT:-high}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
DEFAULT_COMMAND="$CLAUDE_BIN --permission-mode bypassPermissions --effort $EFFORT"
RUN_COMMAND="${GLM_COMMAND:-$DEFAULT_COMMAND}"

mkdir -p "$LOG_DIR" "$SOCKET_DIR"

latest_log() {
  ls -1t "$LOG_DIR"/glm-watch-*.log 2>/dev/null | head -n 1 || true
}

session_exists() {
  tmux -S "$SOCKET" has-session -t "$SESSION" 2>/dev/null
}

print_help() {
  cat <<USAGE
Usage: scripts/glm-watch.sh <start|attach|tail|status|capture|send|stop>

Commands:
  start    Start a new tmux-backed Claude Code session with logging
  attach   Attach to the running tmux session
  tail     Tail the latest glm log file
  status   Show session info and recent pane output
  capture  Print more pane history to stdout
  send     Send a prompt into the running Claude Code session
  stop     Stop the running tmux session

Environment overrides:
  GLM_EFFORT=high|medium|low     Default: high
  GLM_SESSION_NAME=<name>        Default: glm-watch
  GLM_COMMAND='<command>'        Override the command used inside tmux
  CLAUDE_BIN=<path>              Default: claude
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

  local timestamp log_file escaped_root
  timestamp="$(date +%Y-%m-%d-%H%M%S)"
  log_file="$LOG_DIR/glm-watch-$timestamp.log"
  touch "$log_file"

  tmux -S "$SOCKET" new-session -d -s "$SESSION" -n shell -c "$ROOT_DIR"
  tmux -S "$SOCKET" set-option -t "$SESSION" history-limit 100000 >/dev/null
  tmux -S "$SOCKET" pipe-pane -o -t "$SESSION:0.0" "cat >> '$log_file'"

  escaped_root=$(printf '%q' "$ROOT_DIR")
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" -l -- "cd $escaped_root && $RUN_COMMAND"
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-m

  cat <<INFO
Started Claude Code watch session.

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

tail_log() {
  local log_file
  log_file="$(latest_log)"
  if [[ -z "$log_file" ]]; then
    echo "No glm log file found in $LOG_DIR"
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
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:0.0" -S -300
}

send_text() {
  if ! session_exists; then
    echo "Session '$SESSION' is not running. Start one with: $0 start"
    exit 1
  fi

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

  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" -l -- "$payload"
  tmux -S "$SOCKET" send-keys -t "$SESSION:0.0" C-m
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
  tail) tail_log ;;
  status) capture_status ;;
  capture) capture_full ;;
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
