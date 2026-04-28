import { useCallback, useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import {
  getRecentByKind,
  clearHistoryByKind,
  type GenerationRecord,
  type HistoryKind,
} from '@/src/lib/history';

export function HistorySection({
  kind,
  onPick,
  variant = 'thumbnail',
  emptyHint = 'Your recent runs will appear here.',
  reloadKey,
}: {
  kind: HistoryKind;
  onPick: (r: GenerationRecord) => void;
  // thumbnail = grid of media tiles (image/video/music)
  // text     = vertical list with title + prompt (search/crawl)
  variant?: 'thumbnail' | 'text';
  emptyHint?: string;
  // Bump to force re-fetch (e.g. after a successful generation)
  reloadKey?: number;
}) {
  const [items, setItems] = useState<GenerationRecord[]>([]);

  const load = useCallback(async () => {
    setItems(await getRecentByKind(kind, 6));
  }, [kind]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const clear = async () => {
    await clearHistoryByKind(kind);
    setItems([]);
  };

  if (items.length === 0) {
    return (
      <div className="pt-2 mt-1 border-t border-border-divider">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted font-semibold mb-1.5">
          <HistoryIcon className="w-3 h-3" /> Recent
        </div>
        <p className="text-[11px] text-text-neutral">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="pt-2 mt-1 border-t border-border-divider">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted font-semibold">
          <HistoryIcon className="w-3 h-3" /> Recent · {items.length}
        </div>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1 text-[11px] text-text-neutral hover:text-error transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {variant === 'thumbnail' ? (
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((r, i) => (
            <button
              key={i}
              onClick={() => onPick(r)}
              className="block group relative rounded-lg overflow-hidden border border-border-card hover:border-olive/40 card-hover"
              title={r.prompt || 'Recent generation'}
            >
              {/image|vary/.test(r.kind ?? 'vary') ? (
                <img src={r.resultUrl} alt="" className="w-full h-16 object-cover" loading="lazy" />
              ) : r.kind === 'video' ? (
                <video
                  src={r.resultUrl}
                  className="w-full h-16 object-cover bg-black"
                  muted
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-16 bg-pale-sage/30 flex items-center justify-center text-[10px] text-text-muted">
                  audio
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/45 text-white text-[9px] px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {r.prompt?.slice(0, 80) ?? '—'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => onPick(r)}
                className="w-full text-left px-2.5 py-2 rounded-lg border border-border-card bg-surface-input hover:bg-surface-hover hover:border-border-input-hover card-hover"
                title={r.prompt}
              >
                <div className="text-xs font-medium text-text-primary truncate">
                  {r.title || r.prompt || 'Recent run'}
                </div>
                {r.prompt && r.title && (
                  <div className="text-[11px] text-text-neutral truncate mt-0.5">{r.prompt}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
