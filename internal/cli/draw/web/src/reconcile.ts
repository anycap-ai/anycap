/**
 * Element reconciliation for collaborative editing.
 *
 * Follows Excalidraw's official approach:
 *   - Merge local and remote elements by ID (union of both sets)
 *   - Keep the element with the higher `version` number
 *   - Break ties deterministically via lower `versionNonce`
 *   - Never overwrite an element being actively edited locally
 *
 * This replaces the fragile "suppress broadcast" timing hack with
 * a correct merge algorithm that preserves in-progress local edits.
 */

import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface AppStateForReconcile {
  resizingElement?: { id: string } | null;
  editingLinearElement?: { elementId: string } | null;
}

/**
 * Returns true if the local element should be kept over the remote one.
 */
function shouldKeepLocal(
  local: ExcalidrawElement,
  remote: ExcalidrawElement,
  appState?: AppStateForReconcile | null,
): boolean {
  if (appState) {
    // Never overwrite an element currently being resized
    if (appState.resizingElement?.id === local.id) return true;
    // Never overwrite a linear element being edited (arrow/line)
    if (appState.editingLinearElement?.elementId === local.id) return true;
  }

  // Local version is strictly newer
  if (local.version > remote.version) return true;

  // Same version: deterministic tie-break — lower versionNonce wins
  if (
    local.version === remote.version &&
    local.versionNonce < remote.versionNonce
  ) {
    return true;
  }

  return false;
}

/**
 * Merge local and remote element arrays.
 *
 * - Elements present in both are resolved by version/nonce.
 * - Elements only in remote are inserted (new from peer).
 * - Elements only in local are kept (new local, not yet synced).
 * - Ordering follows remote array, with local-only appended at end.
 */
export function reconcileElements(
  localElements: readonly ExcalidrawElement[],
  remoteElements: readonly ExcalidrawElement[],
  appState?: AppStateForReconcile | null,
): ExcalidrawElement[] {
  const localMap = new Map<string, ExcalidrawElement>();
  for (const el of localElements) {
    localMap.set(el.id, el);
  }

  const result: ExcalidrawElement[] = [];
  const seen = new Set<string>();

  // Walk remote elements — preserves remote z-ordering
  for (const remote of remoteElements) {
    seen.add(remote.id);
    const local = localMap.get(remote.id);
    if (local && shouldKeepLocal(local, remote, appState)) {
      result.push(local);
    } else {
      result.push(remote);
    }
  }

  // Append local-only elements (drawn locally, not yet synced to peer)
  for (const local of localElements) {
    if (!seen.has(local.id)) {
      result.push(local);
    }
  }

  return result;
}

/**
 * Build a lightweight fingerprint of element versions.
 * Used to detect whether a reconciled scene actually differs from
 * what was last synced, preventing unnecessary echo broadcasts.
 */
export function elementsFingerprint(
  elements: readonly ExcalidrawElement[],
): string {
  // Fast: just count + sum of versions. Collisions are harmless
  // (they only cause an extra sync, not data loss).
  let sum = 0;
  for (const el of elements) {
    sum += el.version;
  }
  return `${elements.length}:${sum}`;
}
