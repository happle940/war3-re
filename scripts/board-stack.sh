#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
SNAPSHOT="$ROOT_DIR/public/dual-lane-board.json"
HOST="${BOARD_SERVER_HOST:-127.0.0.1}"
PORT="${BOARD_SERVER_PORT:-3001}"

refresh_snapshot() {
  node "$ROOT_DIR/scripts/generate-dual-lane-board.mjs"
}

start_stack() {
  refresh_snapshot
  "$ROOT_DIR/scripts/dual-lane-board-daemon.sh" start
  "$ROOT_DIR/scripts/board-server-daemon.sh" start
  echo "Board ready: http://$HOST:$PORT/board.html"
}

stop_stack() {
  "$ROOT_DIR/scripts/board-server-daemon.sh" stop
  "$ROOT_DIR/scripts/dual-lane-board-daemon.sh" stop
}

restart_stack() {
  "$ROOT_DIR/scripts/board-server-daemon.sh" stop || true
  "$ROOT_DIR/scripts/dual-lane-board-daemon.sh" stop || true
  start_stack
}

status_stack() {
  echo "snapshot:"
  if [[ -f "$SNAPSHOT" ]]; then
    node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); console.log('  generated_at: ' + (data.generated_at || '-'))" "$SNAPSHOT"
  else
    echo "  missing"
  fi

  echo
  echo "refresh daemon:"
  "$ROOT_DIR/scripts/dual-lane-board-daemon.sh" status

  echo
  echo "http server:"
  "$ROOT_DIR/scripts/board-server-daemon.sh" status

  echo
  echo "url: http://$HOST:$PORT/board.html"
}

case "${1:-status}" in
  start) start_stack ;;
  stop) stop_stack ;;
  restart) restart_stack ;;
  status) status_stack ;;
  refresh) refresh_snapshot ;;
  *)
    echo "Usage: $0 [start|stop|restart|status|refresh]" >&2
    exit 1
    ;;
esac
