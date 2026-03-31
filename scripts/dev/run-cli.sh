#!/usr/bin/env bash
set -euo pipefail

LDFLAGS="-X gitlab.knoffice.tech/engineering/anycap/internal/cli/config.Environment=local"

go run -ldflags="${LDFLAGS}" ./cmd/anycap --endpoint "${ANYCAP_API_ENDPOINT:-http://127.0.0.1:8080}" "$@"
