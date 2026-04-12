#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOCK_DIR="${WAR3_RUNTIME_LOCK_DIR:-${TMPDIR:-/tmp}/war3-re-runtime-tests.lockdir}"
LOCK_INIT_GRACE_SEC="${WAR3_RUNTIME_LOCK_INIT_GRACE_SEC:-5}"

cd "$ROOT_DIR"

mkdir -p "$(dirname "$LOCK_DIR")"

lock_mtime() {
  local path="$1"
  if stat -f %m "$path" >/dev/null 2>&1; then
    stat -f %m "$path"
  else
    stat -c %Y "$path"
  fi
}

lock_age_seconds() {
  local path="$1"
  local now
  now="$(date +%s)"
  local modified
  modified="$(lock_mtime "$path" 2>/dev/null || echo 0)"
  echo $((now - modified))
}

write_lock_metadata() {
  printf '%s\n' "$$" > "$LOCK_DIR/pid"
  printf '%s\n' "$ROOT_DIR" > "$LOCK_DIR/root"
  date +%s > "$LOCK_DIR/started_at"
}

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
    lock_age="$(lock_age_seconds "$LOCK_DIR")"
    if (( lock_age >= LOCK_INIT_GRACE_SEC )); then
      echo "Removing stale runtime test lock without pid file (${lock_age}s old)."
      rm -rf "$LOCK_DIR"
      continue
    fi
    echo "Lock directory exists but metadata is still initializing (${lock_age}s old); waiting."
  fi
  sleep 1
done
write_lock_metadata
echo "Runtime test lock acquired."

export WAR3_RUNTIME_LOCK_HELD=1

cleanup_runtime_only() {
  local kill_playwright="${1:-0}"
  WAR3_RUNTIME_KILL_PLAYWRIGHT_PROCS="$kill_playwright" \
    ./scripts/cleanup-local-runtime.sh >/dev/null 2>&1 || true
}

cleanup() {
  cleanup_runtime_only
  rm -f "$LOCK_DIR/pid" "$LOCK_DIR/root" "$LOCK_DIR/started_at" 2>/dev/null || true
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

cleanup_runtime_only 1

if [[ $# -eq 0 ]]; then
  set -- tests/closeout.spec.ts tests/first-five-minutes.spec.ts --reporter=list
fi

npx playwright test "$@"
