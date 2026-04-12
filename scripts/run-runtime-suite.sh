#!/usr/bin/env bash
# Run the full runtime regression suite as observable shards.
# Each shard runs through the locked runner (run-runtime-tests.sh),
# which handles lock acquisition, Vite preview, and cleanup.
#
# Exit behavior: stops at the first failing shard with a non-zero exit code.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

SUITE_START=$(date +%s)
TOTAL_SHARDS=0
PASSED_SHARDS=0
FAILED_SHARD=""

# Shard definitions: name followed by spec files.
# Covers the same 16 specs as test:runtime:single.
shards=(
  core-controls
    tests/closeout.spec.ts
    tests/first-five-minutes.spec.ts
    tests/command-regression.spec.ts
    tests/combat-control-regression.spec.ts

  ui-economy
    tests/command-card-state-regression.spec.ts
    tests/resource-supply-regression.spec.ts

  presence-pathing
    tests/unit-presence-regression.spec.ts
    tests/unit-visibility-regression.spec.ts
    tests/pathing-footprint-regression.spec.ts
    tests/selection-input-regression.spec.ts

  ai-assets-buildings
    tests/ai-economy-regression.spec.ts
    tests/asset-pipeline-regression.spec.ts
    tests/building-agency-regression.spec.ts
    tests/death-cleanup-regression.spec.ts

  construction-defense
    tests/construction-lifecycle-regression.spec.ts
    tests/static-defense-regression.spec.ts
)

run_shard() {
  local name="$1"
  shift
  local specs=("$@")

  echo ""
  echo "========================================"
  echo "SHARD: ${name}"
  echo "SPECS: ${specs[*]}"
  echo "========================================"

  local shard_start
  shard_start=$(date +%s)

  TOTAL_SHARDS=$((TOTAL_SHARDS + 1))

  if "$SCRIPT_DIR/run-runtime-tests.sh" "${specs[@]}" --reporter=list; then
    local shard_end
    shard_end=$(date +%s)
    local elapsed=$((shard_end - shard_start))
    echo ""
    echo "SHARD PASSED: ${name} (${elapsed}s)"
    PASSED_SHARDS=$((PASSED_SHARDS + 1))
  else
    local shard_end
    shard_end=$(date +%s)
    local elapsed=$((shard_end - shard_start))
    echo ""
    echo "SHARD FAILED: ${name} (${elapsed}s)"
    FAILED_SHARD="${name}"
    echo ""
    echo ">>> Stopping at first failure: ${name}"
    echo ""
    SUITE_END=$(date +%s)
    echo "========================================"
    echo "SUITE SUMMARY: ${PASSED_SHARDS}/${TOTAL_SHARDS} shards passed (FAILED at ${FAILED_SHARD})"
    echo "TOTAL: $((SUITE_END - SUITE_START))s"
    echo "========================================"
    exit 1
  fi
}

# Walk the shards array: read name, then specs until the next name or end.
i=0
while [[ $i -lt ${#shards[@]} ]]; do
  name="${shards[$i]}"
  i=$((i + 1))
  spec_list=()
  while [[ $i -lt ${#shards[@]} ]]; do
    # If the current element looks like a shard name (no .spec.ts), start a new shard.
    if [[ "${shards[$i]}" != *".spec.ts"* ]]; then
      break
    fi
    spec_list+=("${shards[$i]}")
    i=$((i + 1))
  done
  run_shard "$name" "${spec_list[@]}"
done

SUITE_END=$(date +%s)
TOTAL_ELAPSED=$((SUITE_END - SUITE_START))

echo ""
echo "========================================"
echo "SUITE PASSED: ${PASSED_SHARDS}/${TOTAL_SHARDS} shards"
echo "TOTAL: ${TOTAL_ELAPSED}s"
echo "========================================"
