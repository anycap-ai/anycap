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

export type AgentCoreSceneProjection = {
  normalized: {
    centerX: number;
    centerY: number;
    left: number;
    top: number;
    width: number;
    height: number;
  };
  css: {
    centerX: number;
    centerY: number;
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export type AgentCoreActivation = {
  socketScale: number;
  coreEmissiveIntensity: number;
  visorEmissiveIntensities: number[];
};

type AgentCoreFallbackAnchor = {
  placement: {
    x: number;
    y: number;
    scale: number;
  };
  localAnchor: {
    x: number;
    y: number;
  };
};

type AgentCoreFallbackShiftOptions = {
  artboard: {
    width: number;
    height: number;
  };
  sceneLeft: number;
  robotSocket: AgentCoreFallbackAnchor;
  dockSeat: AgentCoreFallbackAnchor;
  fallbackCore: {
    width: number;
    height: number;
    dockContact: AgentCore3DPointer;
    socketAttachment: AgentCore3DPointer;
  };
  targets: ReturnType<typeof projectAgentCoreInteractiveTargets>;
};

export type AgentCore3DBridge = {
  pointerTarget: AgentCore3DPointer;
  pointerCurrent: AgentCore3DRotation;
  installProgress: number;
  activationProgress: number;
  connected: boolean;
  dragOffset: AgentCore3DVector;
  sceneActive: boolean;
  invalidate: (() => void) | null;
};

const HEAD_YAW_LIMIT = 0.16;
const HEAD_PITCH_LIMIT = 0.09;
const CORE_FACE_WORLD_SIZE = 0.92;

export const AGENT_CORE_WORLD_SPAN = 4.8;
export const AGENT_CORE_SCENE_ASPECT = 0.94;

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
    activationProgress: 0,
    connected: false,
    dragOffset: { x: 0, y: 0, z: 0 },
    sceneActive: false,
    invalidate: null,
  };
}

export function mapAgentCoreActivation(progress: number): AgentCoreActivation {
  const activation = clamp(progress, 0, 1);
  const pulse = Math.sin(Math.PI * activation);

  return {
    socketScale: 1 - activation * 0.08,
    coreEmissiveIntensity: 0.02 + activation * 0.3 + pulse * 0.58,
    visorEmissiveIntensities: Array.from({ length: 11 }, (_, index) => {
      const distanceFromCenter = Math.abs(index - 5) / 5;
      const activationStart = distanceFromCenter * 0.6;
      const cellProgress = clamp(
        (activation - activationStart) / (1 - activationStart),
        0,
        1,
      );
      return 0.04 + cellProgress * 0.48;
    }),
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

export function agentCoreOrthographicZoom(sceneWidth: number): number {
  return sceneWidth / AGENT_CORE_WORLD_SPAN;
}

export function projectAgentCorePoseToScene(
  pose: AgentCore3DPose,
  sceneWidth: number,
): AgentCoreSceneProjection {
  const sceneHeight = sceneWidth / AGENT_CORE_SCENE_ASPECT;
  const zoom = agentCoreOrthographicZoom(sceneWidth);
  const centerX = sceneWidth / 2 + pose.position[0] * zoom;
  const centerY = sceneHeight / 2 - pose.position[1] * zoom;
  const size = CORE_FACE_WORLD_SIZE * pose.scale * zoom;
  const left = centerX - size / 2;
  const top = centerY - size / 2;

  return {
    normalized: {
      centerX: centerX / sceneWidth,
      centerY: centerY / sceneHeight,
      left: left / sceneWidth,
      top: top / sceneHeight,
      width: size / sceneWidth,
      height: size / sceneHeight,
    },
    css: {
      centerX,
      centerY,
      left,
      top,
      width: size,
      height: size,
    },
  };
}

export function projectAgentCoreInteractiveTargets(sceneWidth: number): {
  tableCore: AgentCoreSceneProjection;
  chestSocket: AgentCoreSceneProjection;
} {
  return {
    tableCore: projectAgentCorePoseToScene(mapCoreInstallPose(0), sceneWidth),
    chestSocket: projectAgentCorePoseToScene(mapCoreInstallPose(1), sceneWidth),
  };
}

export function deriveAgentCoreFallbackShifts({
  artboard,
  sceneLeft,
  robotSocket,
  dockSeat,
  fallbackCore,
  targets,
}: AgentCoreFallbackShiftOptions): {
  robot: AgentCore3DPointer;
  dock: AgentCore3DPointer;
} {
  const sceneWidth = artboard.width - sceneLeft;
  const projectAnchor = ({ placement, localAnchor }: AgentCoreFallbackAnchor) => ({
    x: (placement.x + localAnchor.x * placement.scale - sceneLeft) / sceneWidth,
    y: (placement.y + localAnchor.y * placement.scale) / artboard.height,
  });
  const projectedRobotSocket = projectAnchor(robotSocket);
  const projectedDockSeat = projectAnchor(dockSeat);
  const projectCoreAnchor = (
    projection: AgentCoreSceneProjection,
    anchor: AgentCore3DPointer,
  ) => {
    const renderedCoreHeight =
      projection.normalized.height * (fallbackCore.height / fallbackCore.width);
    return {
      x:
        projection.normalized.left +
        (anchor.x / fallbackCore.width) * projection.normalized.width,
      y:
        projection.normalized.top +
        (anchor.y / fallbackCore.height) * renderedCoreHeight,
    };
  };
  const projectedCoreDockContact = projectCoreAnchor(
    targets.tableCore,
    fallbackCore.dockContact,
  );
  const projectedCoreSocketAttachment = projectCoreAnchor(
    targets.chestSocket,
    fallbackCore.socketAttachment,
  );

  return {
    robot: {
      x: projectedCoreSocketAttachment.x - projectedRobotSocket.x,
      y: projectedCoreSocketAttachment.y - projectedRobotSocket.y,
    },
    dock: {
      x: projectedCoreDockContact.x - projectedDockSeat.x,
      y: projectedCoreDockContact.y - projectedDockSeat.y,
    },
  };
}

export function mapAgentCorePointerDeltaToWorld(
  delta: AgentCore3DPointer,
  sceneWidth: number,
): AgentCore3DVector {
  const zoom = agentCoreOrthographicZoom(sceneWidth);
  return {
    x: delta.x / zoom,
    y: -delta.y / zoom,
    z: 0,
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
