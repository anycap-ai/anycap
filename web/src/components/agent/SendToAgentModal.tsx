"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { type Agent, AGENT_ICON_CDN, getInstallPrompt } from "@/lib/agents";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function AgentIconSlot({ icon, size = 20 }: { icon: string | null; size?: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {icon ? (
        // Remote SVG icons from the agent catalog are tiny and numerous; keep a plain img here.
        // eslint-disable-next-line @next/next/no-img-element
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

/**
 * The inner card for the "send to agent" flow: header with back/close,
 * italic instruction, message box, copy button.
 *
 * Render this inside a portalled backdrop container. For a convenience
 * wrapper that handles portal + backdrop + transitions, use SendToAgentModal.
 */
export function SendToAgentPanel({
  agent,
  onBack,
  onClose,
}: {
  agent: Agent;
  onBack?: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(getInstallPrompt(agent));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="bg-[#f4f5f0] rounded-xl shadow-2xl shadow-black/20 overflow-hidden w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4dbb8]">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#9a9e90] hover:text-[#1c1f17] transition-colors p-1 mr-1"
            >
              <svg width="14" height="14" viewBox="0 0 12 12">
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
          )}
          <AgentIconSlot icon={agent.icon} size={24} />
          <span
            className="text-[#1c1f17] text-[14px] tracking-[0.8px]"
            style={mono}
          >
            Send to {agent.name}
          </span>
        </div>
        <button
          onClick={onClose}
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

      {/* Body */}
      <div className="p-6">
        <p
          className="italic font-bold text-[#6b7d3a] text-[13px] leading-snug mb-3.5 tracking-[0.2px]"
          style={mono}
        >
          Just send this message to your {agent.name} — it will install AnyCap automatically.
        </p>
        <div className="bg-white rounded-lg p-5 mb-5 border border-[#d4dbb8]">
          <p
            className="text-[#1c1f17] text-[15px] leading-relaxed"
            style={mono}
          >
            {getInstallPrompt(agent)}
          </p>
        </div>
        <button
          onClick={copy}
          className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#6b7d3a] hover:bg-[#8fa34e] text-[#f4f5f0] text-[13px] font-bold tracking-[0.5px] rounded-lg transition-colors"
          style={mono}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/**
 * Full-screen modal that renders SendToAgentPanel inside a portalled,
 * blurred backdrop. Use this when you already have an agent selected
 * and just need to show the send flow.
 */
export function SendToAgentModal({
  open,
  agent,
  onClose,
}: {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open && agent) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open, agent]);

  // Lock body scroll while the modal is mounted.
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mounted]);

  if (!mounted || !agent) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Blur backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-250 ease-out ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-[520px] mx-4 transition-all duration-250 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}`}
      >
        <SendToAgentPanel agent={agent} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
