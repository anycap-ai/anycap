#!/usr/bin/env bash
# Start the mock auth server for manual CLI login testing.
# Usage: scripts/dev/run-mock-auth.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
exec go run ./cmd/anycap-mock "$@"
