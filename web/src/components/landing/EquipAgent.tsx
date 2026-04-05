"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { type Agent, agents, AGENT_ICON_CDN, getInstallPrompt } from "@/lib/agents";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

function AgentIconSlot({ icon, size = 20 }: { icon: string | null; size?: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {icon ? (
        <img src={`${AGENT_ICON_CDN}/${icon}`} alt="" width={size} height={size} />
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

export function EquipAgent({ label = "Equip your Agent" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback(() => {
    setSelectedAgent(null);
    setCopied(false);
    setOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setOpen(false);
      setSelectedAgent(null);
      setCopied(false);
    }, 250);
  }, []);

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

  // Listen for custom event from terminal click (stopImmediatePropagation
  // prevents other EquipAgent instances from also opening their modal)
  useEffect(() => {
    const handler = (e: Event) => {
      e.stopImmediatePropagation();
      openModal();
    };
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
        className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#8fa34e] text-white text-[13px] font-bold tracking-[1px] hover:bg-[#6b7d3a] transition-all shadow-[0_4px_16px_rgba(143,163,78,0.35)] hover:shadow-[0_6px_24px_rgba(107,125,58,0.4)]"
        style={mono}
      >
        {label}
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

      {/* Modal overlay — portalled to body to escape stacking contexts */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Blur backdrop */}
          <div
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-250 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={closeModal}
          />

          {/* Modal content */}
          <div className={`relative z-10 w-full max-w-[400px] mx-4 transition-all duration-250 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}`}>
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
                    className={`pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1 pt-6 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-xl transition-opacity duration-200 ${atBottom ? "opacity-0" : "opacity-100"
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
              <div className="bg-[#f4f5f0] rounded-xl shadow-2xl shadow-black/20 overflow-hidden w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dbb8]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={backToPicker}
                      className="text-[#9a9e90] hover:text-[#1c1f17] transition-colors p-1 mr-1"
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
                      className="text-[#1c1f17] text-[11px] tracking-[1px]"
                      style={mono}
                    >
                      Send to {selectedAgent.name}
                    </span>
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

                {/* Command body */}
                <div className="p-5">
                  <div className="bg-white rounded-lg p-4 mb-4 border border-[#d4dbb8]">
                    <p
                      className="text-[#1c1f17] text-[13px] leading-relaxed"
                      style={mono}
                    >
                      {getInstallPrompt(selectedAgent)}
                    </p>
                  </div>
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
        </div>,
        document.body
      )}
    </>
  );
}
