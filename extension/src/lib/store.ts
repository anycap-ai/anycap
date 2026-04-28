import { create } from 'zustand';
import { AnyCapError } from './errors';

export type CapabilityTab = 'vary' | 'image' | 'video' | 'music' | 'search' | 'crawl' | 'settings';

export type GenerationState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success'; resultUrl: string }
  | { phase: 'error'; error: AnyCapError };

export type PopupView = 'welcome' | 'generate' | 'result' | 'auth' | 'paywall';

export type PendingRequest =
  // Right-clicked an image → vary it
  | {
      kind: 'vary';
      image: { srcUrl: string; width: number; height: number };
      pageUrl: string;
    }
  // Right-clicked text selection → generate image / video / music / search
  | {
      kind: 'image-from-text';
      prompt: string;
      pageUrl: string;
    }
  | {
      kind: 'video-from-text';
      prompt: string;
      pageUrl: string;
    }
  | {
      kind: 'music-from-text';
      prompt: string;
      pageUrl: string;
    }
  | {
      kind: 'search';
      query: string;
      pageUrl: string;
    }
  // Right-clicked page or link → crawl URL
  | {
      kind: 'crawl';
      url: string;
      pageUrl: string;
    };

type Store = {
  // Active tab (which capability the user is viewing)
  activeTab: CapabilityTab;
  // Legacy popup view kept for paywall flow
  view: PopupView;
  generation: GenerationState;
  pendingRequest: PendingRequest | null;
  remainingTrials: number;
  isAuthed: boolean;

  setActiveTab: (t: CapabilityTab) => void;
  setView: (v: PopupView) => void;
  setGeneration: (g: GenerationState) => void;
  setPendingRequest: (r: PendingRequest | null) => void;
  setAuthState: (isAuthed: boolean, remainingTrials: number) => void;
  reset: () => void;
};

export const useStore = create<Store>((set) => ({
  activeTab: 'vary',
  view: 'generate',
  generation: { phase: 'idle' },
  pendingRequest: null,
  remainingTrials: 0,
  isAuthed: false,

  setActiveTab: (t) => set({ activeTab: t }),
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
