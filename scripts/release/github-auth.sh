#!/bin/sh
# Shared helper: resolve GitHub authentication.
#
# Supports two modes:
#   1. GitHub App (GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY)
#   2. Token (GITHUB_TOKEN)
#
# Outputs:
#   GIT_TOKEN       - access token for GitHub API / git push
#   GIT_USER_NAME   - git commit author name
#   GIT_USER_EMAIL  - git commit author email
#
# Requirements: openssl, curl, jq (only for GitHub App mode)
#
# Usage:
#   . scripts/release/github-auth.sh
set -eu

GITHUB_OWNER="${GITHUB_OWNER:-anycap-ai}"
GITHUB_REPO="${GITHUB_REPO:-anycap}"

# ---------------------------------------------------------------------------
# GitHub App token generation
# ---------------------------------------------------------------------------

_base64url() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

_resolve_private_key() {
  local key="$1"
  # If it's a file path (GitLab File-type variable), read the content
  if [ -f "$key" ]; then
    cat "$key"
  else
    printf '%s' "$key"
  fi
}

_generate_app_token() {
  local app_id="$1"
  local private_key
  private_key=$(_resolve_private_key "$2")

  local header
  header=$(printf '{"alg":"RS256","typ":"JWT"}' | _base64url)

  local now iat exp payload
  now=$(date +%s)
  iat=$((now - 60))
  exp=$((now + 300))
  payload=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$iat" "$exp" "$app_id" | _base64url)

  local signature
  local key_file
  key_file=$(mktemp)
  printf '%s' "$private_key" > "$key_file"
  signature=$(printf '%s.%s' "$header" "$payload" \
    | openssl dgst -sha256 -sign "$key_file" \
    | _base64url)
  rm -f "$key_file"

  local jwt="${header}.${payload}.${signature}"

  local install_id
  install_id=$(curl -sf \
    -H "Authorization: Bearer ${jwt}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/installation" \
    | jq -r '.id')

  if [ -z "$install_id" ] || [ "$install_id" = "null" ]; then
    echo "ERROR: Could not find GitHub App installation for ${GITHUB_OWNER}/${GITHUB_REPO}" >&2
    return 1
  fi

  local token
  token=$(curl -sf -X POST \
    -H "Authorization: Bearer ${jwt}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/app/installations/${install_id}/access_tokens" \
    | jq -r '.token')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "ERROR: Failed to generate installation access token" >&2
    return 1
  fi

  printf '%s' "$token"
}

# ---------------------------------------------------------------------------
# Resolve authentication
# ---------------------------------------------------------------------------

if [ -n "${GITHUB_APP_ID:-}" ] && [ -n "${GITHUB_APP_PRIVATE_KEY:-}" ]; then
  echo "Authenticating as GitHub App (ID: ${GITHUB_APP_ID}) ..."
  GIT_TOKEN=$(_generate_app_token "$GITHUB_APP_ID" "$GITHUB_APP_PRIVATE_KEY")
  GIT_USER_NAME="anycap-bot[bot]"
  GIT_USER_EMAIL="${GITHUB_APP_ID}+anycap-bot[bot]@users.noreply.github.com"
elif [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "Authenticating with GITHUB_TOKEN ..."
  GIT_TOKEN="${GITHUB_TOKEN}"
  GIT_USER_NAME="AnyCap CI"
  GIT_USER_EMAIL="ci@anycap.ai"
else
  echo "ERROR: Set GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY, or GITHUB_TOKEN" >&2
  exit 1
fi

export GIT_TOKEN GIT_USER_NAME GIT_USER_EMAIL
