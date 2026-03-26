#!/usr/bin/env bash
set -euo pipefail

ANYCAP_HTTP_ADDR="${ANYCAP_HTTP_ADDR:-:8080}" go run ./cmd/anycap-server
