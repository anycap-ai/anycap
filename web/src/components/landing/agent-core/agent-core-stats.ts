import {
  agentCoreCapabilityGroups,
  type AgentCoreCapabilityGroupId,
} from "@/lib/capability-inventory";

export type AgentCoreStat = {
  id: AgentCoreCapabilityGroupId;
  label: "Create" | "Understand" | "Search" | "Manage" | "Deliver";
  value: number;
  capabilities: readonly string[];
};

const labels: Record<AgentCoreCapabilityGroupId, AgentCoreStat["label"]> = {
  create: "Create",
  understand: "Understand",
  search: "Search",
  manage: "Manage",
  deliver: "Deliver",
};

export function getAgentCoreStats(): readonly AgentCoreStat[] {
  return agentCoreCapabilityGroups.map((group) => ({
    id: group.id,
    label: labels[group.id],
    value: group.capabilities.length,
    capabilities: group.capabilities,
  }));
}

export function formatAgentCoreValue(value: number): string {
  return String(value).padStart(2, "0");
}
