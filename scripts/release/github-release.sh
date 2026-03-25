#!/bin/sh
# Upload goreleaser artifacts to GitHub Release.
#
# Required CI/CD variable:
#   GITHUB_TOKEN  - GitHub token with contents:write on anycap-ai/anycap
#
# Set by the calling CI job:
#   RELEASE_TAG   - Version tag (e.g. "v0.1.0")
#
# Expects:
#   dist/         - goreleaser output from the previous job
set -eu

GITHUB_OWNER="anycap-ai"
GITHUB_REPO="anycap"
TAG="${RELEASE_TAG:?RELEASE_TAG is not set}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN is not set" >&2
  exit 1
fi

API="https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}"
AUTH="Authorization: token ${GITHUB_TOKEN}"

# ── Create release (or get existing) ───────────────────────────────────────
echo "Creating GitHub release for ${TAG} ..."

# Use goreleaser changelog if available, otherwise fallback
if [ -f dist/CHANGELOG.md ]; then
  BODY=$(cat dist/CHANGELOG.md)
else
  BODY="Release ${TAG}"
fi

RELEASE_BODY=$(jq -n \
  --arg tag "$TAG" \
  --arg body "$BODY" \
  '{tag_name: $tag, name: $tag, body: $body, draft: false, prerelease: false}')

HTTP_CODE=$(curl -s -o /tmp/release_resp.json -w "%{http_code}" \
  -X POST "${API}/releases" \
  -H "${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${RELEASE_BODY}")

if [ "$HTTP_CODE" = "422" ]; then
  echo "Release ${TAG} already exists, fetching ..."
  curl -sf -o /tmp/release_resp.json \
    -H "${AUTH}" \
    "${API}/releases/tags/${TAG}"
elif [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "ERROR: Failed to create release (HTTP ${HTTP_CODE}):" >&2
  cat /tmp/release_resp.json >&2
  exit 1
fi

UPLOAD_URL=$(jq -r '.upload_url' /tmp/release_resp.json | sed 's/{.*}//')
echo "Upload URL: ${UPLOAD_URL}"

# ── Upload assets ──────────────────────────────────────────────────────────
for asset in dist/anycap_*.tar.gz dist/anycap_*.zip dist/checksums.txt; do
  [ -f "$asset" ] || continue
  filename=$(basename "$asset")

  case "$filename" in
    *.tar.gz) ctype="application/gzip" ;;
    *.zip)    ctype="application/zip" ;;
    *.txt)    ctype="text/plain" ;;
    *)        ctype="application/octet-stream" ;;
  esac

  echo "Uploading ${filename} ..."
  curl -sf -o /dev/null \
    -X POST "${UPLOAD_URL}?name=${filename}" \
    -H "${AUTH}" \
    -H "Content-Type: ${ctype}" \
    --data-binary "@${asset}"

  echo "  done."
done

echo "GitHub release ${TAG} published at https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${TAG}"
