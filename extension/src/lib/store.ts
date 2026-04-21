import { create } from 'zustand';
import { AnyCapError } from './errors';

export type GenerationState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success'; resultUrl: string }
  | { phase: 'error'; error: AnyCapError };

export type PopupView =
  | 'welcome'
  | 'generate'
  | 'result'
  | 'auth'
  | 'paywall';

type PendingRequest = {
  image: { srcUrl: string; width: number; height: number };
  pageUrl: string;
};

type Store = {
  view: PopupView;
  generation: GenerationState;
  pendingRequest: PendingRequest | null;
  remainingTrials: number;
  isAuthed: boolean;

  setView: (v: PopupView) => void;
  setGeneration: (g: GenerationState) => void;
  setPendingRequest: (r: PendingRequest | null) => void;
  setAuthState: (isAuthed: boolean, remainingTrials: number) => void;
  reset: () => void;
};

export const useStore = create<Store>((set) => ({
  view: 'generate',
  generation: { phase: 'idle' },
  pendingRequest: null,
  remainingTrials: 0,
  isAuthed: false,

  setView: (v) => set({ view: v }),
  setGeneration: (g) => set({ generation: g }),
  setPendingRequest: (r) => set({ pendingRequest: r }),
  setAuthState: (isAuthed, remainingTrials) => set({ isAuthed, remainingTrials }),
  reset: () =>
    set({
      view: 'generate',
      generation: { phase: 'idle' },
      pendingRequest: null,
    }),
}));
