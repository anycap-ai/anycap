import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectPageRoutes } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");
const registryPath = path.join(rootDir, "src", "lib", "seo", "ia-registry.json");

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const nodes = Array.isArray(registry.nodes) ? registry.nodes : [];

const errors = [];
const nodeIds = new Set();
const nodePaths = new Map();

for (const node of nodes) {
  if (!node.id || typeof node.id !== "string") {
    errors.push("Every IA node needs a string `id`.");
    continue;
  }

  if (nodeIds.has(node.id)) {
    errors.push(`Duplicate IA node id: ${node.id}`);
  }
  nodeIds.add(node.id);

  if (typeof node.path === "string") {
    if (nodePaths.has(node.path)) {
      errors.push(`Duplicate IA node path: ${node.path}`);
    }
    nodePaths.set(node.path, node.id);
  }

  if (!node.label || typeof node.label !== "string") {
    errors.push(`IA node ${node.id} is missing a string \`label\`.`);
  }

  if (!node.eyebrow || typeof node.eyebrow !== "string") {
    errors.push(`IA node ${node.id} is missing a string \`eyebrow\`.`);
  }
}

for (const node of nodes) {
  if (!node.parentId) {
    continue;
  }

  if (!nodeIds.has(node.parentId)) {
    errors.push(`IA node ${node.id} points to missing parent ${node.parentId}.`);
  }
}

const seoRoutes = collectPageRoutes(seoAppDir).sort();
const registeredSeoRoutes = [...nodePaths.keys()]
  .filter((route) => route !== "/")
  .sort();

const missingInRegistry = seoRoutes.filter((route) => !nodePaths.has(route));
const missingPages = registeredSeoRoutes.filter((route) => !seoRoutes.includes(route));

if (missingInRegistry.length > 0) {
  errors.push(
    `Missing IA entries for SEO routes:\n${missingInRegistry.map((route) => `- ${route}`).join("\n")}`,
  );
}

if (missingPages.length > 0) {
  errors.push(
    `IA entries point to missing SEO pages:\n${missingPages.map((route) => `- ${route}`).join("\n")}`,
  );
}

if (errors.length > 0) {
  console.error("SEO information architecture check failed:");
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(
  `SEO information architecture check passed for ${seoRoutes.length} SEO routes and ${nodes.length} IA nodes.`,
);
