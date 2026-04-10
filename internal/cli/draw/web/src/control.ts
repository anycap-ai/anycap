import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { mermaidToElements, validateMermaid } from './mermaid';
import { mergeWithPositionPreservation, computeMergeStats } from './merge';
import { fillDefaults } from './defaults';

export interface ControlMessage {
  type: string;
  request_id?: string;
  format?: string;
  content?: string;
}

export interface ValidateResult {
  type: 'validate_result';
  request_id: string;
  ok: boolean;
  error?: string;
  elements_merged?: number;
  elements_added?: number;
  elements_removed?: number;
}

type GetElements = () => readonly ExcalidrawElement[];
type UpdateScene = (elements: ExcalidrawElement[]) => void;
type AddFiles = (files: any[]) => void;

/**
 * Handle incoming WebSocket control messages.
 * Returns a validate_result message to send back, or null.
 */
export async function handleControlMessage(
  msg: ControlMessage,
  getElements: GetElements,
  updateScene: UpdateScene,
  addFiles?: AddFiles,
): Promise<ValidateResult | null> {
  if (msg.type === 'content_update') {
    return handleContentUpdate(msg, getElements, updateScene, addFiles);
  }
  if (msg.type === 'session_closing') {
    // Could show a notification to the user
    return null;
  }
  return null;
}

async function handleContentUpdate(
  msg: ControlMessage,
  getElements: GetElements,
  updateScene: UpdateScene,
  addFiles?: AddFiles,
): Promise<ValidateResult> {
  const requestId = msg.request_id || '';
  const format = msg.format || 'excalidraw';
  const content = msg.content || '';

  try {
    let newElements: ExcalidrawElement[];

    if (format === 'mermaid') {
      // Validate first
      const error = await validateMermaid(content);
      if (error) {
        return {
          type: 'validate_result',
          request_id: requestId,
          ok: false,
          error,
        };
      }
      // Convert
      newElements = await mermaidToElements(content);
    } else {
      // Excalidraw JSON
      const parsed = JSON.parse(content);
      const rawElements = parsed.elements || parsed;
      newElements = fillDefaults(
        Array.isArray(rawElements) ? rawElements : [rawElements],
      );
      // Apply embedded files if present
      if (parsed.files && addFiles) {
        addFiles(Object.values(parsed.files));
      }
    }

    // Compute merge stats before applying
    const currentElements = getElements();
    const stats = computeMergeStats(currentElements, newElements);

    // Merge with position preservation
    const merged = mergeWithPositionPreservation(currentElements, newElements);
    updateScene(merged);

    return {
      type: 'validate_result',
      request_id: requestId,
      ok: true,
      ...stats,
    };
  } catch (err: any) {
    return {
      type: 'validate_result',
      request_id: requestId,
      ok: false,
      error: err?.message || 'Failed to process content update',
    };
  }
}
