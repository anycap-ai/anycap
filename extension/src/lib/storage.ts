export type StoredSchema = {
  trialCount: number;
  trialFirstUsedAt: number | null;
  authToken: string | null;
  installId: string | null;
  apiKey: string | null;
  recentGenerations: Array<{
    kind?: 'vary' | 'image' | 'video' | 'music' | 'search' | 'crawl';
    resultUrl: string;
    srcUrl: string;
    prompt?: string;
    model?: string;
    aspectRatio?: string;
    durationSeconds?: number;
    title?: string;
    ts: number;
  }>;
  userSettings: Record<string, unknown> | null;
  onboardingCompleted: boolean;
};

const DEFAULTS: StoredSchema = {
  trialCount: 0,
  trialFirstUsedAt: null,
  authToken: null,
  installId: null,
  apiKey: null,
  recentGenerations: [],
  userSettings: null,
  onboardingCompleted: false,
};

export async function getStored<K extends keyof StoredSchema>(
  key: K
): Promise<StoredSchema[K]> {
  const raw = await chrome.storage.local.get([key]);
  return (raw[key] ?? DEFAULTS[key]) as StoredSchema[K];
}

export async function setStored<K extends keyof StoredSchema>(
  key: K,
  value: StoredSchema[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeStored(key: keyof StoredSchema): Promise<void> {
  await chrome.storage.local.remove(key);
}
