#!/bin/sh
# Upload goreleaser artifacts to GitHub Release.
#
# Authentication: see scripts/release/github-auth.sh
#
# Set by the calling CI job:
#   RELEASE_TAG   - Version tag (e.g. "v0.1.0")
#
# Expects:
#   dist/         - goreleaser output from the previous job
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GITHUB_OWNER="anycap-ai"
GITHUB_REPO="anycap"
TAG="${RELEASE_TAG:?RELEASE_TAG is not set}"

# -- Authenticate ------------------------------------------------------------
. "${SCRIPT_DIR}/github-auth.sh"

API="https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}"
AUTH="Authorization: token ${GIT_TOKEN}"

# ── Create release (or get existing) ───────────────────────────────────────
echo "Creating GitHub release for ${TAG} ..."

# Use hand-written release notes if available
NOTES_FILE="releases/${TAG}.md"
if [ -f "$NOTES_FILE" ]; then
  BODY=$(cat "$NOTES_FILE")
  echo "Using release notes from ${NOTES_FILE}"
else
  echo "WARNING: ${NOTES_FILE} not found, using placeholder" >&2
  BODY="Release ${TAG}"
fi

RELEASE_BODY=$(jq -n \
  --arg tag "$TAG" \
  --arg body "$BODY" \
  '{tag_name: $tag, name: $tag, body: $body, draft: true, prerelease: false}')

HTTP_CODE=$(curl -s -o /tmp/release_resp.json -w "%{http_code}" \
  -X POST "${API}/releases" \
  -H "${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${RELEASE_BODY}")

if [ "$HTTP_CODE" = "422" ]; then
  echo "Release ${TAG} already exists, fetching ..."
  # Draft releases are NOT returned by /releases/tags/{tag}, so we must search
  # through all releases (including drafts) to find the matching one.
  HTTP_CODE=$(curl -s -o /tmp/release_resp.json -w "%{http_code}" \
    -H "${AUTH}" \
    "${API}/releases/tags/${TAG}")
  if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
    echo "Published release not found by tag, searching drafts ..."
    curl -sf -o /tmp/releases_list.json \
      -H "${AUTH}" \
      "${API}/releases?per_page=10"
    jq -e --arg tag "$TAG" '[.[] | select(.tag_name == $tag)] | first' \
      /tmp/releases_list.json > /tmp/release_resp.json
  fi
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
  UPLOAD_CODE=$(curl -s -o /tmp/upload_resp.json -w "%{http_code}" \
    -X POST "${UPLOAD_URL}?name=${filename}" \
    -H "${AUTH}" \
    -H "Content-Type: ${ctype}" \
    --data-binary "@${asset}")

  if [ "$UPLOAD_CODE" = "422" ]; then
    echo "  already exists, skipping."
  elif [ "$UPLOAD_CODE" -lt 200 ] || [ "$UPLOAD_CODE" -ge 300 ]; then
    echo "ERROR: Failed to upload ${filename} (HTTP ${UPLOAD_CODE}):" >&2
    cat /tmp/upload_resp.json >&2
    exit 1
  else
    echo "  done."
  fi
done

# ── Publish (draft -> published) ──────────────────────────────────────────
# Publishing the release triggers downstream workflows (npm publish, post-release
# verification). By deferring publish until all assets are uploaded, we avoid a
# race condition where downstream jobs try to download assets that haven't been
# uploaded yet.
RELEASE_ID=$(jq -r '.id' /tmp/release_resp.json)
echo "Publishing release ${TAG} (id=${RELEASE_ID}) ..."

HTTP_CODE=$(curl -s -o /tmp/publish_resp.json -w "%{http_code}" \
  -X PATCH "${API}/releases/${RELEASE_ID}" \
  -H "${AUTH}" \
  -H "Content-Type: application/json" \
  -d '{"draft": false}')

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "ERROR: Failed to publish release (HTTP ${HTTP_CODE}):" >&2
  cat /tmp/publish_resp.json >&2
  exit 1
fi

echo "GitHub release ${TAG} published at https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${TAG}"
