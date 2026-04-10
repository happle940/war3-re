#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

LABEL="com.happle940.war3re.glmwatch.monitor"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
INTERVAL="${GLM_MONITOR_INTERVAL_SECONDS:-300}"

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$ROOT_DIR/scripts/glm-watch-monitor.sh</string>
    <string>check</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT_DIR</string>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>$INTERVAL</integer>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/glm-watch-monitor-launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/glm-watch-monitor-launchd.err.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)" "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL"

echo "Installed launch agent: $LABEL"
echo "Plist: $PLIST"
echo "Interval: ${INTERVAL}s"
echo
launchctl print "gui/$(id -u)/$LABEL" | sed -n '1,80p'
