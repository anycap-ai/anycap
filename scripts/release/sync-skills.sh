#!/bin/sh
# Sync skill files to the GitHub repository during CLI release.
#
# Required CI/CD variables:
#   GITHUB_TOKEN  - GitHub token with contents:write on anycap-ai/anycap
#
# Set by the calling CI job:
#   RELEASE_TAG   - Version tag (e.g. "v0.1.0")
#
# This script:
#   1. Clones the GitHub repo (shallow)
#   2. Copies .skills/anycap-cli/ -> skills/anycap-cli/
#   3. Updates metadata.version in SKILL.md to match the release
#   4. Updates package.json version
#   5. Commits and pushes to main
set -eu

GITHUB_OWNER="anycap-ai"
GITHUB_REPO="anycap"
TAG="${RELEASE_TAG:?RELEASE_TAG is not set}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN is not set" >&2
  exit 1
fi

# Strip leading "v" for semver
VERSION="${TAG#v}"

CLONE_DIR=$(mktemp -d)
trap 'rm -rf "$CLONE_DIR"' EXIT

echo "Cloning github.com/${GITHUB_OWNER}/${GITHUB_REPO} ..."
git clone --depth 1 \
  "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git" \
  "$CLONE_DIR"

# -- Copy skill files -------------------------------------------------------
echo "Syncing skill files ..."
rm -rf "${CLONE_DIR}/skills/anycap-cli"
mkdir -p "${CLONE_DIR}/skills/anycap-cli"
cp -r .skills/anycap-cli/* "${CLONE_DIR}/skills/anycap-cli/"

# Copy LICENSE
cp .skills/LICENSE "${CLONE_DIR}/skills/LICENSE" 2>/dev/null || true

# -- Update version in SKILL.md ---------------------------------------------
SKILL_FILE="${CLONE_DIR}/skills/anycap-cli/SKILL.md"
if [ -f "$SKILL_FILE" ]; then
  echo "Updating SKILL.md version to ${VERSION} ..."
  sed -i.bak "s/^  version: .*/  version: ${VERSION}/" "$SKILL_FILE"
  rm -f "${SKILL_FILE}.bak"
fi

# -- Commit and push ---------------------------------------------------------
cd "$CLONE_DIR"
git config user.name "AnyCap CI"
git config user.email "ci@anycap.ai"

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "sync: update skills to ${TAG}"
git push origin main

echo "Skills synced to github.com/${GITHUB_OWNER}/${GITHUB_REPO} (${TAG})"
