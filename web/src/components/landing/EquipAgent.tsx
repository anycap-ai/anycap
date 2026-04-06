"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { type Agent, agents } from "@/lib/agents";
import { AgentIconSlot, SendToAgentPanel } from "@/components/agent/SendToAgentModal";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const EQUIP_MODAL_EVENT = "openEquipModal";

export function EquipAgent({ label = "Equip your Agent" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback(() => {
    setSelectedAgent(null);
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
    }, 250);
  }, []);

  const backToPicker = () => {
    setSelectedAgent(null);
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
          <div className={`relative z-10 w-full max-w-[520px] mx-4 transition-all duration-250 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}`}>
            {!selectedAgent ? (
              /* ── Agent picker ── */
              <div className="bg-white rounded-xl p-2.5 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div>
                    <span
                      className="text-[#1c1f17] text-[15px] font-bold tracking-[0.5px]"
                      style={mono}
                    >
                      Which agent are you using?
                    </span>
                    <p className="text-[#9a9e90] text-[12px] mt-1" style={mono}>
                      We&apos;ll generate a setup prompt you can paste in.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-[#9a9e90] hover:text-[#1c1f17] transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 12 12">
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
                    className="max-h-[360px] overflow-y-auto scrollbar-visible"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
                    }}
                  >
                    {agents.map((agent) => (
                      <button
                        key={agent.name}
                        onClick={() => setSelectedAgent(agent)}
                        className="flex items-center gap-3.5 px-5 py-3.5 rounded-lg w-full text-left hover:bg-[#f4f5f0] transition-colors"
                      >
                        <AgentIconSlot icon={agent.icon} size={24} />
                        <span className="text-[#1c1f17] text-[14px]" style={mono}>
                          {agent.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Scroll hint arrow */}
                  <div
                    className={`pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1.5 pt-7 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-xl transition-opacity duration-200 ${atBottom ? "opacity-0" : "opacity-100"
                      }`}
                  >
                    <svg width="18" height="12" viewBox="0 0 16 10" className="text-[#9a9e90] animate-bounce">
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
              <SendToAgentPanel
                agent={selectedAgent}
                onBack={backToPicker}
                onClose={closeModal}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
