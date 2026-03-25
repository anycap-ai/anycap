#!/usr/bin/env bash
set -euo pipefail

go run ./cmd/anycap --endpoint "${ANYCAP_API_ENDPOINT:-http://127.0.0.1:18080}" "$@"
