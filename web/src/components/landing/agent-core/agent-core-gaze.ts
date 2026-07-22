export type GazeAngles = { yaw: number; pitch: number; roll?: number };
export type Bounds = { left: number; top: number; width: number; height: number };

const YAW_LIMIT = 70;
const PITCH_LIMIT = 25;
const ROLL_LIMIT = 3;
const DEAD_ZONE = 0.03;
const NECK_SHARE = 0.3;

function clamp(value: number, limit: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-limit, Math.min(limit, value));
}

function normalizedPointerPosition(value: number, origin: number, size: number): number {
  if (!Number.isFinite(size) || size === 0) return 0;
  const normalized = ((value - origin) / size - 0.5) * 2;
  if (!Number.isFinite(normalized)) return 0;
  return Math.max(-1, Math.min(1, normalized));
}

function applyDeadZone(value: number): number {
  return Math.abs(value) <= DEAD_ZONE + Number.EPSILON ? 0 : value;
}

function stabilizeAngle(value: number): number {
  return Math.round(value * 1e12) / 1e12;
}

export function clampGaze(angles: GazeAngles): Required<GazeAngles> {
  return {
    yaw: clamp(angles.yaw, YAW_LIMIT),
    pitch: clamp(angles.pitch, PITCH_LIMIT),
    roll: clamp(angles.roll ?? 0, ROLL_LIMIT),
  };
}

export function mapPointerToGaze(
  point: { x: number; y: number },
  bounds: Bounds,
  amplitude = 1,
): GazeAngles {
  const intensity = Math.max(0, Math.min(1, Number.isFinite(amplitude) ? amplitude : 0));
  const yaw = applyDeadZone(normalizedPointerPosition(point.x, bounds.left, bounds.width)) * YAW_LIMIT;
  const pitch = applyDeadZone(normalizedPointerPosition(point.y, bounds.top, bounds.height)) * PITCH_LIMIT;

  return {
    yaw: stabilizeAngle(clamp(yaw, YAW_LIMIT) * intensity),
    pitch: stabilizeAngle(clamp(pitch, PITCH_LIMIT) * intensity),
  };
}

export function splitGazeRotation(angles: GazeAngles): {
  neck: Required<GazeAngles>;
  head: Required<GazeAngles>;
} {
  const clamped = clampGaze(angles);
  const neck = {
    yaw: clamped.yaw * NECK_SHARE,
    pitch: clamped.pitch * NECK_SHARE,
  };
  const head = {
    yaw: clamped.yaw - neck.yaw,
    pitch: clamped.pitch - neck.pitch,
  };

  if (angles.roll === undefined) {
    return { neck, head } as {
      neck: Required<GazeAngles>;
      head: Required<GazeAngles>;
    };
  }

  return {
    neck: { ...neck, roll: clamped.roll * NECK_SHARE },
    head: { ...head, roll: clamped.roll * (1 - NECK_SHARE) },
  };
}

export function shortestAngleDelta(fromDegrees: number, toDegrees: number): number {
  const delta = toDegrees - fromDegrees;
  return ((delta + 540) % 360) - 180;
}
