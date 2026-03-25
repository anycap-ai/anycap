#!/usr/bin/env bash
set -euo pipefail

ANYCAP_HTTP_ADDR="${ANYCAP_HTTP_ADDR:-:18080}" go run ./cmd/anycap-server
