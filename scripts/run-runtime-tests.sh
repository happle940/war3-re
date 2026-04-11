#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOCK_DIR="${WAR3_RUNTIME_LOCK_DIR:-${TMPDIR:-/tmp}/war3-re-runtime-tests.lockdir}"

cd "$ROOT_DIR"

mkdir -p "$(dirname "$LOCK_DIR")"

echo "Waiting for runtime test lock: $LOCK_DIR"
while ! mkdir "$LOCK_DIR" 2>/dev/null; do
  if [[ -f "$LOCK_DIR/pid" ]]; then
    holder_pid="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
    if [[ -n "$holder_pid" ]] && ! kill -0 "$holder_pid" 2>/dev/null; then
      echo "Removing stale runtime test lock held by dead pid: $holder_pid"
      rm -rf "$LOCK_DIR"
      continue
    fi
  else
    echo "Removing stale runtime test lock without pid file."
    rm -rf "$LOCK_DIR"
    continue
  fi
  sleep 1
done
echo "$$" > "$LOCK_DIR/pid"
echo "Runtime test lock acquired."

export WAR3_RUNTIME_LOCK_HELD=1

cleanup_runtime_only() {
  ./scripts/cleanup-local-runtime.sh >/dev/null 2>&1 || true
}

cleanup() {
  cleanup_runtime_only
  rm -f "$LOCK_DIR/pid" 2>/dev/null || true
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

cleanup_runtime_only

if [[ $# -eq 0 ]]; then
  set -- tests/closeout.spec.ts tests/first-five-minutes.spec.ts --reporter=list
fi

npx playwright test "$@"
