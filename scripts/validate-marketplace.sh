#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

json_files="
.cursor-plugin/plugin.json
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
mcp.json
.mcp.json
gemini-extension.json
server.json
"

for file in $json_files; do
  test -f "$file" || {
    echo "missing required file: $file" >&2
    exit 1
  }
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$file"
done

node <<'NODE'
const fs = require("fs");

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const cursor = read(".cursor-plugin/plugin.json");
const claude = read(".claude-plugin/plugin.json");
const gemini = read("gemini-extension.json");
const registry = read("server.json");
const cursorMcp = read("mcp.json");
const claudeMcp = read(".mcp.json");

const versions = new Map([
  [".cursor-plugin/plugin.json", cursor.version],
  [".claude-plugin/plugin.json", claude.version],
  ["gemini-extension.json", gemini.version],
  ["server.json", registry.version],
  ["server.json npm package", registry.packages?.[0]?.version],
]);

const expected = cursor.version;
for (const [file, version] of versions) {
  if (version !== expected) {
    throw new Error(`${file} version ${version} does not match ${expected}`);
  }
}

if (cursor.name !== "anycap" || claude.name !== "anycap" || gemini.name !== "anycap") {
  throw new Error("plugin names must remain 'anycap'");
}

if (!fs.existsSync(cursor.logo)) {
  throw new Error(`Cursor logo does not exist: ${cursor.logo}`);
}

if (cursor.mcpServers !== "./mcp.json") {
  throw new Error("Cursor manifest must reference ./mcp.json");
}

for (const [file, config] of [
  ["mcp.json", cursorMcp],
  [".mcp.json", claudeMcp],
  ["gemini-extension.json", gemini],
]) {
  const server = config.mcpServers?.anycap;
  if (server?.command !== "npx") {
    throw new Error(`${file} must launch AnyCap through npx`);
  }
  const expectedArgs = ["-y", "@anycap/cli@latest", "mcp"];
  if (JSON.stringify(server.args) !== JSON.stringify(expectedArgs)) {
    throw new Error(`${file} must use args ${JSON.stringify(expectedArgs)}`);
  }
}

const packageEntry = registry.packages?.[0];
if (packageEntry?.identifier !== "@anycap/cli") {
  throw new Error("server.json must publish the @anycap/cli package");
}
if (packageEntry?.packageArguments?.[0]?.value !== "mcp") {
  throw new Error("server.json must launch the package with the mcp argument");
}
NODE

for skill in skills/*/SKILL.md; do
  grep -q '^name:' "$skill" || {
    echo "missing name frontmatter: $skill" >&2
    exit 1
  }
  grep -q '^description:' "$skill" || {
    echo "missing description frontmatter: $skill" >&2
    exit 1
  }
done

echo "Marketplace metadata is internally consistent."
