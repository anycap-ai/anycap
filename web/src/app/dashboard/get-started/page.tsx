"use client";

export const runtime = "edge";

import { useState } from "react";
import { type Agent, agents, AGENT_ICON_CDN, getInstallPrompt } from "@/lib/agents";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";

function AgentIcon({ icon, size = 20 }: { icon: string | null; size?: number }) {
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

export default function GetStartedPage() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(getInstallPrompt(selected));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setSelected(null);
    }, 1200);
  };

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1c1f17] mb-3 tracking-tight">
        Get started
      </h1>
      <p className="text-[15px] text-[#4d5145] mb-10 max-w-[560px] leading-relaxed">
        Pick your agent, copy the prompt, and send it.
        Your agent will set up AnyCap and you&apos;ll see activity here once it&apos;s running.
      </p>

      {/* Agent list */}
      <div className="border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        {agents.map((agent, i) => (
          <button
            key={agent.name}
            onClick={() => setSelected(agent)}
            className={`flex items-center gap-3.5 w-full px-6 py-4 text-left transition-colors hover:bg-[#fafbf8] ${
              i > 0 ? "border-t border-[#eceee7]" : ""
            }`}
          >
            <AgentIcon icon={agent.icon} />
            <span className="text-[15px] font-medium text-[#1c1f17]">
              {agent.name}
            </span>
          </button>
        ))}
      </div>

      {/* Copy prompt modal */}
      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setCopied(false); }}
        title={selected ? `Send to ${selected.name}` : ""}
        panelClassName="bg-[#f4f5f0]"
      >
        {selected && (
          <>
            <div className="rounded-xl bg-white border border-[#dce0d2] px-5 py-4">
              <p className="text-[14px] text-[#1c1f17] leading-relaxed">
                {getInstallPrompt(selected)}
              </p>
            </div>
            <ModalActions>
              <ModalButton variant="primary" onClick={copy}>
                {copied ? "Copied!" : "Copy prompt"}
              </ModalButton>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
}
