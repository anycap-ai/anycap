#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

function fail(message) {
  throw new Error(message);
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function main() {
  const [templateDirectory, destinationDirectory, version] = process.argv.slice(2);
  if (!templateDirectory || !destinationDirectory || !version) {
    fail("Usage: render-npm-main-package.js <template-dir> <destination-dir> <version>");
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    fail(`invalid release version: ${version}`);
  }

  const source = path.resolve(templateDirectory);
  const destination = path.resolve(destinationDirectory);
  if (fs.existsSync(destination)) {
    fail(`destination already exists: ${destination}`);
  }
  fs.cpSync(source, destination, { recursive: true, errorOnExist: true });

  const packagePath = path.join(destination, "package.json");
  const serverPath = path.join(destination, "server.json");
  const packageJSON = readJSON(packagePath);
  const serverJSON = readJSON(serverPath);

  packageJSON.version = version;
  for (const dependency of Object.keys(packageJSON.optionalDependencies || {})) {
    packageJSON.optionalDependencies[dependency] = version;
  }
  serverJSON.version = version;
  for (const packageEntry of serverJSON.packages || []) {
    packageEntry.version = version;
  }

  writeJSON(packagePath, packageJSON);
  writeJSON(serverPath, serverJSON);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
