import { getSeoIaNodes, type SeoIaNode, type SeoIaNodeKind } from "@/lib/seo/ia";

export type LearnHubLink = {
  label: string;
  href: string;
};

export type LearnHubArticle = {
  id: string;
  title: string;
  href: string;
  description: string;
  badge: string;
  updated: string;
  kind: SeoIaNodeKind;
  children: readonly LearnHubArticle[];
};

export type LearnHubSection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  description: string;
  featuredArticle: LearnHubArticle;
  followOnArticles: readonly LearnHubArticle[];
  supportingArticles: readonly LearnHubArticle[];
  relatedLinks: readonly LearnHubLink[];
};

export type LearnHubContent = {
  sections: readonly LearnHubSection[];
  allArticles: readonly LearnHubArticle[];
};

type LearnHubNodeMeta = {
  title?: string;
  description?: string;
  badge?: string;
  updated?: string;
  order?: number;
};

type LearnHubClusterMeta = {
  title: string;
  summary: string;
  description: string;
  featuredId?: string;
  order?: number;
  relatedLinks?: readonly LearnHubLink[];
};

const defaultBadgeByKind: Record<SeoIaNodeKind, string> = {
  root: "Overview",
  hub: "Hub",
  cluster: "Path",
  anchor: "Main guide",
  workflow: "Workflow",
  leaf: "Deep dive",
  detail: "Explainer",
  standalone: "Product page",
};

const clusterMetaById: Record<string, LearnHubClusterMeta> = {
  "learn-coding-agent-stacks": {
    order: 10,
    title: "Choose a coding-agent stack",
    summary: "Compare the stack before you compare only the model.",
    description:
      "Start here when the real decision is how a coding agent should work day to day, then narrow into the Claude Code or Cursor specific path when you know which workflow matters.",
    featuredId: "learn-best-ai-for-coding-agents",
    relatedLinks: [
      { label: "Claude Code setup", href: "/for/claude-code" },
      { label: "Cursor setup", href: "/for/cursor" },
    ],
  },
  "learn-ai-product-design": {
    order: 20,
    title: "Design or extend an AI product",
    summary: "Move from chat-first ideas into capability-aware architecture.",
    description:
      "Use this path when a SaaS assistant, copilot, or internal AI feature has to move from answering in chat to inspecting, generating, and delivering richer outputs.",
    featuredId: "learn-ai-chatbot-vs-ai-agent-for-saas",
    relatedLinks: [
      { label: "Agent capability runtime", href: "/glossary/agent-capability-runtime" },
      { label: "Browse capabilities", href: "/capabilities" },
    ],
  },
  "learn-limits-and-evaluation": {
    order: 30,
    title: "Understand limits and evaluation",
    summary: "Use the gap map before you decide what to add next.",
    description:
      "This path works best when the agent mostly succeeds already, but breaks on screenshots, recordings, generation, or delivery and you need to separate model hype from real missing capability.",
    featuredId: "learn-what-agents-cant-do",
    relatedLinks: [
      { label: "Agent Harness", href: "/glossary/agent-harness" },
      { label: "Capabilities hub", href: "/capabilities" },
    ],
  },
  "learn-use-cases": {
    order: 40,
    title: "Start with a concrete workflow",
    summary: "See one real path first, then branch into variants only if you need them.",
    description:
      "These pages are the best fit when the question is operational: research, image cleanup, asset production, or creative output that still needs a repeatable path.",
    featuredId: "learn-how-to-make-image-transparent",
    relatedLinks: [
      { label: "Image Generation", href: "/capabilities/image-generation" },
      { label: "Image Understanding", href: "/capabilities/image-understanding" },
      { label: "Skills", href: "/skills" },
      { label: "Install AnyCap", href: "/guides/install-anycap" },
    ],
  },
  "learn-product": {
    order: 50,
    title: "Understand the product surface",
    summary: "Use the product pages when you want the shortest orientation to how AnyCap fits together.",
    description:
      "Start here if the main question is what AnyCap actually ships, where the CLI fits, and how reusable skills shape the workflow around the capability runtime.",
    featuredId: "cli",
    relatedLinks: [
      { label: "Install AnyCap", href: "/guides/install-anycap" },
      { label: "Browse capabilities", href: "/capabilities" },
    ],
  },
};

const nodeMetaById: Record<string, LearnHubNodeMeta> = {
  cli: {
    description:
      "See how one CLI exposes generation, analysis, web retrieval, storage, and publishing workflows through a single agent surface.",
    badge: "Product guide",
    updated: "Evergreen",
  },
  skills: {
    description:
      "Understand how reusable skill files package install, auth, and invocation guidance around AnyCap workflows.",
    badge: "Product guide",
    updated: "Evergreen",
  },
  "learn-best-ai-for-coding-agents": {
    description:
      "Use this buyer guide when the real question is whether the right answer is a model choice, a platform workflow, or the capability layer around the agent.",
    badge: "Buyer guide",
    updated: "Apr 7, 2026",
  },
  "learn-best-ai-for-claude-code": {
    description:
      "A Claude Code specific path for teams deciding when pure repo work is enough and when capability gaps start to matter.",
    badge: "Platform guide",
    updated: "Apr 7, 2026",
  },
  "learn-best-ai-for-cursor": {
    description:
      "A Cursor specific path for teams deciding when the editor loop is enough and when they need image, video, or vision workflows around it.",
    badge: "Platform guide",
    updated: "Apr 7, 2026",
  },
  "learn-ai-chatbot-vs-ai-agent-for-saas": {
    description:
      "A practical architecture guide for SaaS teams deciding when a chatbot is enough and when the workflow really needs an agent plus a capability layer.",
    badge: "Architecture guide",
    updated: "Apr 7, 2026",
  },
  "learn-add-multimodal-capabilities-to-saas-chatbot": {
    description:
      "An implementation path for extending a SaaS chatbot with image, video, web, and delivery workflows without rebuilding the whole stack.",
    badge: "Implementation",
    updated: "Apr 7, 2026",
  },
  "learn-what-agents-cant-do": {
    description:
      "Map the recurring gaps in modern coding agents and connect each missing capability to the shortest AnyCap path.",
    badge: "Foundations",
    updated: "Evergreen",
  },
  "learn-what-is-the-most-advanced-ai": {
    description:
      "A practical explainer on when advanced AI is really a model question and when it becomes a system and capability question.",
    badge: "Explainer",
    updated: "Apr 7, 2026",
  },
  "learn-smart-goal-generator": {
    description:
      "Turn rough goals into research-backed SMART goals with citations, structured notes, and publishable output.",
    badge: "Workflow",
    updated: "Apr 7, 2026",
    order: 40,
  },
  "learn-how-to-make-image-transparent": {
    description:
      "Turn an existing image into a transparent cutout, inspect the result, and keep the asset reusable for product and content workflows.",
    badge: "Workflow",
    updated: "Apr 9, 2026",
    order: 10,
  },
  "learn-how-to-change-photo-background": {
    description:
      "Replace a photo background without losing the subject, then branch into white, studio, or scene-specific versions from the same source image.",
    badge: "Workflow",
    updated: "Apr 9, 2026",
    order: 20,
  },
  "learn-how-to-make-background-white-for-product-photos": {
    description:
      "Turn a cluttered product photo into a white-background listing image while preserving the original item and checking the result before export.",
    badge: "Workflow",
    updated: "Apr 9, 2026",
    order: 30,
  },
  "learn-how-to-remove-people-from-photos": {
    description:
      "Remove one distracting person from a photo, reconstruct the surrounding scene, and verify that the repaired image still looks believable before reuse.",
    badge: "Workflow",
    updated: "Apr 10, 2026",
    order: 40,
  },
  "learn-how-to-brighten-a-photo-online": {
    description:
      "Brighten a dark photo, soften harsh shadow, and inspect whether the corrected image still looks like the same subject instead of a washed-out redo.",
    badge: "Workflow",
    updated: "Apr 10, 2026",
    order: 45,
  },
  "learn-how-to-make-memes-online": {
    description:
      "Generate or edit the base visual, keep the caption exact, and branch into narrower meme styles from one anchor workflow.",
    badge: "Workflow anchor",
    updated: "Apr 8, 2026",
    order: 50,
  },
  "learn-funny-meme-drawings": {
    description:
      "Generate classic doodle memes, bad-drawing variants, and other low-fi humorous visuals that still fit a repeatable workflow.",
    badge: "Style variant",
    updated: "Apr 8, 2026",
  },
  "learn-easy-memes-to-draw": {
    description:
      "Generate simple doodle character sheets, easy meme ideas, and beginner-friendly reaction drawings that still map to a real workflow.",
    badge: "Style variant",
    updated: "Apr 8, 2026",
  },
  "learn-how-to-make-bad-drawing-memes": {
    description:
      "Generate intentionally awkward meme drawings, keep the ugly style readable, and turn badly drawn joke ideas into repeatable visuals.",
    badge: "Style variant",
    updated: "Apr 8, 2026",
  },
  "learn-how-to-make-ai-influencers": {
    description:
      "Build a reusable virtual creator workflow from realistic stills to motion-ready clips instead of relying on a black-box influencer app.",
    badge: "Workflow anchor",
    updated: "Apr 9, 2026",
    order: 60,
  },
  "learn-create-ai-influencer-for-free": {
    description:
      "Validate a realistic AI influencer direction cheaply by starting with stills, refining one winner, and delaying motion until the persona actually works.",
    badge: "Budget workflow",
    updated: "Apr 9, 2026",
  },
  "learn-how-to-make-ai-influencer-videos": {
    description:
      "Use a still-first video workflow so the creator frame is stable before image-to-video motion begins.",
    badge: "Video branch",
    updated: "Apr 9, 2026",
  },
  "learn-ai-video-generator-from-image": {
    description:
      "Turn one strong still into motion, inspect the clip, and keep the source image connected to the rest of the workflow.",
    badge: "Motion workflow",
    updated: "Apr 9, 2026",
  },
  "learn-what-is-an-ai-influencer": {
    description:
      "A practical explainer on what an AI influencer actually is and how the persona, motion, and QA layers fit together.",
    badge: "Explainer",
    updated: "Apr 9, 2026",
  },
};

function hasPath(node: SeoIaNode): node is SeoIaNode & { path: string } {
  return typeof node.path === "string";
}

function buildChildrenByParent(nodes: readonly SeoIaNode[]) {
  const childrenByParent = new Map<string, SeoIaNode[]>();

  for (const node of nodes) {
    if (!node.parentId) {
      continue;
    }

    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parentId, siblings);
  }

  return childrenByParent;
}

function getOrderedNodes<T extends SeoIaNode>(nodes: readonly T[]) {
  return [...nodes].sort((left, right) => {
    const leftOrder = nodeMetaById[left.id]?.order ?? Number.POSITIVE_INFINITY;
    const rightOrder = nodeMetaById[right.id]?.order ?? Number.POSITIVE_INFINITY;

    return leftOrder - rightOrder;
  });
}

function getFallbackDescription(node: SeoIaNode) {
  switch (node.kind) {
    case "anchor":
      return `Use this as the main entry point for ${node.label.toLowerCase()}.`;
    case "workflow":
      return `Use this workflow when you want to see how ${node.label.toLowerCase()} works in practice.`;
    case "leaf":
      return `Open this narrower page when you need a more specific take on ${node.label.toLowerCase()}.`;
    case "detail":
      return `Use this explainer when ${node.label.toLowerCase()} is the exact topic you are researching.`;
    case "standalone":
      return `Open this page when you want the product-level view of ${node.label.toLowerCase()}.`;
    default:
      return `Open this page to learn more about ${node.label.toLowerCase()}.`;
  }
}

function getFallbackClusterMeta(cluster: SeoIaNode): LearnHubClusterMeta {
  return {
    title: cluster.label,
    summary: `Browse the pages grouped under ${cluster.label.toLowerCase()}.`,
    description: `Use this path when the question naturally fits ${cluster.label.toLowerCase()}, then branch into narrower pages only if you need them.`,
  };
}

function buildArticleTree(
  node: SeoIaNode & { path: string },
  childrenByParent: Map<string, SeoIaNode[]>,
): LearnHubArticle {
  const nodeMeta = nodeMetaById[node.id];
  const childArticles = getOrderedNodes((childrenByParent.get(node.id) ?? []).filter(hasPath)).map(
    (child) => buildArticleTree(child, childrenByParent),
  );

  return {
    id: node.id,
    title: nodeMeta?.title ?? node.label,
    href: node.path,
    description: nodeMeta?.description ?? getFallbackDescription(node),
    badge: nodeMeta?.badge ?? defaultBadgeByKind[node.kind],
    updated: nodeMeta?.updated ?? "Evergreen",
    kind: node.kind,
    children: childArticles,
  };
}

function chooseFeaturedNode(
  cluster: SeoIaNode,
  directChildren: readonly (SeoIaNode & { path: string })[],
) {
  const clusterMeta = clusterMetaById[cluster.id];

  if (clusterMeta?.featuredId) {
    const exactMatch = directChildren.find((node) => node.id === clusterMeta.featuredId);

    if (exactMatch) {
      return exactMatch;
    }
  }

  const preferredKinds: readonly SeoIaNodeKind[] = ["anchor", "workflow", "detail", "leaf", "standalone"];

  for (const kind of preferredKinds) {
    const matched = directChildren.find((node) => node.kind === kind);

    if (matched) {
      return matched;
    }
  }

  return directChildren[0];
}

function flattenUniqueArticles(sections: readonly LearnHubSection[]) {
  const seen = new Set<string>();
  const flattened: LearnHubArticle[] = [];

  const visit = (article: LearnHubArticle) => {
    if (seen.has(article.href)) {
      return;
    }

    seen.add(article.href);
    flattened.push(article);

    for (const child of article.children) {
      visit(child);
    }
  };

  for (const section of sections) {
    visit(section.featuredArticle);

    for (const article of section.supportingArticles) {
      visit(article);
    }
  }

  return flattened;
}

function buildSections() {
  const nodes = getSeoIaNodes();
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const childrenByParent = buildChildrenByParent(nodes);
  const learnHubNode = nodeById.get("hub-learn");

  if (!learnHubNode) {
    return [] as LearnHubSection[];
  }

  const clusters = [...(childrenByParent.get(learnHubNode.id) ?? [])]
    .filter((node) => node.kind === "cluster")
    .sort((left, right) => {
      const leftOrder = clusterMetaById[left.id]?.order ?? Number.POSITIVE_INFINITY;
      const rightOrder = clusterMetaById[right.id]?.order ?? Number.POSITIVE_INFINITY;

      return leftOrder - rightOrder;
    });

  return clusters
    .map((cluster): LearnHubSection | null => {
      const clusterMeta = clusterMetaById[cluster.id] ?? getFallbackClusterMeta(cluster);
      const directChildren = getOrderedNodes((childrenByParent.get(cluster.id) ?? []).filter(hasPath));

      if (directChildren.length === 0) {
        return null;
      }

      const featuredNode = chooseFeaturedNode(cluster, directChildren);
      const articleTrees = directChildren.map((node) => buildArticleTree(node, childrenByParent));
      const featuredArticle = articleTrees.find((article) => article.id === featuredNode.id) ?? articleTrees[0];
      const supportingArticles = articleTrees.filter((article) => article.id !== featuredArticle.id);

      return {
        id: cluster.id.replace(/^learn-/, ""),
        eyebrow: cluster.eyebrow,
        title: clusterMeta.title,
        summary: clusterMeta.summary,
        description: clusterMeta.description,
        featuredArticle,
        followOnArticles: featuredArticle.children,
        supportingArticles,
        relatedLinks: clusterMeta.relatedLinks ?? [],
      };
    })
    .filter((section): section is LearnHubSection => section !== null);
}

export function getLearnHubContent(): LearnHubContent {
  const sections = buildSections();

  return {
    sections,
    allArticles: flattenUniqueArticles(sections),
  };
}
