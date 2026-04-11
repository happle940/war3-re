#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOCK_DIR="${WAR3_RUNTIME_LOCK_DIR:-${TMPDIR:-/tmp}/war3-re-runtime-tests.lockdir}"

# If a runtime test runner holds the lock, do not kill its browser/server from
# another terminal/agent. The runner sets WAR3_RUNTIME_LOCK_HELD=1 for its own
# cleanup path.
if [[ "${WAR3_RUNTIME_LOCK_HELD:-0}" != "1" && "${FORCE_RUNTIME_CLEANUP:-0}" != "1" ]]; then
  if [[ -d "$LOCK_DIR" ]]; then
    holder_pid="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
    if [[ -n "$holder_pid" ]] && kill -0 "$holder_pid" 2>/dev/null; then
      echo "Runtime test lock active; cleanup skipped."
      exit 0
    fi
    echo "Removing stale runtime test lock."
    rm -rf "$LOCK_DIR"
  fi
fi

# Stop local dev/preview servers and Playwright runs launched from this repo.
pkill -f "$ROOT_DIR/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "$ROOT_DIR/node_modules/playwright" 2>/dev/null || true
pkill -f "playwright test" 2>/dev/null || true

# Playwright's headless shell can keep GPU/renderer processes alive after an
# interrupted test. These are test-only processes, not the user's normal Chrome.
pkill -9 -f "chrome-headless-shell" 2>/dev/null || true

# Close visible Chrome tabs for the local test ports this project uses.
if command -v osascript >/dev/null 2>&1; then
  osascript <<'APPLESCRIPT' >/dev/null 2>&1 || true
tell application "Google Chrome"
  repeat with w in windows
    set tabsToClose to {}
    repeat with t in tabs of w
      set u to URL of t
      if u contains "127.0.0.1:3000" or u contains "localhost:3000" or u contains "127.0.0.1:4173" or u contains "localhost:4173" or u contains "127.0.0.1:5173" or u contains "localhost:5173" then
        set end of tabsToClose to t
      end if
    end repeat
    repeat with t in tabsToClose
      close t
    end repeat
  end repeat
end tell
APPLESCRIPT
fi

echo "Local runtime cleanup complete."
