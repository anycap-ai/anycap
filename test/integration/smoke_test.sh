#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="${ANYCAP_API_ENDPOINT:-http://127.0.0.1:8080}"

curl -fsSL "${ENDPOINT}/healthz"
curl -fsSL "${ENDPOINT}/v1/status"
curl -fsSL "${ENDPOINT}/v1/image/models"
