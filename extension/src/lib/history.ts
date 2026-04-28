import { getStored, setStored } from './storage';

const MAX_HISTORY = 30; // total entries kept across all capabilities

export type HistoryKind = 'vary' | 'image' | 'video' | 'music' | 'search' | 'crawl';

export type GenerationRecord = {
  // Capability that produced this record (defaults to 'vary' for legacy entries)
  kind?: HistoryKind;
  // Display surface — image/video/audio src, or first result URL for search/crawl
  resultUrl: string;
  // For Vary: source image. For others: empty string.
  srcUrl: string;
  // Original input(s) — used for click-to-reuse
  prompt?: string;
  model?: string;
  // Tab-specific extras
  aspectRatio?: string;
  durationSeconds?: number;
  // Search returns multiple results — store the title of the first
  title?: string;
  ts: number;
};

export async function addGeneration(record: GenerationRecord): Promise<void> {
  const history = await getStored('recentGenerations');
  const normalized: GenerationRecord = { kind: 'vary', ...record };
  const updated = [normalized, ...history].slice(0, MAX_HISTORY);
  await setStored('recentGenerations', updated);
}

export async function getRecentGenerations(): Promise<GenerationRecord[]> {
  return getStored('recentGenerations');
}

export async function getRecentByKind(kind: HistoryKind, limit = 6): Promise<GenerationRecord[]> {
  const all = await getStored('recentGenerations');
  // Legacy entries without kind are vary entries.
  return all.filter((r) => (r.kind ?? 'vary') === kind).slice(0, limit);
}

export async function clearHistory(): Promise<void> {
  await setStored('recentGenerations', []);
}

export async function clearHistoryByKind(kind: HistoryKind): Promise<void> {
  const all = await getStored('recentGenerations');
  const remaining = all.filter((r) => (r.kind ?? 'vary') !== kind);
  await setStored('recentGenerations', remaining);
}
