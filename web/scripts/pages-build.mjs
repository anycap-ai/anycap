import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const functionsDir = path.join(rootDir, ".vercel", "output", "functions");
const notFoundFunctions = ["_not-found.func", "_not-found.rsc.func"];

function runNextOnPages(args) {
  execFileSync(pnpmCmd, ["exec", "next-on-pages", ...args], {
    cwd: rootDir,
    stdio: "inherit",
  });
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

try {
  runNextOnPages([]);
} catch (error) {
  console.warn("next-on-pages failed on the first pass, applying _not-found workaround...");
  removeNotFoundFunctions();
  runNextOnPages(["--skip-build"]);
}
