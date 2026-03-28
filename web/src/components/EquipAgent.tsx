"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const ICON_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

interface Agent {
  name: string;
  icon: string | null; // SVG filename on CDN
  slug: string | null; // skills CLI agent slug for -a flag
}

const agents: Agent[] = [
  { name: "Cursor", icon: "cursor.svg", slug: "cursor" },
  { name: "Claude Code", icon: "claudecode-color.svg", slug: "claude-code" },
  { name: "Codex", icon: "codex-color.svg", slug: "codex" },
  { name: "Antigravity", icon: "antigravity-color.svg", slug: "antigravity" },
  { name: "OpenCode", icon: "opencode.svg", slug: "opencode" },
  { name: "OpenClaw", icon: "openclaw-color.svg", slug: "openclaw" },
  { name: "V0", icon: "v0.svg", slug: "v0" },
  { name: "Lovable", icon: "lovable-color.svg", slug: "lovable" },
  { name: "Replit", icon: "replit-color.svg", slug: "replit" },
  { name: "Other Agent", icon: null, slug: null },
];

function getInstallPrompt(agent: Agent): string {
  const agentFlag = agent.slug ? ` -a ${agent.slug}` : "";
  return `Help me set up AnyCap — first install the skill with "npx -y skills add anycap-ai/anycap${agentFlag} -y", then install the CLI with "curl -fsSL https://anycap.ai/install.sh | sh", and run anycap login to connect my account. After that you'll have image, video, music, speech, search, and crawl capabilities ready to use.`;
}

function AgentIconSlot({ icon }: { icon: string | null }) {
  return (
    <span className="shrink-0 w-5 h-5 flex items-center justify-center">
      {icon ? (
        <img src={`${ICON_CDN}/${icon}`} alt="" width={20} height={20} />
      ) : (
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="#9a9e90" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="9" cy="9" r="2" fill="#9a9e90" />
        </svg>
      )}
    </span>
  );
}

export function EquipAgent() {
  const [showAgents, setShowAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep last selected agent so panel content persists during exit animation
  const lastAgentRef = useRef<Agent | null>(null);
  if (selectedAgent) lastAgentRef.current = selectedAgent;
  const displayAgent = selectedAgent ?? lastAgentRef.current;

  const dropdownOpen = showAgents && !selectedAgent;
  const panelOpen = !!selectedAgent;

  const open = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (!selectedAgent) setShowAgents(true);
  }, [selectedAgent]);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setShowAgents(false), 200);
  }, []);

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgents(false);
  };

  const close = () => {
    setSelectedAgent(null);
    setShowAgents(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(getInstallPrompt(selectedAgent!));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      close();
    }, 1200);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (selectedAgent || showAgents) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedAgent, showAgents]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onClick={() => (selectedAgent ? close() : setShowAgents((v) => !v))}
        className="flex items-center gap-3 px-8 py-4 bg-[#6b7d3a] text-[#f4f5f0] text-[13px] font-bold tracking-[1px] hover:bg-[#1c1f17] transition-colors"
        style={mono}
      >
        Equip your Agent
        <svg width="6" height="10" viewBox="0 0 6 10" className="opacity-60">
          <path
            d="M1 1l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {/* Agent dropdown — always in DOM, animated via CSS */}
      <div
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        className={`absolute left-full top-0 ml-2 bg-white rounded-xl p-1.5 min-w-[220px] z-30
          transition-all duration-200 origin-left
          ${dropdownOpen
            ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-x-2 scale-95 pointer-events-none"
          }`}
      >
        {agents.map((agent, i) => (
          <button
            key={agent.name}
            onClick={() => selectAgent(agent)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left hover:bg-[#f4f5f0]"
            style={{
              transitionProperty: "opacity, transform, background-color",
              transitionDuration: "200ms, 200ms, 150ms",
              transitionTimingFunction: "ease, ease, ease",
              transitionDelay: dropdownOpen ? `${i * 25}ms` : "0ms",
              opacity: dropdownOpen ? 1 : 0,
              transform: dropdownOpen ? "translateX(0)" : "translateX(-4px)",
            }}
          >
            <AgentIconSlot icon={agent.icon} />
            <span className="text-[#1c1f17] text-[13px]" style={mono}>
              {agent.name}
            </span>
          </button>
        ))}
      </div>

      {/* Command panel — always in DOM, animated via CSS */}
      <div
        className={`absolute left-full top-0 ml-2 bg-[#1c1f17] rounded-xl w-[420px] shadow-2xl shadow-black/30 z-30 overflow-hidden
          transition-all duration-200 origin-left
          ${panelOpen
            ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-x-2 scale-95 pointer-events-none"
          }`}
      >
        {displayAgent && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2e22]">
              <div className="flex items-center gap-2">
                <AgentIconSlot icon={displayAgent.icon} />
                <span
                  className="text-[#d4e0a4] text-[11px] tracking-[1px]"
                  style={mono}
                >
                  Send to {displayAgent.name}
                </span>
              </div>
              <button
                onClick={close}
                className="text-[#6b705f] hover:text-[#d4e0a4] transition-colors p-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    d="M2 2l8 8M10 2l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Command body */}
            <div className="p-5">
              <p
                className="text-[#d4e0a4] text-[13px] leading-relaxed mb-4"
                style={mono}
              >
                {getInstallPrompt(displayAgent!)}
              </p>
              <button
                onClick={copy}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#6b7d3a] hover:bg-[#8fa34e] text-[#f4f5f0] text-[11px] font-bold tracking-[0.5px] rounded-lg transition-colors"
                style={mono}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
