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
    title: "Equip Agents | Add Missing Capabilities to AI Agents",
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
      "Browse AnyCap guides for installation, agent context engineering, tool wiring, and implementation patterns for agent users, creators, and builders.",
    eyebrow: "Guides",
    heroLines: ["Practical guides", "for agent teams and creators."],
    intro:
      "These guides cover setup, context design, tool integration, and working patterns for teams and creators using agents with AnyCap.",
    items: [
      {
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        description: "Install the CLI, authenticate once, and verify the capability runtime is ready.",
      },
      {
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        description: "Understand when you need the protocol layer, the instruction layer, or both for an agent workflow.",
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
    title: "Compare — AnyCap vs agent tooling and media API platforms",
    description:
      "Compare AnyCap with adjacent agent tooling, model APIs, and media platforms so teams can choose the right layer of the stack.",
    eyebrow: "Compare",
    heroLines: ["Compare AnyCap", "to the right stack layer."],
    intro:
      "These comparisons help teams decide when a capability runtime is a better fit than stitching together model APIs, hosted builders, or human-oriented tool surfaces.",
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
        title: "AnyCap vs Replicate",
        href: "/compare/anycap-vs-replicate",
        description: "Compare an agent capability runtime with a model-inference API and deployment platform.",
      },
      {
        title: "AnyCap vs fal.ai",
        href: "/compare/anycap-vs-fal-ai",
        description: "Compare cross-agent capability access with a queue-first generative media API stack.",
      },
      {
        title: "AnyCap vs OpenClaw (Image)",
        href: "/compare/anycap-vs-openclaw-image-generation",
        description: "Compare agent-native image generation with a human-facing AI image editing interface.",
      },
      {
        title: "AnyCap vs OpenClaw (Video)",
        href: "/compare/anycap-vs-openclaw-video-generation",
        description: "Compare agent-native video generation with a human-facing AI video creation interface.",
      },
    ],
  },
  learn: {
    key: "learn",
    path: "/learn",
    title: "Learn — Decision guides, assistant architecture, and real workflows",
    description:
      "Browse coding-agent stack guides, AI product explainers, capability-gap primers, and real workflows that show where AnyCap fits.",
    eyebrow: "Learn",
    heroLines: ["Decision guides and workflows", "for modern agent teams."],
    intro:
      "This section groups coding-agent buyer guides, AI product architecture explainers, capability-gap pages, and concrete workflows so readers can start with the question they are actually asking.",
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
      {
        title: "How to Make Memes Online",
        href: "/learn/how-to-make-memes-online",
        description: "The anchor workflow for the creative meme cluster, focused on generating the base visual and keeping the caption exact.",
      },
    ],
  },
};
