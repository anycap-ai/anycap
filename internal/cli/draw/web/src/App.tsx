import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { FileId } from '@excalidraw/excalidraw/element/types';
import { fillDefaults } from './defaults';
import { mermaidToElements } from './mermaid';
import { DrawWebSocket } from './collaboration';
import { resolveUrl } from './proxy';
import {
  clientId, clientName as initialClientName, clientColor,
  setClientName, setCursorContainer, onPeersChange,
  repositionAllCursors, ViewState,
} from './cursors';

type InitData = {
  format: string;
  elements?: any[];
  content?: string;
  image_url?: string;
  files?: Record<string, any>;
};

export default function App() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [initElements, setInitElements] = useState<ExcalidrawElement[] | null>(null);
  const [initFiles, setInitFiles] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(initialClientName);
  const [peers, setPeers] = useState<{ name: string; color: string }[]>([]);
  const wsRef = useRef<DrawWebSocket | null>(null);
  const needsScrollRef = useRef(false);
  const imageFileRef = useRef<any>(null);
  const lastViewRef = useRef({ scrollX: 0, scrollY: 0, zoom: 1 });
  const [toast, setToast] = useState<string | null>(null);
  const [overlayReason, setOverlayReason] = useState<'saved' | 'closed' | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToastMsg = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Load initial content from server
  useEffect(() => {
    async function loadInit() {
      try {
        const resp = await fetch(resolveUrl('init'));
        if (resp.status === 204) {
          setInitElements([]);
          setLoading(false);
          return;
        }
        const data: InitData = await resp.json();
        console.log('[draw] init data:', { format: data.format, hasContent: !!data.content, hasElements: !!data.elements, imageUrl: data.image_url });

        let elements: ExcalidrawElement[] = [];
        let pendingFiles: Record<string, any> | null = null;

        if (data.format === 'mermaid' && data.content) {
          console.log('[draw] converting mermaid to excalidraw elements...');
          try {
            elements = await mermaidToElements(data.content);
            console.log('[draw] mermaid conversion produced', elements.length, 'elements');
          } catch (mermaidErr: any) {
            console.error('[draw] mermaid conversion failed:', mermaidErr);
            setInitError(`Mermaid conversion failed: ${mermaidErr?.message || mermaidErr}`);
          }
        } else if (data.format === 'image' && data.image_url) {
          console.log('[draw] loading background image:', data.image_url);
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Failed to load image'));
              img.src = data.image_url!;
            });
            const imgResp = await fetch(resolveUrl(data.image_url!));
            const blob = await imgResp.blob();
            const reader = new FileReader();
            const dataUrl: string = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            const fileId = `img_${Date.now()}` as FileId;
            imageFileRef.current = {
              id: fileId,
              dataURL: dataUrl,
              mimeType: blob.type as any,
              created: Date.now(),
              lastRetrieved: Date.now(),
            };
            const imgElement = {
              type: 'image' as const,
              id: `bg_${Date.now()}`,
              x: 0,
              y: 0,
              width: img.naturalWidth,
              height: img.naturalHeight,
              fileId,
              status: 'saved' as const,
              scale: [1, 1] as [number, number],
              crop: null,
              locked: true,
            };
            elements = fillDefaults([imgElement]) as ExcalidrawElement[];
            console.log('[draw] background image loaded:', img.naturalWidth, 'x', img.naturalHeight);
          } catch (imgErr: any) {
            console.error('[draw] image load failed:', imgErr);
            setInitError(`Failed to load image: ${imgErr?.message || imgErr}`);
          }
        } else if (data.format === 'excalidraw' && data.elements) {
          elements = fillDefaults(data.elements);
          console.log('[draw] excalidraw elements loaded:', elements.length);
        } else if (data.format === 'excalidraw_full' && data.elements) {
          elements = data.elements as ExcalidrawElement[];
          if (data.files) {
            pendingFiles = data.files;
          }
          console.log('[draw] full excalidraw elements loaded:', elements.length);
        } else {
          console.warn('[draw] unknown format or missing data:', data.format);
        }

        if (elements.length > 0) {
          needsScrollRef.current = true;
        }
        setInitElements(elements);
        if (pendingFiles) {
          setInitFiles(pendingFiles);
        }
      } catch (err) {
        console.error('[draw] Failed to load initial content:', err);
        setInitError(`Failed to load: ${err}`);
        setInitElements([]);
      }
      setLoading(false);
    }
    loadInit();
  }, []);

  // Register files and scroll to content when API is ready
  useEffect(() => {
    if (!api) return;

    // Register image file if loaded via --image
    if (imageFileRef.current) {
      api.addFiles([imageFileRef.current]);
      imageFileRef.current = null;
    }

    // Register files from loaded .excalidraw document
    if (initFiles) {
      const fileArray = Object.values(initFiles);
      if (fileArray.length > 0) {
        api.addFiles(fileArray);
      }
      setInitFiles(null);
    }

    if (!needsScrollRef.current) return;

    const timer = setTimeout(() => {
      try {
        api.scrollToContent(api.getSceneElements(), { fitToContent: true });
        console.log('[draw] scrolled to content');
      } catch (err) {
        console.warn('[draw] scrollToContent failed:', err);
      }
      needsScrollRef.current = false;
    }, 300);

    return () => clearTimeout(timer);
  }, [api, initFiles]);

  // Attach cursor overlay inside Excalidraw's own DOM (same stacking context)
  useEffect(() => {
    if (!api) return;
    const container = document.querySelector('.excalidraw');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:100;overflow:hidden;';
    container.appendChild(overlay);
    setCursorContainer(overlay);
    return () => { overlay.remove(); };
  }, [api]);



  // Register peers change callback
  useEffect(() => {
    onPeersChange(setPeers);
    return () => onPeersChange(() => {});
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    if (!api) return;

    const ws = new DrawWebSocket(
      globalThis.SESSION_ID,
      () => api.getSceneElements(),
      (elements) => {
        api.updateScene({ elements });
      },
      (files) => {
        api.addFiles(files);
      },
      () => {
        const s = api.getAppState();
        return { scrollX: s.scrollX, scrollY: s.scrollY, zoom: s.zoom };
      },
      () => {
        const s = api.getAppState();
        return {
          resizingElement: s.resizingElement ?? null,
          editingLinearElement: s.editingLinearElement ?? null,
        };
      },
      showToastMsg,
      (reason: 'saved' | 'closed') => setOverlayReason(reason),
    );
    ws.connect();
    wsRef.current = ws;

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [api]);

  const handleSave = useCallback(async () => {
    if (!api || saving) return;
    setSaving(true);

    try {
      const elements = api.getSceneElements();
      const appState = api.getAppState();

      const blob = await exportToBlob({
        elements,
        appState: { ...appState, exportWithDarkMode: false },
        files: api.getFiles(),
      });

      const form = new FormData();
      form.append('csrf_token', globalThis.CSRF_TOKEN);
      form.append('snapshot', blob, 'snapshot.png');
      form.append(
        'document',
        new Blob([JSON.stringify({ type: 'excalidraw', version: 2, elements, files: api.getFiles() })], {
          type: 'application/json',
        }),
        'document.excalidraw',
      );
      form.append('client_id', clientId);

      const resp = await fetch(resolveUrl('submit'), { method: 'POST', body: form });
      const result = await resp.json();

      setSaved(true);
      showToastMsg('Whiteboard saved successfully.');
      setTimeout(() => setSaved(false), 2000);

      if (result.closing && globalThis.AUTO_CLOSE) {
        window.close();
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [api, saving]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameValue(name);
    setClientName(name);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {initError && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, background: '#fef2f2', color: '#991b1b', padding: '8px 16px',
          borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, maxWidth: '80%',
        }}>
          {initError}
        </div>
      )}

      {/* Bottom-center: collaboration bar (peers + name + save) */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, pointerEvents: 'none',
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        {peers.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', background: '#f3f4f6', borderRadius: '8px',
            fontSize: '12px', color: '#6b7280', pointerEvents: 'all',
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {peers.map((p, i) => (
                <span
                  key={i}
                  title={p.name}
                  style={{
                    display: 'inline-block', width: 8, height: 8,
                    borderRadius: '50%', background: p.color,
                  }}
                />
              ))}
            </div>
            <span>{peers.length} {peers.length === 1 ? 'peer' : 'peers'}</span>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 8px', background: '#f9fafb', borderRadius: '8px',
          border: '1px solid #e5e7eb', pointerEvents: 'all',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: clientColor, flexShrink: 0,
          }} />
          <input
            type="text"
            value={nameValue}
            onChange={handleNameChange}
            placeholder="Your name"
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '12px', width: '80px', color: '#374151',
              fontFamily: 'system-ui',
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 24px',
            backgroundColor: saving ? '#a5b4fc' : saved ? '#22c55e' : '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            pointerEvents: 'all',
            transition: 'background-color 0.2s, transform 0.1s',
            transform: saving ? 'scale(0.97)' : 'scale(1)',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <Excalidraw
        excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
        initialData={{
          elements: initElements || [],
          appState: {
            viewBackgroundColor: '#ffffff',
          },
          scrollToContent: true,
        }}
        onPointerUpdate={(payload) => {
          if (wsRef.current && payload.pointer.tool === 'pointer') {
            wsRef.current.broadcastCursor(payload.pointer.x, payload.pointer.y);
          }
        }}
        onChange={(elements, appState, files) => {
          if (wsRef.current) {
            wsRef.current.broadcastSync(elements, files);
          }
          // Reposition remote cursors only when pan/zoom actually changes
          if (appState) {
            const lv = lastViewRef.current;
            if (appState.scrollX !== lv.scrollX || appState.scrollY !== lv.scrollY || appState.zoom.value !== lv.zoom) {
              lv.scrollX = appState.scrollX;
              lv.scrollY = appState.scrollY;
              lv.zoom = appState.zoom.value;
              repositionAllCursors({ scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: appState.zoom });
            }
          }
        }}
      />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: '#323232', color: '#fff',
          padding: '10px 20px', borderRadius: 8, fontSize: 13,
          fontFamily: 'system-ui', boxShadow: '0 4px 16px rgba(0,0,0,.15)',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      {/* Overlay (shown when session ends: peer saved or host closed) */}
      {overlayReason && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 9999, background: 'rgba(26,26,46,.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: '#ccc', fontFamily: 'system-ui' }}>
            <div style={{ marginBottom: 20, opacity: 0.9 }}>
              {overlayReason === 'saved' ? (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="#6b7d3a" strokeWidth="3" fill="none"/>
                  <path d="M14 24L21 31L34 18" stroke="#6b7d3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="#7a7a8a" strokeWidth="3" fill="none"/>
                  <path d="M24 14V28" stroke="#7a7a8a" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="24" cy="34" r="2" fill="#7a7a8a"/>
                </svg>
              )}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#e0e0e0', marginBottom: 10 }}>
              {overlayReason === 'saved' ? 'Whiteboard Saved' : 'Session Closed'}
            </div>
            <div style={{ fontSize: 14, opacity: 0.7, maxWidth: 320, margin: '0 auto 16px' }}>
              {overlayReason === 'saved'
                ? 'Another collaborator has saved and closed the session.'
                : 'The session has been closed.'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.4 }}>
              You can close this tab.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
