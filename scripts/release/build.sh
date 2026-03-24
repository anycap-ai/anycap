#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

mkdir -p "${DIST_DIR}"

go build -o "${DIST_DIR}/anycap" ./cmd/anycap
go build -o "${DIST_DIR}/anycap-server" ./cmd/anycap-server
