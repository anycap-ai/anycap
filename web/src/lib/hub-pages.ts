export type HubPageDefinition = {
  key: "guides" | "glossary" | "compare" | "learn";
  path: "/guides" | "/glossary" | "/compare" | "/learn";
  title: string;
  description: string;
  eyebrow: string;
  heroLines: [string, string];
  intro: string;
  items: Array<{
    title: string;
    href: string;
    description: string;
  }>;
};

export const hubPages: Record<HubPageDefinition["key"], HubPageDefinition> = {
  guides: {
    key: "guides",
    path: "/guides",
    title: "Guides — Practical setup and implementation help for AnyCap",
    description:
      "Browse AnyCap guides for installation, agent context engineering, tool wiring, and implementation patterns for developer tools.",
    eyebrow: "Guides",
    heroLines: ["Practical guides", "for agent teams."],
    intro:
      "These guides cover setup, context design, tool integration, and working patterns for teams building agents with AnyCap.",
    items: [
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        description: "Install the CLI, authenticate once, and verify the capability runtime is ready.",
      },
      {
        title: "Add Tools to Claude Code",
        href: "/guides/add-tools-to-claude-code",
        description: "Wire AnyCap into Claude Code so agents can call multimodal tools directly.",
      },
      {
        title: "Context Engineering for Agents",
        href: "/guides/context-engineering-for-agents",
        description: "Structure prompts, files, and working context so agents stay grounded and useful.",
      },
      {
        title: "Agent Skills for Developer Tools",
        href: "/guides/agent-skills-for-developer-tools",
        description: "Use reusable skills to keep agent workflows consistent across projects.",
      },
      {
        title: "Workspace Context Engineering",
        href: "/guides/workspace-context-engineering",
        description: "Design workspace-level context so long-running coding agents stay oriented.",
      },
      {
        title: "What Is Agent Harness?",
        href: "/guides/what-is-agent-harness",
        description: "Understand the execution layer that turns tool access into dependable agent behavior.",
      },
    ],
  },
  glossary: {
    key: "glossary",
    path: "/glossary",
    title: "Glossary — Core concepts behind AnyCap and agent tooling",
    description:
      "Read concise definitions for core AnyCap and agent-tooling concepts such as context engineering, agent harnesses, and capability runtimes.",
    eyebrow: "Glossary",
    heroLines: ["Shared language", "for agent systems."],
    intro:
      "Use these glossary entries to align teams on the terms behind capability runtimes, harnesses, and context design.",
    items: [
      {
        title: "Context Engineering",
        href: "/glossary/context-engineering",
        description: "The practice of shaping inputs, files, and memory so an agent can work reliably.",
      },
      {
        title: "Agent Harness",
        href: "/glossary/agent-harness",
        description: "The execution environment that manages tools, files, prompts, and agent safety rails.",
      },
      {
        title: "Agent Capability Runtime",
        href: "/glossary/agent-capability-runtime",
        description: "A runtime layer that gives agents a stable way to call capabilities across providers.",
      },
    ],
  },
  compare: {
    key: "compare",
    path: "/compare",
    title: "Compare — AnyCap vs other agent tooling approaches",
    description:
      "Compare AnyCap with adjacent agent tooling approaches and understand where a capability runtime fits best.",
    eyebrow: "Compare",
    heroLines: ["Compare AnyCap", "to adjacent tools."],
    intro:
      "These comparisons help teams decide when a capability runtime is a better fit than stitching together human-oriented tools.",
    items: [
      {
        title: "AnyCap vs Composio",
        href: "/compare/anycap-vs-composio",
        description: "Compare capability-runtime design with app-connector style integrations.",
      },
      {
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        description: "See where AnyCap fits alongside hosted agent-building workflows.",
      },
    ],
  },
  learn: {
    key: "learn",
    path: "/learn",
    title: "Learn — Essays and explainers for agent limitations and workflows",
    description:
      "Read explainers about what agents can and cannot do well, and how capability runtimes improve practical workflows.",
    eyebrow: "Learn",
    heroLines: ["Learn the edges", "of agent work."],
    intro:
      "This section collects explainers about agent constraints, tradeoffs, and the workflows that benefit from better tooling.",
    items: [
      {
        title: "What Agents Can't Do",
        href: "/learn/what-agents-cant-do",
        description: "A practical look at the gaps between agent potential and production reality.",
      },
    ],
  },
};
