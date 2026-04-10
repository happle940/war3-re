#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$LOG_DIR/glm-watch-monitor.pid"
DAEMON_LOG="$LOG_DIR/glm-watch-monitor-daemon.log"
INTERVAL="${GLM_MONITOR_INTERVAL_SECONDS:-300}"
mkdir -p "$LOG_DIR"

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" 2>/dev/null
}

start_daemon() {
  if is_running; then
    echo "glm-watch monitor daemon already running (pid $(cat "$PID_FILE"))."
    exit 0
  fi

  nohup /bin/zsh -lc '
    while true; do
      "'$ROOT_DIR'/scripts/glm-watch-monitor.sh" check >> "'$DAEMON_LOG'" 2>&1 || true
      sleep "'$INTERVAL'"
    done
  ' >/dev/null 2>&1 &

  echo $! > "$PID_FILE"
  echo "Started glm-watch monitor daemon (pid $(cat "$PID_FILE"), interval ${INTERVAL}s)."
}

stop_daemon() {
  if ! is_running; then
    rm -f "$PID_FILE"
    echo "glm-watch monitor daemon is not running."
    exit 0
  fi
  local pid
  pid="$(cat "$PID_FILE")"
  kill "$pid" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "Stopped glm-watch monitor daemon (pid $pid)."
}

status_daemon() {
  if is_running; then
    echo "running (pid $(cat "$PID_FILE"))"
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
