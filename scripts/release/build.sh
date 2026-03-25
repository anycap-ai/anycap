#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

mkdir -p "${DIST_DIR}"

# Sync embedded skills before build.
make -C "${ROOT_DIR}" sync-skills

CLI_PKG="gitlab.knoffice.tech/engineering/anycap"
CLI_LDFLAGS="-X ${CLI_PKG}/internal/cli/config.DefaultEndpoint=https://api.anycap.ai"

go build -ldflags "${CLI_LDFLAGS}" -o "${DIST_DIR}/anycap" ./cmd/anycap
go build -o "${DIST_DIR}/anycap-server" ./cmd/anycap-server
