import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

/**
 * Get the text label for an element.
 * For text elements, returns the text directly.
 * For shapes, finds the bound text element.
 */
function getElementLabel(
  el: ExcalidrawElement,
  allElements: readonly ExcalidrawElement[],
): string | undefined {
  if ((el as any).type === 'text') {
    return (el as any).text;
  }
  // For shapes, find bound text element
  const boundTextRef = (el as any).boundElements?.find(
    (b: any) => b.type === 'text',
  );
  if (boundTextRef) {
    const textEl = allElements.find((e) => e.id === boundTextRef.id);
    if (textEl && (textEl as any).type === 'text') {
      return (textEl as any).text;
    }
  }
  return undefined;
}

/**
 * Merge new Mermaid-converted elements with existing canvas elements,
 * preserving user positions and non-mermaid annotations.
 */
export function mergeWithPositionPreservation(
  oldElements: readonly ExcalidrawElement[],
  newElements: ExcalidrawElement[],
): ExcalidrawElement[] {
  // 1. Build position map from old Mermaid-tagged elements
  const posMap = new Map<
    string,
    { x: number; y: number; width: number; height: number }
  >();
  for (const el of oldElements) {
    if ((el as any).customData?.source === 'mermaid') {
      const label = getElementLabel(el, oldElements);
      if (label) {
        posMap.set(label, {
          x: el.x,
          y: el.y,
          width: (el as any).width || 0,
          height: (el as any).height || 0,
        });
      }
    }
  }

  // 2. Apply saved positions to new elements where labels match
  let merged = 0;
  let added = 0;
  const result = newElements.map((el) => {
    const label = getElementLabel(el, newElements);
    const saved = label ? posMap.get(label) : undefined;
    if (saved) {
      merged++;
      return {
        ...el,
        x: saved.x,
        y: saved.y,
        customData: { source: 'mermaid' },
      } as ExcalidrawElement;
    }
    added++;
    return {
      ...el,
      customData: { source: 'mermaid' },
    } as ExcalidrawElement;
  });

  // 3. Keep user-added elements (no mermaid tag)
  const userElements = oldElements.filter(
    (el) => (el as any).customData?.source !== 'mermaid',
  );

  // Count removed
  const oldMermaidLabels = new Set<string>();
  for (const el of oldElements) {
    if ((el as any).customData?.source === 'mermaid') {
      const label = getElementLabel(el, oldElements);
      if (label) oldMermaidLabels.add(label);
    }
  }
  const newLabels = new Set<string>();
  for (const el of newElements) {
    const label = getElementLabel(el, newElements);
    if (label) newLabels.add(label);
  }
  let removed = 0;
  for (const label of oldMermaidLabels) {
    if (!newLabels.has(label)) removed++;
  }

  return [...result, ...userElements];
}

export interface MergeStats {
  elements_merged: number;
  elements_added: number;
  elements_removed: number;
}

/**
 * Compute merge stats without applying.
 */
export function computeMergeStats(
  oldElements: readonly ExcalidrawElement[],
  newElements: ExcalidrawElement[],
): MergeStats {
  const posMap = new Map<string, boolean>();
  for (const el of oldElements) {
    if ((el as any).customData?.source === 'mermaid') {
      const label = getElementLabel(el, oldElements);
      if (label) posMap.set(label, true);
    }
  }

  let merged = 0;
  let added = 0;
  for (const el of newElements) {
    const label = getElementLabel(el, newElements);
    if (label && posMap.has(label)) {
      merged++;
    } else {
      added++;
    }
  }

  const oldLabels = new Set(posMap.keys());
  const newLabels = new Set<string>();
  for (const el of newElements) {
    const label = getElementLabel(el, newElements);
    if (label) newLabels.add(label);
  }
  let removed = 0;
  for (const label of oldLabels) {
    if (!newLabels.has(label)) removed++;
  }

  return { elements_merged: merged, elements_added: added, elements_removed: removed };
}
