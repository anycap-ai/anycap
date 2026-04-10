import { getSeoIaNodes, type SeoIaNode, type SeoIaNodeKind } from "@/lib/seo-ia";

export type LearnHubLink = {
  label: string;
  href: string;
};

export type LearnHubFaqItem = {
  question: string;
  answer: string;
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
  hero: {
    eyebrow: string;
    titleLines: readonly [string, string];
    intro: string;
  };
  orientation: {
    eyebrow: string;
    title: string;
    description: string;
    steps: readonly {
      step: string;
      title: string;
      description: string;
    }[];
  };
  pathOverview: {
    eyebrow: string;
    title: string;
    description: string;
  };
  pathSectionIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  adjacentHubs: readonly {
    title: string;
    href: string;
    description: string;
  }[];
  faqItems: readonly LearnHubFaqItem[];
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

const learnHubHero = {
  eyebrow: "Learn",
  titleLines: ["Start with the question", "you are actually asking"] as const,
  intro:
    "Use Learn when you are choosing a coding-agent stack, extending an AI product, mapping capability gaps, or looking for a real workflow example. Each path is grouped by intent so you can move from explanation into the next step without sorting through unrelated page types first.",
} as const;

const learnHubOrientation = {
  eyebrow: "How to use this page",
  title: "Pick one path, start with the featured page, then only go narrower if you need it",
  description:
    "This page is designed to reduce choice overload. Treat each section like a curated route instead of a list of everything we have published.",
  steps: [
    {
      step: "01",
      title: "Match the question",
      description: "Choose the path that fits what you are deciding right now, not every question you might have later.",
    },
    {
      step: "02",
      title: "Open the featured page",
      description: "Start with the main guide or workflow before branching into narrower pages, variants, or agent-specific follow-ons.",
    },
    {
      step: "03",
      title: "Switch page type when needed",
      description: "Move to Guides or Capabilities once the question becomes operational and you are ready to implement.",
    },
  ] as const,
} as const;

const learnHubPathOverview = {
  eyebrow: "Path overview",
  title: "Choose one path and ignore the rest for now",
  description:
    "Each card below maps to a focused section. Open the path that matches your current question, then use the featured page as your entry point.",
} as const;

const learnHubPathSectionIntro = {
  eyebrow: "Browse by path",
  title: "Start with the main page, then go narrower only if needed",
  description:
    "The structure below is generated from the same information architecture that powers breadcrumbs, so new pages can slot into the right path without turning the hub into a manual link dump.",
} as const;

const adjacentHubs = [
  {
    title: "Guides",
    href: "/guides",
    description: "Use Guides when you already know what you want to set up and need step-by-step implementation.",
  },
  {
    title: "Glossary",
    href: "/glossary",
    description: "Use Glossary when the main blocker is vocabulary and you need shared language for harnesses, context, and runtimes.",
  },
  {
    title: "Capabilities",
    href: "/capabilities",
    description: "Use Capabilities when you are past the explainer stage and want the exact product surfaces AnyCap adds.",
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Use Compare when the question starts from an alternative vendor, adjacent product, or replacement decision.",
  },
] as const;

const faqItems = [
  {
    question: "Which page should I start with if I am choosing a coding-agent setup?",
    answer:
      "Start with Best AI for Coding Agents if you are still framing the category question. From there, move into the Claude Code or Cursor specific page once you know which workflow you care about.",
  },
  {
    question: "What if I am building a SaaS assistant instead of using a coding agent?",
    answer:
      "Start with AI Chatbot SaaS vs AI Agent for SaaS if you are deciding what kind of system you need. Then move into Add Multimodal Capabilities to a SaaS Chatbot when the question becomes implementation.",
  },
  {
    question: "Why are some pages grouped under a main workflow instead of listed flat?",
    answer:
      "Because some pages make more sense as a narrower follow-on after the main workflow already fits. The hub keeps those variants visually attached to the parent path so the page stays easier to scan.",
  },
  {
    question: "When should I move from Learn into Guides or Capabilities?",
    answer:
      "Move into Guides when you are ready to set something up step by step. Move into Capabilities when you already understand the problem and want the exact surface, such as image generation, video analysis, or web crawl.",
  },
] as const;

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
    hero: learnHubHero,
    orientation: learnHubOrientation,
    pathOverview: learnHubPathOverview,
    pathSectionIntro: learnHubPathSectionIntro,
    adjacentHubs,
    faqItems,
    sections,
    allArticles: flattenUniqueArticles(sections),
  };
}
