#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
DAEMON_LOG="$LOG_DIR/codex-watch-monitor-daemon.log"
INTERVAL="${CODEX_MONITOR_INTERVAL_SECONDS:-300}"
SOCKET_DIR="${CODEX_MONITOR_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/war3-re-tmux}"
SOCKET="$SOCKET_DIR/codex-watch-monitor.sock"
SESSION="${CODEX_MONITOR_SESSION_NAME:-codex-watch-monitor}"
mkdir -p "$LOG_DIR" "$SOCKET_DIR"

session_exists() {
  tmux -S "$SOCKET" has-session -t "$SESSION" 2>/dev/null
}

start_daemon() {
  if session_exists; then
    echo "codex-watch monitor daemon already running."
    return 0
  fi

  local daemon_cmd
  daemon_cmd=$(printf 'while true; do %q check >> %q 2>&1 || true; sleep %q; done' \
    "$ROOT_DIR/scripts/codex-watch-monitor.sh" "$DAEMON_LOG" "$INTERVAL")

  tmux -S "$SOCKET" new-session -d -s "$SESSION" -n monitor -c "$ROOT_DIR" /bin/zsh -lc "$daemon_cmd"
  tmux -S "$SOCKET" set-option -t "$SESSION" history-limit 10000 >/dev/null
  echo "Started codex-watch monitor daemon (session $SESSION, interval ${INTERVAL}s)."
}

stop_daemon() {
  if ! session_exists; then
    echo "codex-watch monitor daemon is not running."
    return 0
  fi
  tmux -S "$SOCKET" kill-session -t "$SESSION"
  echo "Stopped codex-watch monitor daemon."
}

status_daemon() {
  if session_exists; then
    echo "running (session $SESSION)"
  else
    echo "stopped"
  fi
  [[ -f "$DAEMON_LOG" ]] && tail -n 20 "$DAEMON_LOG"
}

case "${1:-status}" in
  start) start_daemon ;;
  stop) stop_daemon ;;
  restart) stop_daemon || true; start_daemon ;;
  status) status_daemon ;;
  *)
    echo "Usage: $0 [start|stop|restart|status]" >&2
    exit 1
    ;;
esac
