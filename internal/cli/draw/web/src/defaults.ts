import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

let nextId = 1;

function randomId(): string {
  return 'draw_' + (nextId++) + '_' + Math.random().toString(36).slice(2, 10);
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}

const baseDefaults = {
  angle: 0,
  strokeColor: '#1e1e1e',
  backgroundColor: 'transparent',
  fillStyle: 'solid' as const,
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  roughness: 1,
  opacity: 100,
  groupIds: [] as string[],
  frameId: null,
  isDeleted: false,
  locked: false,
  boundElements: null,
  link: null,
};

/**
 * Fill missing Excalidraw element fields with sensible defaults.
 * Agents can write partial JSON; this fills the rest.
 */
export function fillDefaults(
  elements: Partial<ExcalidrawElement>[],
  source?: string,
): ExcalidrawElement[] {
  return elements.map((el) => {
    const filled: any = {
      ...baseDefaults,
      id: randomId(),
      seed: randomSeed(),
      version: 1,
      versionNonce: randomSeed(),
      updated: Date.now(),
      roundness:
        el.type === 'rectangle' ? { type: 3 } : el.type === 'ellipse' ? { type: 2 } : null,
      ...el, // agent-provided fields override defaults
    };

    // Tag with source for merge tracking
    if (source) {
      filled.customData = { ...filled.customData, source };
    }

    return filled as ExcalidrawElement;
  });
}
