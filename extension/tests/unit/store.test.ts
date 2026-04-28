import { describe, it, expect } from 'vitest';
import { useStore } from '../../src/lib/store';

describe('store', () => {
  it('has default state', () => {
    const state = useStore.getState();
    expect(state.view).toBe('generate');
    expect(state.generation.phase).toBe('idle');
    expect(state.pendingRequest).toBeNull();
    expect(state.isAuthed).toBe(false);
    expect(state.remainingTrials).toBe(0);
  });

  it('sets view', () => {
    useStore.getState().setView('paywall');
    expect(useStore.getState().view).toBe('paywall');
  });

  it('sets generation', () => {
    useStore.getState().setGeneration({ phase: 'loading' });
    expect(useStore.getState().generation.phase).toBe('loading');
  });

  it('sets pending request', () => {
    const req = { kind: 'vary' as const, image: { srcUrl: 'https://example.com/img.png', width: 300, height: 300 }, pageUrl: 'https://example.com' };
    useStore.getState().setPendingRequest(req);
    expect(useStore.getState().pendingRequest).toEqual(req);
  });

  it('sets auth state', () => {
    useStore.getState().setAuthState(true, Infinity);
    expect(useStore.getState().isAuthed).toBe(true);
    expect(useStore.getState().remainingTrials).toBe(Infinity);
  });

  it('resets to idle', () => {
    const s = useStore.getState();
    s.setView('result');
    s.setGeneration({ phase: 'success', resultUrl: 'https://example.com/result.png' });
    s.setPendingRequest({ kind: 'vary', image: { srcUrl: 'https://example.com/img.png', width: 300, height: 300 }, pageUrl: 'https://example.com' });

    s.reset();
    const state = useStore.getState();
    expect(state.view).toBe('generate');
    expect(state.generation.phase).toBe('idle');
    expect(state.pendingRequest).toBeNull();
  });
});
