export type AgentCoreInstallPhase =
  | "awaiting"
  | "targeting"
  | "reaching"
  | "grasping"
  | "carrying"
  | "docking"
  | "activating"
  | "returning"
  | "connected";

export type CoreOwner = "dock" | "hand" | "socket";

export type AgentCoreInstallState = {
  phase: AgentCoreInstallPhase;
  coreOwner: CoreOwner;
  started: boolean;
};

export type AgentCoreInstallEvent =
  | "activate"
  | "targeted"
  | "reached"
  | "grasped"
  | "carried"
  | "docked"
  | "activated"
  | "returned";

export type InstallPhaseTiming = {
  phase: Exclude<AgentCoreInstallPhase, "awaiting" | "connected">;
  start: number;
  end: number;
};

export type InstallWaypoint = { x: number; y: number; z: number };

export const INSTALL_PHASES: readonly InstallPhaseTiming[] = [
  { phase: "targeting", start: 0, end: 0.25 },
  { phase: "reaching", start: 0.18, end: 0.85 },
  { phase: "grasping", start: 0.78, end: 1.05 },
  { phase: "carrying", start: 1, end: 1.75 },
  { phase: "docking", start: 1.68, end: 2.05 },
  { phase: "activating", start: 2, end: 2.45 },
  { phase: "returning", start: 2.35, end: 3 },
];

export const INSTALL_WAYPOINTS: Readonly<Record<
  "dock" | "preGrip" | "grip" | "carryApex" | "preSocket" | "socket" | "rest",
  InstallWaypoint
>> = {
  dock: { x: 0.92, y: -0.72, z: 0.38 },
  preGrip: { x: 0.78, y: -0.38, z: 0.54 },
  grip: { x: 0.92, y: -0.7, z: 0.38 },
  carryApex: { x: 0.46, y: 0.32, z: 0.5 },
  preSocket: { x: 0.12, y: 0.08, z: 0.7 },
  socket: { x: 0, y: -0.04, z: 0.76 },
  rest: { x: 0.58, y: -0.5, z: 0.3 },
};

export const INSTALL_TRANSITIONS: Readonly<
  Record<AgentCoreInstallPhase, Partial<Record<AgentCoreInstallEvent, AgentCoreInstallPhase>>>
> = {
  awaiting: { activate: "targeting" },
  targeting: { targeted: "reaching" },
  reaching: { reached: "grasping" },
  grasping: { grasped: "carrying" },
  carrying: { carried: "docking" },
  docking: { docked: "activating" },
  activating: { activated: "returning" },
  returning: { returned: "connected" },
  connected: {},
};

const CORE_OWNER_BY_PHASE: Readonly<Record<AgentCoreInstallPhase, CoreOwner>> = {
  awaiting: "dock",
  targeting: "dock",
  reaching: "dock",
  grasping: "dock",
  carrying: "hand",
  docking: "hand",
  activating: "socket",
  returning: "socket",
  connected: "socket",
};

export function initialInstallState(): AgentCoreInstallState {
  return { phase: "awaiting", coreOwner: "dock", started: false };
}

export function nextInstallState(
  state: AgentCoreInstallState,
  event: AgentCoreInstallEvent,
  options: { reducedMotion?: boolean } = {},
): AgentCoreInstallState {
  if (event === "activate" && !state.started && options.reducedMotion) {
    return { phase: "connected", coreOwner: "socket", started: true };
  }

  const nextPhase = INSTALL_TRANSITIONS[state.phase][event];
  if (!nextPhase) return state;

  return {
    phase: nextPhase,
    coreOwner: CORE_OWNER_BY_PHASE[nextPhase],
    started: true,
  };
}
