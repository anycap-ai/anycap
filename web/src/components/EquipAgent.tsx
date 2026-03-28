"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

function AgentIconSlot({ icon, size = 20 }: { icon: string | null; size?: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {icon ? (
        <img src={`${ICON_CDN}/${icon}`} alt="" width={size} height={size} />
      ) : (
        <svg width={size - 2} height={size - 2} viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="#9a9e90" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="9" cy="9" r="2" fill="#9a9e90" />
        </svg>
      )}
    </span>
  );
}

export const EQUIP_MODAL_EVENT = "openEquipModal";

export function EquipAgent() {
  const [open, setOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback(() => {
    setSelectedAgent(null);
    setCopied(false);
    setOpen(true);
  }, []);

  const closeModal = () => {
    setOpen(false);
    setSelectedAgent(null);
    setCopied(false);
  };

  const backToPicker = () => {
    setSelectedAgent(null);
    setCopied(false);
  };

  const copy = async () => {
    if (!selectedAgent) return;
    await navigator.clipboard.writeText(getInstallPrompt(selectedAgent));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      closeModal();
    }, 1200);
  };

  // Listen for custom event from terminal click
  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener(EQUIP_MODAL_EVENT, handler);
    return () => window.removeEventListener(EQUIP_MODAL_EVENT, handler);
  }, [openModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="flex items-center gap-3 px-8 py-4 rounded bg-[#8fa34e] text-white text-[13px] font-bold tracking-[1px] hover:bg-[#6b7d3a] transition-all shadow-[0_4px_16px_rgba(143,163,78,0.35)] hover:shadow-[0_6px_24px_rgba(107,125,58,0.4)]"
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

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Blur backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-[400px] mx-4">
            {!selectedAgent ? (
              /* ── Agent picker ── */
              <div className="bg-white rounded-xl p-2 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <div>
                    <span
                      className="text-[#1c1f17] text-[13px] font-bold tracking-[0.5px]"
                      style={mono}
                    >
                      Which agent are you using?
                    </span>
                    <p className="text-[#9a9e90] text-[11px] mt-0.5" style={mono}>
                      We&apos;ll generate a setup prompt you can paste in.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-[#9a9e90] hover:text-[#1c1f17] transition-colors p-1"
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
                <div className="relative">
                  <div
                    ref={listRef}
                    className="max-h-[300px] overflow-y-auto scrollbar-visible"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
                    }}
                  >
                    {agents.map((agent) => (
                      <button
                        key={agent.name}
                        onClick={() => setSelectedAgent(agent)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-[#f4f5f0] transition-colors"
                      >
                        <AgentIconSlot icon={agent.icon} />
                        <span className="text-[#1c1f17] text-[13px]" style={mono}>
                          {agent.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Scroll hint arrow */}
                  <div
                    className={`pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1 pt-6 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-xl transition-opacity duration-200 ${
                      atBottom ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <svg width="16" height="10" viewBox="0 0 16 10" className="text-[#9a9e90] animate-bounce">
                      <path
                        d="M2 2l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Prompt panel ── */
              <div className="bg-[#1c1f17] rounded-xl shadow-2xl shadow-black/30 overflow-hidden w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2e22]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={backToPicker}
                      className="text-[#6b705f] hover:text-[#d4e0a4] transition-colors p-1 mr-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path
                          d="M8 2L4 6l4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                    <AgentIconSlot icon={selectedAgent.icon} />
                    <span
                      className="text-[#d4e0a4] text-[11px] tracking-[1px]"
                      style={mono}
                    >
                      Send to {selectedAgent.name}
                    </span>
                  </div>
                  <button
                    onClick={closeModal}
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
                    {getInstallPrompt(selectedAgent)}
                  </p>
                  <button
                    onClick={copy}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#6b7d3a] hover:bg-[#8fa34e] text-[#f4f5f0] text-[11px] font-bold tracking-[0.5px] rounded-lg transition-colors"
                    style={mono}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
