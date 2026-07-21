export type AgentCorePhase = "awaiting" | "dragging" | "installing" | "connected";
export type AgentCoreEvent =
  | "drag-start"
  | "drop-rejected"
  | "drop-accepted"
  | "install-complete";

type Point = { x: number; y: number };
type Rect = { left: number; top: number; width: number; height: number };

export type AgentCorePointerSession = {
  pointerId: number;
  kind: "drag" | "touch";
};

type AgentCorePointerStart = {
  pointerId: number;
  pointerType: string;
  isPrimary: boolean;
  button: number;
};

type AgentCorePointerFinish = {
  pointerId: number;
  reason: "up" | "cancel" | "lost-capture";
  moved: boolean;
  dropAccepted: boolean;
};

type AgentCorePointerStartResult = {
  session: AgentCorePointerSession | null;
  action: "ignore" | "capture-drag" | "capture-touch";
};

type AgentCorePointerFinishResult = {
  session: AgentCorePointerSession | null;
  action: "ignore" | "install" | "return-dock" | "close";
};

export function beginAgentCorePointerSession(
  activeSession: AgentCorePointerSession | null,
  event: AgentCorePointerStart,
): AgentCorePointerStartResult {
  if (activeSession || !event.isPrimary) {
    return { session: activeSession, action: "ignore" };
  }
  if (event.pointerType === "touch") {
    return {
      session: { pointerId: event.pointerId, kind: "touch" },
      action: "capture-touch",
    };
  }
  if ((event.pointerType === "mouse" || event.pointerType === "pen") && event.button === 0) {
    return {
      session: { pointerId: event.pointerId, kind: "drag" },
      action: "capture-drag",
    };
  }
  return { session: null, action: "ignore" };
}

export function finishAgentCorePointerSession(
  activeSession: AgentCorePointerSession | null,
  event: AgentCorePointerFinish,
): AgentCorePointerFinishResult {
  if (!activeSession || activeSession.pointerId !== event.pointerId) {
    return { session: activeSession, action: "ignore" };
  }
  if (event.reason === "up") {
    if (activeSession.kind === "touch" || !event.moved || event.dropAccepted) {
      return { session: null, action: "install" };
    }
    return { session: null, action: "return-dock" };
  }
  if (activeSession.kind === "drag") {
    return { session: null, action: "return-dock" };
  }
  return { session: null, action: "close" };
}

export function clampHeadRotation(point: Point, bounds: Rect) {
  const normalizedX = ((point.x - bounds.left) / bounds.width - 0.5) * 2;
  const normalizedY = ((point.y - bounds.top) / bounds.height - 0.5) * 2;
  return {
    yaw: Math.max(-9, Math.min(9, normalizedX * 9)),
    pitch: Math.max(-5, Math.min(5, normalizedY * 5)),
  };
}

export function isCoreDropAccepted(point: Point, socket: Rect): boolean {
  const centerX = socket.left + socket.width / 2;
  const centerY = socket.top + socket.height / 2;
  return (
    Math.abs(point.x - centerX) <= socket.width * 0.42 &&
    Math.abs(point.y - centerY) <= socket.height * 0.42
  );
}

export function nextAgentCorePhase(
  phase: AgentCorePhase,
  event: AgentCoreEvent,
): AgentCorePhase {
  if (phase === "connected") return "connected";
  if (phase === "awaiting" && event === "drag-start") return "dragging";
  if (phase === "dragging" && event === "drop-rejected") return "awaiting";
  if (phase === "dragging" && event === "drop-accepted") return "installing";
  if (phase === "installing" && event === "install-complete") return "connected";
  return phase;
}
