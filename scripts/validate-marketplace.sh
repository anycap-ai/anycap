#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

node scripts/release/validate-plugin-manifests.js "$repo_root"

echo "Marketplace metadata is internally consistent."
