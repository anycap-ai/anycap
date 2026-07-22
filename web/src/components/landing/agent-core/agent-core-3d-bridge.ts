import type {
  AgentCoreInstallPhase,
  CoreOwner,
} from "./agent-core-install-state";

export type GazeMode = "user" | "core" | "socket" | "neutral";

export type AgentCore3DBridge = {
  phase: AgentCoreInstallPhase;
  coreOwner: CoreOwner;
  gazeMode: GazeMode;
  pointer: { x: number; y: number; active: boolean };
  progress: number;
  invalidate: (() => void) | null;
};

export function createAgentCore3DBridge(): AgentCore3DBridge {
  return {
    phase: "awaiting",
    coreOwner: "dock",
    gazeMode: "user",
    pointer: { x: 0, y: 0, active: false },
    progress: 0,
    invalidate: null,
  };
}
