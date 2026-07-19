import { type NavIconKey } from "@/components/layout/NavIcon";

export type HideBelow = "sm" | "md" | "lg" | "xl";

export type NavItem = {
  href: string;
  label: string;
  icon?: NavIconKey;
  hideBelow?: HideBelow;
  variant?: "default" | "primary";
  external?: boolean;
};

export type NavDropdownItem = {
  href: string;
  label: string;
  icon?: NavIconKey;
  section?: string;
  description?: string;
};

export type NavDropdownDef = {
  kind: "dropdown";
  label: string;
  icon?: NavIconKey;
  href?: string;
  items: NavDropdownItem[];
  hideBelow?: HideBelow;
  align?: "left" | "right";
};

export type NavEntry = NavItem | NavDropdownDef;

export const capabilitiesDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Capabilities",
  icon: "capabilities",
  href: "/capabilities",
  hideBelow: "sm",
  align: "left",
  items: [
    {
      href: "/capabilities/image-generation",
      label: "Image Generation",
      icon: "image-generation",
      section: "Generate",
      description: "Create and edit images from prompts or references.",
    },
    {
      href: "/capabilities/video-generation",
      label: "Video Generation",
      icon: "video-generation",
      section: "Generate",
      description: "Create motion outputs from text and image inputs.",
    },
    {
      href: "/capabilities/music-generation",
      label: "Music Generation",
      icon: "music-generation",
      section: "Generate",
      description: "Produce music tracks through one runtime.",
    },
    {
      href: "/capabilities",
      label: "Audio Generation",
      icon: "audio-generation",
      section: "Generate",
      description:
        "Generate speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input.",
    },
    {
      href: "/capabilities/image-understanding",
      label: "Image Understanding",
      icon: "image-understanding",
      section: "Understand",
      description: "Read screenshots, diagrams, and visual references.",
    },
    {
      href: "/capabilities/video-analysis",
      label: "Video Analysis",
      icon: "video-analysis",
      section: "Understand",
      description: "Inspect recordings and extract structured details.",
    },
    {
      href: "/capabilities/audio-understanding",
      label: "Audio Understanding",
      icon: "audio-understanding",
      section: "Understand",
      description: "Transcribe and analyze voice and audio files.",
    },
    {
      href: "/capabilities/web-search",
      label: "Web Search",
      icon: "web-search",
      section: "Retrieve",
      description: "Search the web from the same agent workflow.",
    },
    {
      href: "/capabilities/grounded-web-search",
      label: "Grounded Web Search",
      icon: "grounded-web-search",
      section: "Retrieve",
      description: "Return synthesized answers with live citations.",
    },
    {
      href: "/capabilities/web-crawl",
      label: "Web Crawl",
      icon: "web-crawl",
      section: "Retrieve",
      description: "Fetch pages and convert them into clean content.",
    },
    {
      href: "/capabilities/drive",
      label: "Drive",
      icon: "drive",
      section: "Store",
      description: "Store outputs, organize assets, and create public URLs.",
    },
  ],
};

export const equipAgentsDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Equip Agents",
  icon: "equip-agents",
  href: "/for",
  items: [
    { href: "/for/claude-code", label: "Claude Code", icon: "claude-code" },
    { href: "/for/cursor", label: "Cursor", icon: "cursor" },
    { href: "/for/codex", label: "Codex", icon: "codex" },
    { href: "/for/manus", label: "Manus", icon: "manus" },
  ],
  hideBelow: "md",
};

export const learnDropdown: NavDropdownDef = {
  kind: "dropdown",
  label: "Learn",
  icon: "learn",
  href: "/learn",
  items: [
    {
      href: "/cli",
      label: "CLI",
      icon: "cli",
      section: "Product",
      description: "See the command surface agents use to call capabilities through one runtime.",
    },
    {
      href: "/skills",
      label: "Skills",
      icon: "agent-skills",
      section: "Product",
      description: "Learn how agent skills expose capabilities inside developer tools.",
    },
    {
      href: "/start",
      label: "Get Started",
      icon: "get-started",
      section: "Guides",
      description: "Set up the CLI, auth once, and verify the capability runtime is ready.",
    },
    {
      href: "/guides/context-engineering-for-agents",
      label: "Context Engineering",
      icon: "context-engineering",
      section: "Guides",
      description: "Understand how prompts, files, and workspace state shape agent behavior.",
    },
    {
      href: "/guides/agent-skills-for-developer-tools",
      label: "Agent Skills",
      icon: "agent-skills",
      section: "Guides",
      description: "See how reusable skills package workflows and capability usage for agents.",
    },
    {
      href: "/compare",
      label: "Compare Overview",
      icon: "compare",
      section: "Evaluate",
      description: "Browse comparison pages for adjacent agent tooling, media APIs, and tradeoffs.",
    },
    {
      href: "/learn/what-agents-cant-do",
      label: "Most Advanced AI",
      icon: "capabilities",
      section: "Evaluate",
      description: "Separate model capability from workflow and runtime capability decisions.",
    },
    {
      href: "/learn/smart-goal-generator",
      label: "SMART Goal Generator",
      icon: "smart-goal",
      section: "Use Cases",
      description:
        "Turn rough goals into research-backed SMART goals with Codex, Cursor, or Claude Code.",
    },
  ],
  hideBelow: "md",
};

const sharedNavLinks: NavEntry[] = [
  capabilitiesDropdown,
  equipAgentsDropdown,
  learnDropdown,
  { href: "/pricing", label: "Pricing", icon: "pricing", hideBelow: "xl" },
  { href: "/about", label: "About", icon: "about", hideBelow: "xl" },
];

export const seoNavLinks = sharedNavLinks;
export const humanNavLinks = sharedNavLinks;
