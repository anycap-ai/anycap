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
  commitRestPose: (() => void) | null;
};

export type AgentCoreLegacyHeadTarget = {
  yaw: number;
  pitch: number;
  duration: number;
};

type AgentCoreLegacyGazeRuntime = {
  suspend: () => void;
  reconcile: () => void;
};

export type AgentCoreLegacyGazeOwnership = {
  readonly legacyEnabled: boolean;
  setStageReady: (ready: boolean) => void;
  attach: (runtime: AgentCoreLegacyGazeRuntime) => () => void;
};

export function createAgentCore3DBridge(): AgentCore3DBridge {
  return {
    phase: "awaiting",
    coreOwner: "dock",
    gazeMode: "user",
    pointer: { x: 0, y: 0, active: false },
    progress: 0,
    invalidate: null,
    commitRestPose: null,
  };
}

export function commitAgentCoreRestPoseBeforeConnected(
  bridge: Pick<AgentCore3DBridge, "commitRestPose">,
  enterConnected: () => void,
) {
  bridge.commitRestPose?.();
  enterConnected();
}

export function createAgentCoreLegacyGazeOwnership(): AgentCoreLegacyGazeOwnership {
  let legacyEnabled = true;
  let runtime: AgentCoreLegacyGazeRuntime | null = null;

  return {
    get legacyEnabled() {
      return legacyEnabled;
    },
    setStageReady(ready) {
      const nextLegacyEnabled = !ready;
      if (nextLegacyEnabled === legacyEnabled) return;
      legacyEnabled = nextLegacyEnabled;
      if (legacyEnabled) runtime?.reconcile();
      else runtime?.suspend();
    },
    attach(nextRuntime) {
      runtime = nextRuntime;
      if (!legacyEnabled) runtime.suspend();
      return () => {
        if (runtime === nextRuntime) runtime = null;
      };
    },
  };
}

export function resolveAgentCoreLegacyInstallGaze(
  timelineTime: number,
  activateTime: number,
  focus: AgentCoreLegacyHeadTarget,
): AgentCoreLegacyHeadTarget {
  if (Number.isFinite(timelineTime) && timelineTime >= activateTime) {
    return { yaw: 0, pitch: -2, duration: 0.34 };
  }
  return { ...focus };
}
