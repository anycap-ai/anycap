#!/bin/sh
# Publish AnyCap CLI to npm as platform-specific packages.
#
# Required CI/CD variable:
#   NPM_TOKEN     - npm token with publish access to @anycap scope
#
# Set by the calling CI job:
#   RELEASE_TAG   - Version tag (e.g. "v0.1.0")
#
# Expects:
#   dist/         - goreleaser output from the build job
set -eu

TAG="${RELEASE_TAG:?RELEASE_TAG is not set}"
VERSION="${TAG#v}"

# ── Skip if NPM_TOKEN is not configured ────────────────────────────────────
if [ -z "${NPM_TOKEN:-}" ]; then
  echo "NPM_TOKEN is not set, skipping npm publish."
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
WORK_DIR="${ROOT_DIR}/dist/npm"

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

# ── Configure npm auth ────────────────────────────────────────────────────
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "${WORK_DIR}/.npmrc"

# ── Platform mapping: Go OS/ARCH -> npm package suffix + os/cpu fields ───
#
# Format: GO_OS/GO_ARCH|NPM_SUFFIX|NPM_OS|NPM_CPU
PLATFORMS="
darwin/amd64|darwin-x64|darwin|x64
darwin/arm64|darwin-arm64|darwin|arm64
linux/amd64|linux-x64|linux|x64
linux/arm64|linux-arm64|linux|arm64
windows/amd64|win32-x64|win32|x64
windows/arm64|win32-arm64|win32|arm64
"

# ── Publish platform packages ─────────────────────────────────────────────
for entry in ${PLATFORMS}; do
  IFS='|' read -r go_platform npm_suffix npm_os npm_cpu <<EOF
${entry}
EOF

  go_os="${go_platform%/*}"
  go_arch="${go_platform#*/}"

  pkg_name="@anycap/cli-${npm_suffix}"
  pkg_dir="${WORK_DIR}/${npm_suffix}"

  # Find the goreleaser archive
  if [ "${go_os}" = "windows" ]; then
    archive=$(find "${ROOT_DIR}/dist" -maxdepth 1 -name "anycap_${VERSION}_${go_os}_${go_arch}.zip" | head -1)
    bin_name="anycap.exe"
  else
    archive=$(find "${ROOT_DIR}/dist" -maxdepth 1 -name "anycap_${VERSION}_${go_os}_${go_arch}.tar.gz" | head -1)
    bin_name="anycap"
  fi

  if [ -z "${archive}" ]; then
    echo "WARNING: Archive not found for ${go_os}/${go_arch}, skipping ${pkg_name}"
    continue
  fi

  echo "Packaging ${pkg_name}@${VERSION} from ${archive} ..."

  mkdir -p "${pkg_dir}/bin"

  # Extract binary
  if [ "${go_os}" = "windows" ]; then
    unzip -o -j "${archive}" "${bin_name}" -d "${pkg_dir}/bin/" > /dev/null
  else
    tar -xzf "${archive}" -C "${pkg_dir}/bin/" "${bin_name}"
  fi

  chmod +x "${pkg_dir}/bin/${bin_name}"

  # Generate package.json
  cat > "${pkg_dir}/package.json" <<PKGJSON
{
  "name": "${pkg_name}",
  "version": "${VERSION}",
  "description": "AnyCap CLI binary for ${npm_os}-${npm_cpu}",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/anycap-ai/anycap"
  },
  "os": ["${npm_os}"],
  "cpu": ["${npm_cpu}"],
  "bin": {
    "anycap": "bin/${bin_name}"
  },
  "files": ["bin/"]
}
PKGJSON

  # Publish
  npm publish "${pkg_dir}" --access public --userconfig "${WORK_DIR}/.npmrc"
  echo "  Published ${pkg_name}@${VERSION}"
done

# ── Publish main wrapper package ───────────────────────────────────────────
echo "Packaging @anycap/cli@${VERSION} ..."

main_dir="${WORK_DIR}/cli"
cp -r "${ROOT_DIR}/npm/anycap" "${main_dir}"

# Update version in package.json (main package and all optionalDependencies)
sed -i.bak "s/\"version\": \"0.0.0\"/\"version\": \"${VERSION}\"/" "${main_dir}/package.json"
sed -i.bak "s/\": \"0.0.0\"/\": \"${VERSION}\"/g" "${main_dir}/package.json"
rm -f "${main_dir}/package.json.bak"

npm publish "${main_dir}" --access public --userconfig "${WORK_DIR}/.npmrc"
echo "  Published @anycap/cli@${VERSION}"

# ── Cleanup ────────────────────────────────────────────────────────────────
rm -f "${WORK_DIR}/.npmrc"

echo ""
echo "npm publish complete: @anycap/cli@${VERSION}"
echo "Install with: npm install -g @anycap/cli"
