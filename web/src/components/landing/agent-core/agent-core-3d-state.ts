export type AgentCore3DPointer = {
  x: number;
  y: number;
};

export type AgentCore3DRotation = {
  yaw: number;
  pitch: number;
};

export type AgentCore3DVector = {
  x: number;
  y: number;
  z: number;
};

export type AgentCore3DPose = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export type AgentCore3DBridge = {
  pointerTarget: AgentCore3DPointer;
  pointerCurrent: AgentCore3DRotation;
  installProgress: number;
  connected: boolean;
  dragOffset: AgentCore3DVector;
  sceneActive: boolean;
  invalidate: (() => void) | null;
};

const HEAD_YAW_LIMIT = 0.16;
const HEAD_PITCH_LIMIT = 0.09;

const TABLE_POSE: AgentCore3DPose = {
  position: [0.38, -2.08, 0.72],
  rotation: [-0.12, 0.08, -0.04],
  scale: 0.82,
};

const SOCKET_POSE: AgentCore3DPose = {
  position: [0, -0.34, 1.18],
  rotation: [0, 0, 0],
  scale: 0.72,
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function easeInOutCubic(progress: number): number {
  if (progress < 0.5) return 4 * progress * progress * progress;
  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function createAgentCore3DBridge(): AgentCore3DBridge {
  return {
    pointerTarget: { x: 0, y: 0 },
    pointerCurrent: { yaw: 0, pitch: 0 },
    installProgress: 0,
    connected: false,
    dragOffset: { x: 0, y: 0, z: 0 },
    sceneActive: false,
    invalidate: null,
  };
}

export function mapHeadTarget(pointer: AgentCore3DPointer): AgentCore3DRotation {
  const x = clamp(pointer.x, -1, 1);
  const y = clamp(pointer.y, -1, 1);

  return {
    yaw: x * HEAD_YAW_LIMIT,
    pitch: y * HEAD_PITCH_LIMIT,
  };
}

export function mapCoreInstallPose(progress: number): AgentCore3DPose {
  const clampedProgress = clamp(progress, 0, 1);
  if (clampedProgress === 0) {
    return {
      position: [...TABLE_POSE.position],
      rotation: [...TABLE_POSE.rotation],
      scale: TABLE_POSE.scale,
    };
  }
  if (clampedProgress === 1) {
    return {
      position: [...SOCKET_POSE.position],
      rotation: [...SOCKET_POSE.rotation],
      scale: SOCKET_POSE.scale,
    };
  }

  const easedProgress = easeInOutCubic(clampedProgress);

  return {
    position: TABLE_POSE.position.map((value, index) =>
      interpolate(value, SOCKET_POSE.position[index], easedProgress),
    ) as AgentCore3DPose["position"],
    rotation: TABLE_POSE.rotation.map((value, index) =>
      interpolate(value, SOCKET_POSE.rotation[index], easedProgress),
    ) as AgentCore3DPose["rotation"],
    scale: interpolate(TABLE_POSE.scale, SOCKET_POSE.scale, easedProgress),
  };
}

export function smoothAgentCoreValue(
  current: number,
  target: number,
  deltaSeconds: number,
  response = 9,
): number {
  return interpolate(current, target, 1 - Math.exp(-response * deltaSeconds));
}
