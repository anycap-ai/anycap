import registry from "@/lib/seo/ia-registry.json";
import { normalizePublicPath } from "@/lib/site";

export type SeoIaNodeKind =
  | "root"
  | "hub"
  | "cluster"
  | "anchor"
  | "workflow"
  | "leaf"
  | "detail"
  | "standalone";

export type SeoIaNode = {
  id: string;
  kind: SeoIaNodeKind;
  label: string;
  path?: string;
  eyebrow: string;
  parentId?: string;
};

export type SeoBreadcrumbItem = {
  name: string;
  href?: string;
};

export type SeoPageChrome = {
  breadcrumbItems: SeoBreadcrumbItem[];
  eyebrow: string;
  authorLabel: string;
  node: SeoIaNode;
};

const seoIaNodes = registry.nodes as SeoIaNode[];

const seoIaNodeById = new Map(seoIaNodes.map((node) => [node.id, node]));
const seoIaNodeByPath = new Map(
  seoIaNodes
    .filter((node): node is SeoIaNode & { path: string } => typeof node.path === "string")
    .map((node) => [normalizePublicPath(node.path), node]),
);

function buildNodeTrail(node: SeoIaNode): SeoIaNode[] {
  const trail: SeoIaNode[] = [];
  let current: SeoIaNode | undefined = node;

  while (current) {
    trail.unshift(current);
    current = current.parentId ? seoIaNodeById.get(current.parentId) : undefined;
  }

  return trail;
}

export function getSeoIaNodes() {
  return seoIaNodes;
}

export function getSeoIaNodeByPath(pathname: string): SeoIaNode | null {
  return seoIaNodeByPath.get(normalizePublicPath(pathname)) ?? null;
}

export function getSeoBreadcrumbItems(pathname: string): SeoBreadcrumbItem[] | null {
  const node = getSeoIaNodeByPath(pathname);

  if (!node) {
    return null;
  }

  const trail = buildNodeTrail(node);
  return trail.map((entry, index) => ({
    name: entry.label,
    href: index === trail.length - 1 ? undefined : entry.path,
  }));
}

export function getSeoPageChrome(pathname: string): SeoPageChrome | null {
  const node = getSeoIaNodeByPath(pathname);

  if (!node) {
    return null;
  }

  return {
    breadcrumbItems: getSeoBreadcrumbItems(pathname) ?? [],
    eyebrow: node.eyebrow,
    authorLabel: "By AnyCap Team",
    node,
  };
}
