// Persistent user settings stored in chrome.storage.local.
// Read once at side panel mount, written on user change.

import { getStored, setStored } from './storage';

export type UserSettings = {
  // User-tweakable defaults across capability tabs
  defaultImageModel: string;
  defaultVideoModel: string;
  defaultMusicModel: string;
  // Watermark preference for anonymous users (server still enforces if pro=false)
  watermarkOptOut: boolean;
  // Display
  reducedMotion: boolean;
  // Personal info (placeholder until real auth wires up)
  displayName: string;
};

export const DEFAULT_SETTINGS: UserSettings = {
  defaultImageModel: 'nano-banana-2',
  defaultVideoModel: 'veo-3-1',
  defaultMusicModel: 'lyria-2',
  watermarkOptOut: false,
  reducedMotion: false,
  displayName: '',
};

const KEY = 'userSettings';

export async function loadSettings(): Promise<UserSettings> {
  const raw = await getStored(KEY);
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(raw as Partial<UserSettings>) };
}

export async function saveSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await setStored(KEY, next);
  return next;
}

export async function resetSettings(): Promise<UserSettings> {
  await setStored(KEY, { ...DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS };
}

export async function resetTrial(): Promise<void> {
  // Clear quota counters so the user gets a fresh 3 free tries.
  await setStored('trialCount', 0);
  await setStored('trialFirstUsedAt', null);
}
