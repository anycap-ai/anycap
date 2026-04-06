"use client";

export const runtime = "edge";

import { useState } from "react";
import { type Agent, agents } from "@/lib/agents";
import { AgentIconSlot, SendToAgentModal } from "@/components/agent/SendToAgentModal";

export default function GetStartedPage() {
  const [selected, setSelected] = useState<Agent | null>(null);

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
            <AgentIconSlot icon={agent.icon} />
            <span className="text-[15px] font-medium text-[#1c1f17]">
              {agent.name}
            </span>
          </button>
        ))}
      </div>

      <SendToAgentModal
        open={!!selected}
        agent={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
