import { ControlMessage, ValidateResult, handleControlMessage } from './control';
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import {
  clientId, clientName, clientColor,
  CursorData, ViewState,
  updateRemoteCursor, addPeer, removePeer, clearAllRemote,
} from './cursors';
import {
  reconcileElements, elementsFingerprint,
  AppStateForReconcile,
} from './reconcile';

type GetElements = () => readonly ExcalidrawElement[];
type UpdateScene = (elements: ExcalidrawElement[]) => void;
type AddFiles = (files: any[]) => void;
type GetViewState = () => ViewState;
type GetAppState = () => AppStateForReconcile | null;
type OnNotification = (message: string) => void;
type OnOverlay = () => void;

/**
 * Resolve a relative path to a full WebSocket URL,
 * preserving any proxy query params (e.g. sandbox token).
 */
function resolveWsUrl(path: string): string {
  const rel = path.startsWith('/') ? '.' + path : path;
  const url = new URL(rel, location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  if (location.search) {
    const existing = new URLSearchParams(location.search);
    existing.forEach((v, k) => {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

/**
 * WebSocket manager for draw sessions.
 *
 * Collaboration strategy (follows Excalidraw's official approach):
 *   - Incoming remote elements are MERGED with local elements via
 *     reconcileElements(), never replacing the full scene.
 *   - Each element carries `version` + `versionNonce`; the merge picks
 *     the higher version and uses versionNonce as deterministic tie-break.
 *   - Elements being actively edited locally are never overwritten.
 *   - Echo prevention uses a fingerprint check instead of fragile timers.
 */
export class DrawWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionId: string;
  private getElements: GetElements;
  private updateScene: UpdateScene;
  private addFiles: AddFiles | undefined;
  private getViewState: GetViewState | undefined;
  private getAppState: GetAppState | undefined;
  private onNotification: OnNotification | undefined;
  private onOverlay: OnOverlay | undefined;

  // Echo prevention: fingerprint of the last reconciled scene we applied.
  // When onChange fires after updateScene, broadcastSync sees the same
  // fingerprint and skips the redundant broadcast.
  private _lastAppliedFingerprint = '';

  // Debounce timer for outgoing sync
  private _broadcastTimer: ReturnType<typeof setTimeout> | null = null;

  // Throttle for cursor broadcasts
  private _lastCursorBroadcast = 0;

  private _beforeUnload: (() => void) | null = null;

  constructor(
    sessionId: string,
    getElements: GetElements,
    updateScene: UpdateScene,
    addFiles?: AddFiles,
    getViewState?: GetViewState,
    getAppState?: GetAppState,
    onNotification?: OnNotification,
    onOverlay?: OnOverlay,
  ) {
    this.sessionId = sessionId;
    this.getElements = getElements;
    this.updateScene = updateScene;
    this.addFiles = addFiles;
    this.getViewState = getViewState;
    this.getAppState = getAppState;
    this.onNotification = onNotification;
    this.onOverlay = onOverlay;
  }

  connect(): void {
    const url = resolveWsUrl(`ws?csrf_token=${encodeURIComponent(globalThis.CSRF_TOKEN)}`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      // Send join message with identity
      this.ws?.send(
        JSON.stringify({
          type: 'join', clientId, sessionId: this.sessionId,
          name: clientName, color: clientColor,
        }),
      );
    };

    // Ensure leave is sent on page refresh/close
    this._beforeUnload = () => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'leave', clientId }));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', this._beforeUnload);

    this.ws.onmessage = async (event) => {
      if (typeof event.data !== 'string') return;

      try {
        const msg = JSON.parse(event.data);

        // ----- scene_state: server sends cached scene on join/reconnect -----
        // Handle BEFORE self-filter: the cached scene retains the original
        // syncer's clientId, which may match ours after a refresh.
        if (msg.type === 'scene_state' && Array.isArray(msg.elements)) {
          this._applyRemoteElements(msg.elements, msg.files);

          // After restoring, schedule a sync to update the server cache
          // with our clientId. This ensures subsequent refreshes get fresh data.
          setTimeout(() => this._forceSyncToServer(), 300);
          return;
        }

        // Ignore own messages relayed by server
        if (msg.clientId === clientId) return;

        // ----- Peer lifecycle -----
        if (msg.type === 'join' && msg.clientId) {
          addPeer(msg.clientId, msg.name || 'Anonymous', msg.color || '#999');
          return;
        }
        if (msg.type === 'cursor_leave' || msg.type === 'leave') {
          removePeer(msg.clientId);
          return;
        }

        // ----- Notifications -----
        if (msg.type === 'submitted') {
          if (msg.autoClose) {
            this.onOverlay?.();
          } else {
            this.onNotification?.('A collaborator saved the whiteboard.');
          }
          return;
        }
        if (msg.type === 'session_closing') {
          this.onNotification?.('Session is closing...');
          return;
        }

        // ----- Cursor -----
        if (msg.type === 'cursor') {
          const vs = this.getViewState?.();
          if (vs) {
            updateRemoteCursor(msg as CursorData, vs);
          }
          return;
        }

        // ----- Element sync from another peer -----
        if (msg.type === 'sync' && Array.isArray(msg.elements)) {
          console.log('[collab] received sync from', msg.clientId, 'elements:', msg.elements.length);
          this._applyRemoteElements(msg.elements, msg.files);
          return;
        }

        // ----- Legacy control messages -----
        const result = await handleControlMessage(
          msg as ControlMessage,
          this.getElements,
          this.updateScene,
          this.addFiles,
        );
        if (result) {
          this.ws?.send(JSON.stringify(result));
        }
      } catch {
        // Not valid JSON, ignore
      }
    };

    this.ws.onclose = () => {
      clearAllRemote();
      this.reconnectTimer = setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  /**
   * Core merge: reconcile remote elements with local, then update scene.
   * Sets the fingerprint so the resulting onChange echo is suppressed.
   */
  private _applyRemoteElements(
    remoteElements: ExcalidrawElement[],
    files?: Record<string, any>,
  ): void {
    // Cancel any pending outgoing sync — a stale debounce timer (e.g. from
    // the initial empty onChange) would overwrite the server cache with old data.
    if (this._broadcastTimer) {
      clearTimeout(this._broadcastTimer);
      this._broadcastTimer = null;
      console.log('[collab] cancelled pending broadcastTimer (remote update arrived)');
    }

    // Register files first so image elements can resolve their fileId
    if (files && this.addFiles) {
      this.addFiles(Object.values(files));
    }

    const local = this.getElements();
    const appState = this.getAppState?.() ?? null;
    const reconciled = reconcileElements(local, remoteElements, appState);

    // Record fingerprint BEFORE updateScene so the echo onChange is suppressed
    this._lastAppliedFingerprint = elementsFingerprint(reconciled);
    this.updateScene(reconciled);
  }

  /**
   * Send current scene to server to update the cache.
   * Called after scene_state restore to ensure the server has a fresh
   * copy with our clientId, fixing the "second refresh loses data" bug.
   */
  private _forceSyncToServer(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const elements = this.getElements();
    if (elements.length === 0) return;
    const msg: any = { type: 'sync', clientId, elements };
    this.ws.send(JSON.stringify(msg));
    // Update fingerprint so the server's broadcast-back is also suppressed
    this._lastAppliedFingerprint = elementsFingerprint(elements);
  }

  /**
   * Broadcast element sync to other clients.
   * Debounced 200ms. Skipped if the elements haven't changed since
   * the last remote update (echo prevention via fingerprint).
   */
  broadcastSync(elements: readonly ExcalidrawElement[], files?: Record<string, any>): void {
    // Never send empty element arrays — they would wipe the server cache
    if (elements.length === 0) {
      console.log('[collab] broadcastSync skipped (empty elements)');
      return;
    }

    // Echo prevention: skip if scene matches what we just applied from remote
    const fp = elementsFingerprint(elements);
    if (fp === this._lastAppliedFingerprint) {
      console.log('[collab] broadcastSync skipped (echo)', fp);
      return;
    }

    if (this._broadcastTimer) clearTimeout(this._broadcastTimer);
    this._broadcastTimer = setTimeout(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('[collab] sending sync', { elements: elements.length, fp });
        const msg: any = { type: 'sync', clientId, elements };
        if (files && Object.keys(files).length > 0) {
          msg.files = files;
        }
        this.ws.send(JSON.stringify(msg));
      } else {
        console.log('[collab] broadcastSync: ws not open');
      }
    }, 200);
  }

  /**
   * Broadcast cursor position (scene coordinates from Excalidraw).
   * Throttled to ~80ms intervals.
   */
  broadcastCursor(sceneX: number, sceneY: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    if (now - this._lastCursorBroadcast < 80) return;
    this._lastCursorBroadcast = now;
    this.ws.send(JSON.stringify({
      type: 'cursor', clientId,
      name: clientName, color: clientColor,
      sceneX, sceneY,
    }));
  }

  /** Notify peers that cursor has left the canvas. */
  broadcastCursorLeave(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'cursor_leave', clientId }));
      } catch { /* ignore */ }
    }
  }

  disconnect(): void {
    if (this._beforeUnload) {
      window.removeEventListener('beforeunload', this._beforeUnload);
      this._beforeUnload = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'leave', clientId }));
      } catch { /* ignore */ }
    }
    this.ws?.close();
    this.ws = null;
  }
}
