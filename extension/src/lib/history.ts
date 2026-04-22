import { getStored, setStored } from './storage';

const MAX_HISTORY = 10;

export type GenerationRecord = {
  resultUrl: string;
  srcUrl: string;
  ts: number;
};

export async function addGeneration(record: GenerationRecord): Promise<void> {
  const history = await getStored('recentGenerations');
  const updated = [record, ...history].slice(0, MAX_HISTORY);
  await setStored('recentGenerations', updated);
}

export async function getRecentGenerations(): Promise<GenerationRecord[]> {
  return getStored('recentGenerations');
}

export async function clearHistory(): Promise<void> {
  await setStored('recentGenerations', []);
}
