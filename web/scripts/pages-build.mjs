import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const nextDir = path.join(rootDir, ".next");
const vercelOutputDir = path.join(rootDir, ".vercel", "output");
const functionsDir = path.join(rootDir, ".vercel", "output", "functions");
const workerDir = path.join(rootDir, ".vercel", "output", "static", "_worker.js");
const workerFunctionsDir = path.join(workerDir, "__next-on-pages-dist__", "functions");
const seoRouteManifestPath = path.join(rootDir, "src", "generated", "seo-route-manifest.json");
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

function readSeoRouteManifestRoutes() {
  if (!existsSync(seoRouteManifestPath)) {
    return [];
  }

  const manifest = JSON.parse(readFileSync(seoRouteManifestPath, "utf8"));
  return Array.isArray(manifest.routes) ? manifest.routes : [];
}

function workerFunctionPathForPublicRoute(route) {
  if (route === "/") {
    return path.join(workerFunctionsDir, "index.func.js");
  }

  const segments = route.split("/").filter(Boolean);
  const leaf = segments.pop();
  return path.join(workerFunctionsDir, ...segments, `${leaf}.func.js`);
}

function removeRootPublicRouteFunctions() {
  const publicRoutes = new Set(["/", "/agent", ...readSeoRouteManifestRoutes()]);
  let removedCount = 0;
  let removedBytes = 0;

  for (const route of publicRoutes) {
    const target = workerFunctionPathForPublicRoute(route);
    if (!existsSync(target)) {
      continue;
    }

    removedBytes += statSync(target).size;
    rmSync(target, { force: true });
    removedCount += 1;
  }

  console.log(
    `Removed ${removedCount} duplicate root public route functions (${(removedBytes / 1024 / 1024).toFixed(2)} MiB)`
  );
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

removeRootPublicRouteFunctions();
removeWorkerArtifacts();
