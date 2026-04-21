export type StoredSchema = {
  trialCount: number;
  trialFirstUsedAt: number | null;
  authToken: string | null;
  installId: string | null;
  apiKey: string | null;
  recentGenerations: Array<{ resultUrl: string; srcUrl: string; ts: number }>;
};

const DEFAULTS: StoredSchema = {
  trialCount: 0,
  trialFirstUsedAt: null,
  authToken: null,
  installId: null,
  apiKey: null,
  recentGenerations: [],
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
