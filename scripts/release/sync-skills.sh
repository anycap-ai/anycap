#!/bin/sh
# Sync skill files to the GitHub repository during CLI release.
#
# Authentication: see scripts/release/github-auth.sh
#
# Set by the calling CI job:
#   RELEASE_TAG   - Version tag (e.g. "v0.1.0")
#
# This script:
#   1. Authenticates via GitHub App or token
#   2. Clones the GitHub repo (shallow)
#   3. Copies the entire skills/ directory
#   4. Updates metadata.version in all SKILL.md files to match the release
#   5. Commits and pushes to main
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GITHUB_OWNER="anycap-ai"
GITHUB_REPO="anycap"
TAG="${RELEASE_TAG:?RELEASE_TAG is not set}"
VERSION="${TAG#v}"

# -- Authenticate ------------------------------------------------------------
. "${SCRIPT_DIR}/github-auth.sh"

# -- Clone -------------------------------------------------------------------
CLONE_DIR=$(mktemp -d)
trap 'rm -rf "$CLONE_DIR"' EXIT

echo "Cloning github.com/${GITHUB_OWNER}/${GITHUB_REPO} ..."
git clone --depth 1 \
  "https://x-access-token:${GIT_TOKEN}@github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git" \
  "$CLONE_DIR"

# -- Copy skill files -------------------------------------------------------
echo "Syncing skill files ..."
rm -rf "${CLONE_DIR}/skills"
cp -r skills "${CLONE_DIR}/skills"

# -- Copy install script ----------------------------------------------------
echo "Syncing install.sh ..."
mkdir -p "${CLONE_DIR}/scripts"
cp web/public/install.sh "${CLONE_DIR}/scripts/install.sh"

# -- Update version in all SKILL.md files ------------------------------------
echo "Updating SKILL.md versions to ${VERSION} ..."
find "${CLONE_DIR}/skills" -name "SKILL.md" -type f | while read -r skill_file; do
  sed -i.bak "s/^  version: .*/  version: ${VERSION}/" "$skill_file"
  rm -f "${skill_file}.bak"
done

# -- Commit and push ---------------------------------------------------------
cd "$CLONE_DIR"
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "sync: update skills to ${TAG}"
git push origin main

echo "Skills synced to github.com/${GITHUB_OWNER}/${GITHUB_REPO} (${TAG})"
