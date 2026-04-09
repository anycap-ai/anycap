export type HideBelow = "sm" | "md" | "lg" | "xl";

export type NavItem = {
  href: string;
  label: string;
  hideBelow?: HideBelow;
  variant?: "default" | "primary";
  external?: boolean;
};

export type NavDropdownItem = {
  href: string;
  label: string;
  section?: string;
  description?: string;
};

export type NavDropdownDef = {
  kind: "dropdown";
  label: string;
  href?: string;
  items: NavDropdownItem[];
  hideBelow?: HideBelow;
  align?: "left" | "right";
};

export type NavEntry = NavItem | NavDropdownDef;

export const capabilitiesDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Capabilities",
  href: "/capabilities",
  hideBelow: "sm",
  align: "left",
  items: [
    {
      href: "/capabilities/image-generation",
      label: "Image Generation",
      section: "Generate",
      description: "Create and edit images from prompts or references.",
    },
    {
      href: "/capabilities/video-generation",
      label: "Video Generation",
      section: "Generate",
      description: "Create motion outputs from text and image inputs.",
    },
    {
      href: "/capabilities/music-generation",
      label: "Music Generation",
      section: "Generate",
      description: "Produce music tracks through one runtime.",
    },
    {
      href: "/capabilities/image-understanding",
      label: "Image Understanding",
      section: "Understand",
      description: "Read screenshots, diagrams, and visual references.",
    },
    {
      href: "/capabilities/video-analysis",
      label: "Video Analysis",
      section: "Understand",
      description: "Inspect recordings and extract structured details.",
    },
    {
      href: "/capabilities/audio-understanding",
      label: "Audio Understanding",
      section: "Understand",
      description: "Transcribe and analyze voice and audio files.",
    },
    {
      href: "/capabilities/web-search",
      label: "Web Search",
      section: "Retrieve",
      description: "Search the web from the same agent workflow.",
    },
    {
      href: "/capabilities/grounded-web-search",
      label: "Grounded Web Search",
      section: "Retrieve",
      description: "Return synthesized answers with live citations.",
    },
    {
      href: "/capabilities/web-crawl",
      label: "Web Crawl",
      section: "Retrieve",
      description: "Fetch pages and convert them into clean content.",
    },
    {
      href: "/capabilities/drive",
      label: "Drive",
      section: "Store",
      description: "Store outputs, organize assets, and create public URLs.",
    },
  ],
};

export const equipAgentsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Equip Agents",
  href: "/for",
  items: [
    { href: "/for/claude-code", label: "Claude Code" },
    { href: "/for/cursor", label: "Cursor" },
    { href: "/for/codex", label: "Codex" },
    { href: "/for/manus", label: "Manus" },
  ],
  hideBelow: "md",
};

export const learnDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Learn",
  href: "/learn",
  items: [
    {
      href: "/cli",
      label: "CLI",
      section: "Product",
      description: "See the command surface agents use to call capabilities through one runtime.",
    },
    {
      href: "/skills",
      label: "Skills",
      section: "Product",
      description: "Learn how agent skills expose capabilities inside developer tools.",
    },
    {
      href: "/guides/install-anycap",
      label: "Install AnyCap",
      section: "Guides",
      description: "Set up the CLI, auth once, and verify the capability runtime is ready.",
    },
    {
      href: "/guides/context-engineering-for-agents",
      label: "Context Engineering",
      section: "Guides",
      description: "Understand how prompts, files, and workspace state shape agent behavior.",
    },
    {
      href: "/guides/agent-skills-for-developer-tools",
      label: "Agent Skills",
      section: "Guides",
      description: "See how reusable skills package workflows and capability usage for agents.",
    },
    {
      href: "/compare",
      label: "Compare Overview",
      section: "Evaluate",
      description: "Browse comparison pages for adjacent agent tooling, media APIs, and tradeoffs.",
    },
    {
      href: "/learn/what-agents-cant-do",
      label: "What Agents Can't Do",
      section: "Evaluate",
      description: "Read a practical explainer on where agents still struggle in production workflows.",
    },
    {
      href: "/learn/smart-goal-generator",
      label: "SMART Goal Generator",
      section: "Use Cases",
      description:
        "Turn rough goals into research-backed SMART goals with Codex, Cursor, or Claude Code.",
    },
    {
      href: "/learn/how-to-make-memes-online",
      label: "How to Make Memes Online",
      section: "Use Cases",
      description:
        "See a concrete creative workflow for generating the visual, keeping the caption exact, and delivering a meme.",
    },
  ],
  hideBelow: "md",
};

const sharedNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/pricing", label: "Pricing", hideBelow: "xl" },
  { href: "/about", label: "About", hideBelow: "xl" },
];

export const seoNavLinks = sharedNavLinks;
export const humanNavLinks = sharedNavLinks;
