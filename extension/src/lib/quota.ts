import { getStored, setStored } from './storage';
import { MAX_ANON_TRIALS } from './constants';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthState = {
  isAuthed: boolean;
  remainingTrials: number;
};

export async function getAuthState(): Promise<AuthState> {
  const token = await getStored('authToken');
  if (token) return { isAuthed: true, remainingTrials: Infinity };

  const count = await getStored('trialCount');
  const firstUsed = await getStored('trialFirstUsedAt');

  if (firstUsed !== null && Date.now() - firstUsed > THIRTY_DAYS_MS) {
    await setStored('trialCount', 0);
    await setStored('trialFirstUsedAt', null);
    return { isAuthed: false, remainingTrials: MAX_ANON_TRIALS };
  }

  const remaining = Math.max(0, MAX_ANON_TRIALS - count);
  return { isAuthed: false, remainingTrials: remaining };
}

export async function canGenerate(): Promise<boolean> {
  const state = await getAuthState();
  return state.isAuthed || state.remainingTrials > 0;
}

export async function incrementTrial(): Promise<void> {
  const firstUsed = await getStored('trialFirstUsedAt');
  if (firstUsed === null) {
    await setStored('trialFirstUsedAt', Date.now());
  }
  const count = await getStored('trialCount');
  await setStored('trialCount', count + 1);
}
