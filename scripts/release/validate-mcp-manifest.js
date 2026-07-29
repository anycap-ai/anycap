#!/usr/bin/env node

"use strict";

const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const EXPECTED_SCHEMA =
  "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json";

function fail(message) {
  throw new Error(`MCP manifest validation failed: ${message}`);
}

function readJSON(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`cannot read ${label} at ${filePath}: ${error.message}`);
  }
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function downloadSchema(schemaURL, redirectsRemaining = 3) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      schemaURL,
      { headers: { "User-Agent": "anycap-mcp-manifest-validator" } },
      (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location &&
          redirectsRemaining > 0
        ) {
          response.resume();
          const redirectURL = new URL(response.headers.location, schemaURL);
          if (redirectURL.protocol !== "https:") {
            reject(new Error(`refusing non-HTTPS schema redirect to ${redirectURL}`));
            return;
          }
          downloadSchema(redirectURL, redirectsRemaining - 1).then(resolve, reject);
          return;
        }
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`official schema returned HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        let size = 0;
        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > 1024 * 1024) {
            request.destroy(new Error("official schema exceeded 1 MiB"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );
    request.setTimeout(15000, () => request.destroy(new Error("official schema request timed out")));
    request.on("error", reject);
  });
}

async function validateOfficialSchema(manifestPath) {
  const schemaText = await downloadSchema(EXPECTED_SCHEMA);
  const schema = JSON.parse(schemaText);
  requireEqual(schema.$id, EXPECTED_SCHEMA, "downloaded official schema $id");

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "anycap-mcp-schema-"));
  const schemaPath = path.join(temporaryDirectory, "server.schema.json");
  const runnerPath = path.join(temporaryDirectory, "validate.js");
  try {
    fs.writeFileSync(schemaPath, schemaText, { mode: 0o600 });
    fs.writeFileSync(
      runnerPath,
      `"use strict";
const fs = require("fs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const schema = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const manifest = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(manifest)) {
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
`
    );

    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const install = spawnSync(
      npm,
      [
        "install",
        "--prefix",
        temporaryDirectory,
        "--ignore-scripts",
        "--no-save",
        "--no-package-lock",
        "--no-audit",
        "--no-fund",
        "ajv@8.20.0",
        "ajv-formats@3.0.1",
      ],
      { stdio: "inherit", timeout: 120000 }
    );
    if (install.error) {
      fail(`official schema validator dependencies could not install: ${install.error.message}`);
    }
    if (install.status !== 0) {
      fail(`official schema validator dependency install exited with status ${install.status}`);
    }

    const validation = spawnSync(
      process.execPath,
      [runnerPath, schemaPath, path.resolve(manifestPath)],
      { stdio: "inherit", timeout: 30000 }
    );
    if (validation.error) {
      fail(`official schema validator could not run: ${validation.error.message}`);
    }
    if (validation.status !== 0) {
      fail(`official schema validation exited with status ${validation.status}`);
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }

  process.stdout.write(`Official MCP schema valid: ${EXPECTED_SCHEMA}\n`);
}

async function main() {
  const manifestPath = process.argv[2];
  const packagePath = process.argv[3];
  if (!manifestPath || !packagePath) {
    console.error(
      "Usage: validate-mcp-manifest.js <server.json> <package.json>"
    );
    process.exitCode = 2;
    return;
  }
  const validateOfficial = process.argv.slice(4).includes("--official-schema");

  const manifest = readJSON(manifestPath, "server.json");
  const packageJSON = readJSON(packagePath, "package.json");

  requireEqual(packageJSON.name, "@anycap/cli", "npm package name");
  requireEqual(manifest.$schema, EXPECTED_SCHEMA, "server.json $schema");
  requireEqual(manifest.name, packageJSON.mcpName, "server name / npm mcpName");
  requireEqual(manifest.version, packageJSON.version, "server / npm version");

  if (!manifest.description || manifest.description.length > 100) {
    fail("description must contain 1-100 characters");
  }
  if (manifest.remotes !== undefined) {
    fail("the CLI-integrated server must not declare a remote transport");
  }
  if (!Array.isArray(manifest.packages) || manifest.packages.length !== 1) {
    fail("exactly one package entry is required");
  }

  const serverPackage = manifest.packages[0];
  requireEqual(serverPackage.registryType, "npm", "package registryType");
  requireEqual(serverPackage.identifier, packageJSON.name, "package identifier");
  requireEqual(serverPackage.version, packageJSON.version, "package version");
  requireEqual(serverPackage.transport && serverPackage.transport.type, "stdio", "transport type");

  if (!Array.isArray(serverPackage.packageArguments)) {
    fail("packageArguments must be an array");
  }
  const commandArgument = serverPackage.packageArguments.find(
    (argument) => argument.type === "positional" && argument.value === "mcp"
  );
  if (!commandArgument) {
    fail('packageArguments must invoke the fixed positional subcommand "mcp"');
  }

  const allowRootArgument = serverPackage.packageArguments.find(
    (argument) => argument.type === "named" && argument.name === "--allow-root"
  );
  if (
    !allowRootArgument ||
    allowRootArgument.format !== "filepath" ||
    allowRootArgument.isRepeated !== true ||
    allowRootArgument.isRequired === true
  ) {
    fail("--allow-root must be an optional, repeatable filepath argument");
  }

  const packagedFiles = Array.isArray(packageJSON.files)
    ? packageJSON.files.map((file) => file.replace(/\/$/, ""))
    : [];
  if (!packagedFiles.includes("bin") || !packagedFiles.includes("server.json")) {
    fail("npm files must include bin/ and server.json");
  }

  process.stdout.write(
    `MCP manifest valid: ${manifest.name}@${manifest.version} via ${path.basename(packagePath)}\n`
  );
  if (validateOfficial) {
    await validateOfficialSchema(manifestPath);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
