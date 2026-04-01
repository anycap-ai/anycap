#!/bin/sh
# AnyCap CLI Installer
# https://anycap.ai
#
# Usage:
#   curl -fsSL https://anycap.ai/install.sh | sh
#
# Options (environment variables):
#   ANYCAP_VERSION      Install a specific version (e.g. "v0.2.0"). Default: latest.
#   ANYCAP_INSTALL_DIR  Custom install directory. Default: ~/.local/bin.
#   ANYCAP_NO_MODIFY_PATH  Set to 1 to skip shell profile modification.
#
# Platforms: macOS, Linux, Windows (Git Bash / MSYS2 / Cygwin)
# Requirements: curl or wget, tar (+ unzip on Windows), uname
#
# This script is MIT licensed. https://github.com/anycap-ai/anycap

set -eu

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

GITHUB_REPO="anycap-ai/anycap"
BINARY_NAME="anycap"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

has_cmd() { command -v "$1" >/dev/null 2>&1; }

info()  { printf '  \033[1;34m>\033[0m %s\n' "$@"; }
ok()    { printf '  \033[1;32m>\033[0m %s\n' "$@"; }
warn()  { printf '  \033[1;33m>\033[0m %s\n' "$@" >&2; }
err()   { printf '  \033[1;31m>\033[0m %s\n' "$@" >&2; }

abort() { err "$@"; exit 1; }

fetch() {
  local url="$1" dest="$2"
  if has_cmd curl; then
    curl -fsSL --retry 3 --retry-delay 1 "$url" -o "$dest"
  elif has_cmd wget; then
    wget -qO "$dest" "$url"
  else
    abort "curl or wget is required"
  fi
}

fetch_stdout() {
  local url="$1"
  if has_cmd curl; then
    curl -fsSL --retry 3 --retry-delay 1 "$url"
  elif has_cmd wget; then
    wget -qO- "$url"
  else
    abort "curl or wget is required"
  fi
}

# ---------------------------------------------------------------------------
# Detect platform
# ---------------------------------------------------------------------------

detect_platform() {
  OS=$(uname -s)
  ARCH=$(uname -m)

  case "$OS" in
    Linux*)  OS="linux" ;;
    Darwin*) OS="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
    *) abort "Unsupported operating system: $OS" ;;
  esac

  case "$ARCH" in
    x86_64|amd64)   ARCH="amd64" ;;
    aarch64|arm64)   ARCH="arm64" ;;
    armv7l)          abort "32-bit ARM is not supported" ;;
    i386|i686)       abort "32-bit x86 is not supported" ;;
    *) abort "Unsupported architecture: $ARCH" ;;
  esac
}

# ---------------------------------------------------------------------------
# Resolve version
# ---------------------------------------------------------------------------

resolve_version() {
  if [ -n "${ANYCAP_VERSION:-}" ]; then
    # Ensure "v" prefix
    case "$ANYCAP_VERSION" in
      v*) TAG="$ANYCAP_VERSION" ;;
      *)  TAG="v${ANYCAP_VERSION}" ;;
    esac
    info "Requested version: ${TAG}"
    return
  fi

  info "Resolving latest version..."
  # Use the GitHub releases/latest redirect to resolve the tag.
  # This avoids the API rate limit (60 req/hr for unauthenticated requests).
  local redirect_url
  if has_cmd curl; then
    redirect_url=$(curl -fsSL -o /dev/null -w '%{url_effective}' "https://github.com/${GITHUB_REPO}/releases/latest" 2>/dev/null)
  elif has_cmd wget; then
    redirect_url=$(wget --max-redirect=10 -qS -O /dev/null "https://github.com/${GITHUB_REPO}/releases/latest" 2>&1 | grep -i '^  Location:' | tail -1 | awk '{print $2}' | tr -d '\r')
  else
    abort "curl or wget is required"
  fi

  TAG=$(printf '%s' "$redirect_url" | sed 's|.*/tag/||')

  if [ -z "$TAG" ]; then
    abort "Failed to determine latest version. Set ANYCAP_VERSION to install a specific version."
  fi
}

# ---------------------------------------------------------------------------
# Resolve install directory
# ---------------------------------------------------------------------------

resolve_install_dir() {
  if [ -n "${ANYCAP_INSTALL_DIR:-}" ]; then
    INSTALL_DIR="$ANYCAP_INSTALL_DIR"
  elif [ "$(id -u)" = "0" ]; then
    INSTALL_DIR="/usr/local/bin"
  else
    INSTALL_DIR="${HOME}/.local/bin"
  fi

  mkdir -p "$INSTALL_DIR" 2>/dev/null || abort "Cannot create install directory: ${INSTALL_DIR}"

  if [ ! -w "$INSTALL_DIR" ]; then
    abort "No write permission to ${INSTALL_DIR}. Try: sudo sh or set ANYCAP_INSTALL_DIR."
  fi
}

# ---------------------------------------------------------------------------
# Download, verify, and install
# ---------------------------------------------------------------------------

download_and_install() {
  local version="${TAG#v}"
  local checksums="checksums.txt"
  local base_url="https://github.com/${GITHUB_REPO}/releases/download/${TAG}"
  local bin_name="${BINARY_NAME}"
  local archive

  if [ "$OS" = "windows" ]; then
    archive="anycap_${version}_${OS}_${ARCH}.zip"
    bin_name="${BINARY_NAME}.exe"
  else
    archive="anycap_${version}_${OS}_${ARCH}.tar.gz"
  fi

  tmpdir=$(mktemp -d) || abort "Failed to create temp directory"
  trap 'rm -rf "$tmpdir"' EXIT

  info "Downloading ${archive}..."
  fetch "${base_url}/${archive}" "${tmpdir}/${archive}"

  info "Downloading checksums..."
  if fetch "${base_url}/${checksums}" "${tmpdir}/${checksums}" 2>/dev/null; then
    verify_checksum "${tmpdir}" "${archive}" "${checksums}"
  else
    warn "Checksums not available, skipping verification."
  fi

  info "Extracting..."
  if [ "$OS" = "windows" ]; then
    if has_cmd unzip; then
      unzip -o -j "${tmpdir}/${archive}" "${bin_name}" -d "${tmpdir}/" > /dev/null \
        || abort "Failed to extract archive"
    else
      abort "unzip is required to extract on Windows. Install it via: pacman -S unzip"
    fi
  else
    tar -xzf "${tmpdir}/${archive}" -C "$tmpdir" || abort "Failed to extract archive"
  fi

  if [ ! -f "${tmpdir}/${bin_name}" ]; then
    abort "Binary '${bin_name}' not found in archive. Release may be malformed."
  fi

  chmod +x "${tmpdir}/${bin_name}"
  mv -f "${tmpdir}/${bin_name}" "${INSTALL_DIR}/${bin_name}" \
    || abort "Failed to move binary to ${INSTALL_DIR}"
}

verify_checksum() {
  local dir="$1" archive="$2" checksums="$3"
  local expected actual

  expected=$(grep " ${archive}$" "${dir}/${checksums}" | awk '{print $1}')
  if [ -z "$expected" ]; then
    warn "No checksum entry for ${archive}, skipping verification."
    return
  fi

  if has_cmd sha256sum; then
    actual=$(sha256sum "${dir}/${archive}" | awk '{print $1}')
  elif has_cmd shasum; then
    actual=$(shasum -a 256 "${dir}/${archive}" | awk '{print $1}')
  else
    warn "sha256sum/shasum not found, skipping checksum verification."
    return
  fi

  if [ "$expected" != "$actual" ]; then
    abort "Checksum mismatch!
  Expected: ${expected}
  Actual:   ${actual}
The downloaded file may be corrupted. Please try again."
  fi

  info "Checksum verified."
}

# ---------------------------------------------------------------------------
# PATH setup
# ---------------------------------------------------------------------------

ensure_path() {
  case ":${PATH}:" in
    *":${INSTALL_DIR}:"*) return ;;
  esac

  if [ "${ANYCAP_NO_MODIFY_PATH:-}" = "1" ]; then
    warn "${INSTALL_DIR} is not in your PATH."
    warn "Add it manually: export PATH=\"${INSTALL_DIR}:\$PATH\""
    return
  fi

  local shell_name profile_file=""
  shell_name=$(basename "${SHELL:-/bin/sh}")

  case "$shell_name" in
    bash)
      if [ -f "$HOME/.bashrc" ]; then
        profile_file="$HOME/.bashrc"
      elif [ -f "$HOME/.bash_profile" ]; then
        profile_file="$HOME/.bash_profile"
      fi
      ;;
    zsh)
      profile_file="${ZDOTDIR:-$HOME}/.zshrc"
      ;;
    fish)
      # fish uses a different syntax; just print instructions.
      warn "Add to your fish config:"
      warn "  set -gx PATH ${INSTALL_DIR} \$PATH"
      return
      ;;
  esac

  if [ -n "$profile_file" ]; then
    local line="export PATH=\"${INSTALL_DIR}:\$PATH\""
    if [ -f "$profile_file" ] && grep -qF "$INSTALL_DIR" "$profile_file" 2>/dev/null; then
      return
    fi
    printf '\n# AnyCap CLI\n%s\n' "$line" >> "$profile_file"
    info "Added ${INSTALL_DIR} to ${profile_file}"
    warn "Restart your shell or run: source ${profile_file}"
  else
    warn "${INSTALL_DIR} is not in your PATH."
    warn "Add it manually: export PATH=\"${INSTALL_DIR}:\$PATH\""
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  printf '\n\033[1m  AnyCap CLI Installer\033[0m\n\n'

  detect_platform
  info "Platform: ${OS}/${ARCH}"

  resolve_version
  info "Version: ${TAG}"

  resolve_install_dir

  # Resolve actual binary name (anycap.exe on Windows)
  if [ "$OS" = "windows" ]; then
    BIN_FILE="${BINARY_NAME}.exe"
  else
    BIN_FILE="${BINARY_NAME}"
  fi

  # Check for existing installation
  if [ -f "${INSTALL_DIR}/${BIN_FILE}" ]; then
    local current
    current=$("${INSTALL_DIR}/${BIN_FILE}" --version 2>/dev/null || echo "unknown")
    info "Existing installation found: ${current}"
    info "Upgrading..."
  fi

  download_and_install

  ensure_path

  printf '\n'
  ok "AnyCap CLI ${TAG} installed to ${INSTALL_DIR}/${BIN_FILE}"
  printf '\n'
  info "Get started:"
  info "  anycap login"
  info "  anycap status"
  printf '\n'
  info "Using AnyCap with an AI agent? Install the skill so your agent knows how to use AnyCap:"
  printf '\n'
  info "  npx -y skills add anycap-ai/anycap -y"
  printf '\n'
  warn "After installing skills, restart or reload your IDE / agent environment"
  warn "(e.g. Claude Code, Cursor, Codex) for the new skill to take effect."
  printf '\n'
  info "Learn more: https://anycap.ai"
  printf '\n'
}

main
