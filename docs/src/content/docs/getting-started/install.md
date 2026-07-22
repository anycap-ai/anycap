---
title: Install the AnyCap CLI
description: Install AnyCap on macOS, Linux, or Windows, verify the binary, and fix PATH issues.
---

## Recommended binary install

The install script selects the correct binary for macOS, Linux, or Windows through Git Bash:

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

The default non-root location is `~/.local/bin/anycap`. The installer updates your shell profile when needed.

## npm install

If your environment already standardizes on Node.js:

```bash
npm install -g @anycap/cli
```

Binary installation is usually faster to start and does not require a Node.js runtime.

## GitHub Releases

Download a platform binary from [AnyCap Releases](https://github.com/anycap-ai/anycap/releases), place it on `PATH`, and make it executable on Unix-like systems.

## Verify the installation

```bash
anycap --version
anycap status
```

## Update

The CLI checks for updates automatically. To update immediately:

```bash
anycap update
```

## Fix `anycap: command not found`

A newly installed binary may exist before the current shell reloads its profile.

```bash
ls -la ~/.local/bin/anycap
export PATH="$HOME/.local/bin:$PATH"
anycap status
```

If that file does not exist, review the installer output for `/usr/local/bin` or a custom `ANYCAP_INSTALL_DIR`. If an older npm binary takes precedence, inspect the resolved path:

```bash
command -v anycap
```

Use the intended full path or put its directory earlier on `PATH`.
