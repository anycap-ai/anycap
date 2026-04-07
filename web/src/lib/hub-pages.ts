export type HubPageDefinition = {
  key: "for" | "guides" | "glossary" | "compare" | "learn";
  path: "/for" | "/guides" | "/glossary" | "/compare" | "/learn";
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
  for: {
    key: "for",
    path: "/for",
    title: "Equip Agents — Add missing capabilities to Claude Code, Cursor, Codex, and Manus",
    description:
      "Choose your agent and add the capability layer it does not ship with. Equip Claude Code, Cursor, Codex, and Manus with image, video, vision, and retrieval workflows through AnyCap.",
    eyebrow: "Equip Agents",
    heroLines: ["Keep the agent you use.", "Add the capabilities it lacks."],
    intro:
      "These pages show the shortest path to equip Claude Code, Cursor, Codex, and Manus with image generation, video generation, image understanding, video analysis, and related capability workflows through one runtime.",
    items: [
      {
        title: "Claude Code",
        href: "/for/claude-code",
        description: "Add image, video, and vision workflows to Claude Code through one install path.",
      },
      {
        title: "Cursor",
        href: "/for/cursor",
        description: "Equip Cursor with image generation, video generation, and visual analysis capabilities.",
      },
      {
        title: "Codex",
        href: "/for/codex",
        description: "Add multimodal capabilities to Codex without wiring separate provider SDKs.",
      },
      {
        title: "Manus",
        href: "/for/manus",
        description: "Give Manus a unified capability runtime for image, video, and vision tasks.",
      },
    ],
  },
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
      {
        title: "AnyCap vs OpenClaw Image Generation",
        href: "/compare/anycap-vs-openclaw-image-generation",
        description: "Compare one-key image access with a provider-key setup inside OpenClaw.",
      },
      {
        title: "AnyCap vs OpenClaw Video Generation",
        href: "/compare/anycap-vs-openclaw-video-generation",
        description: "Compare one-key video generation with a provider-key setup inside OpenClaw.",
      },
    ],
  },
  learn: {
    key: "learn",
    path: "/learn",
    title: "Learn — Buyer guides, assistant architecture, and workflow essays",
    description:
      "Read coding-agent buyer guides, SaaS assistant architecture explainers, and workflow essays about how capability runtimes improve practical work.",
    eyebrow: "Learn",
    heroLines: ["Buyer guides and explainers", "for modern assistants."],
    intro:
      "This section collects buyer guides for agent stacks, SaaS assistant architecture explainers, foundational capability-gap pages, and workflow proofs that show where AnyCap fits.",
    items: [
      {
        title: "Best AI for Coding Agents",
        href: "/learn/best-ai-for-coding-agents",
        description: "A cluster-anchor buyer guide on how to choose the right model and capability stack for coding agents.",
      },
      {
        title: "Best AI for Claude Code",
        href: "/learn/best-ai-for-claude-code",
        description: "A Claude Code specific buyer-guide page on when the best setup is Claude Code plus a capability layer.",
      },
      {
        title: "Best AI for Cursor",
        href: "/learn/best-ai-for-cursor",
        description: "A Cursor specific buyer-guide page on when the best setup is Cursor plus a capability layer.",
      },
      {
        title: "AI Chatbot SaaS vs AI Agent for SaaS",
        href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
        description: "A bridge explainer for teams deciding when a SaaS assistant is still a chatbot and when it has become an agent system.",
      },
      {
        title: "Add Multimodal Capabilities to a SaaS Chatbot",
        href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
        description: "An implementation guide for adding image, video, web, and delivery workflows around a SaaS assistant.",
      },
      {
        title: "What Is the Most Advanced AI?",
        href: "/learn/what-is-the-most-advanced-ai",
        description: "A product-aware explainer on why the most advanced AI is usually a stack, not a single model ranking.",
      },
      {
        title: "What Agents Can't Do",
        href: "/learn/what-agents-cant-do",
        description: "A practical look at the gaps between agent potential and production reality.",
      },
      {
        title: "SMART Goal Generator",
        href: "/learn/smart-goal-generator",
        description: "See how AnyCap turns Codex, Cursor, and Claude Code into a research-backed SMART goal writer.",
      },
    ],
  },
};
