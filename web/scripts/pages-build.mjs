import { execFileSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const nextDir = path.join(rootDir, ".next");
const vercelOutputDir = path.join(rootDir, ".vercel", "output");
const functionsDir = path.join(rootDir, ".vercel", "output", "functions");
const workerDir = path.join(rootDir, ".vercel", "output", "static", "_worker.js");
const notFoundFunctions = ["_not-found.func", "_not-found.rsc.func"];
const removableWorkerArtifacts = ["nop-build-log.json"];

function runNextOnPages(args) {
  execFileSync(pnpmCmd, ["exec", "next-on-pages", ...args], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function removeBuildDirectory(targetDir) {
  if (!existsSync(targetDir)) {
    return;
  }

  rmSync(targetDir, { recursive: true, force: true });
  console.log(`Removed ${path.relative(rootDir, targetDir)}`);
}

function removeNotFoundFunctions() {
  for (const name of notFoundFunctions) {
    const target = path.join(functionsDir, name);

    if (!existsSync(target)) {
      continue;
    }

    rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${path.relative(rootDir, target)}`);
  }
}

function removeWorkerArtifacts() {
  for (const name of removableWorkerArtifacts) {
    const target = path.join(workerDir, name);

    if (!existsSync(target)) {
      continue;
    }

    const bytes = statSync(target).size;
    rmSync(target, { force: true });
    console.log(
      `Removed ${path.relative(rootDir, target)} (${(bytes / 1024 / 1024).toFixed(2)} MiB)`
    );
  }
}

removeBuildDirectory(nextDir);
removeBuildDirectory(vercelOutputDir);

try {
  runNextOnPages([]);
} catch (error) {
  console.warn("next-on-pages failed on the first pass, applying _not-found workaround...");
  removeNotFoundFunctions();
  runNextOnPages(["--skip-build"]);
}

removeWorkerArtifacts();
