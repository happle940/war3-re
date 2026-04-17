#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
DAEMON_LOG="$LOG_DIR/board-server-daemon.log"
PID_FILE="$LOG_DIR/board-server-daemon.pid"
PORT="${BOARD_SERVER_PORT:-3001}"
HOST="${BOARD_SERVER_HOST:-127.0.0.1}"
mkdir -p "$LOG_DIR"

pid_is_live() {
  local pid="$1"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" 2>/dev/null
}

read_pid() {
  [[ -f "$PID_FILE" ]] || return 1
  tr -d '[:space:]' < "$PID_FILE"
}

cleanup_stale_pid() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(read_pid || true)"
    if [[ -z "$pid" ]] || ! pid_is_live "$pid"; then
      rm -f "$PID_FILE"
    fi
  fi
}

wait_for_server() {
  local attempts=20
  local delay=0.25
  local i
  for ((i=1; i<=attempts; i+=1)); do
    if curl -fsS "http://$HOST:$PORT/board.html" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done
  return 1
}

start_daemon() {
  cleanup_stale_pid

  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(read_pid)"
    echo "board server daemon already running (pid $pid, http://$HOST:$PORT/board.html)."
    return 0
  fi

  local pid
  pid="$(
    ROOT_DIR="$ROOT_DIR" HOST="$HOST" PORT="$PORT" DAEMON_LOG="$DAEMON_LOG" python3 - <<'PY'
import os
import subprocess

root_dir = os.environ["ROOT_DIR"]
host = os.environ["HOST"]
port = os.environ["PORT"]
daemon_log = os.environ["DAEMON_LOG"]

with open(daemon_log, "a", encoding="utf-8") as log_file:
    proc = subprocess.Popen(
        ["python3", "-m", "http.server", port, "--bind", host, "--directory", root_dir],
        cwd=root_dir,
        stdin=subprocess.DEVNULL,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )

print(proc.pid)
PY
  )"
  printf '%s\n' "$pid" >"$PID_FILE"

  if wait_for_server; then
    pid="$(read_pid)"
    echo "Started board server daemon (pid $pid, http://$HOST:$PORT/board.html)."
    return 0
  fi

  local pid=""
  pid="$(read_pid || true)"
  if [[ -n "$pid" ]] && pid_is_live "$pid"; then
    kill "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  echo "Failed to start board server daemon." >&2
  tail -n 40 "$DAEMON_LOG" >&2 || true
  exit 1
}

stop_daemon() {
  cleanup_stale_pid

  if [[ ! -f "$PID_FILE" ]]; then
    echo "board server daemon is not running."
    return 0
  fi

  local pid
  pid="$(read_pid)"
  kill "$pid" 2>/dev/null || true

  local attempts=20
  local i
  for ((i=1; i<=attempts; i+=1)); do
    if ! pid_is_live "$pid"; then
      rm -f "$PID_FILE"
      echo "Stopped board server daemon."
      return 0
    fi
    sleep 0.1
  done

  kill -9 "$pid" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "Stopped board server daemon."
}

status_daemon() {
  cleanup_stale_pid

  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(read_pid)"
    echo "running (pid $pid, http://$HOST:$PORT/board.html)"
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
