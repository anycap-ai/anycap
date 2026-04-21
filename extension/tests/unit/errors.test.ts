import { describe, it, expect } from 'vitest';
import {
  AnyCapError,
  classifyError,
  classifyHttpError,
  errorMessage,
} from '../../src/lib/errors';

describe('errors', () => {
  it('passes through AnyCapError unchanged', () => {
    const err = new AnyCapError('NETWORK_ERROR', 'oops');
    expect(classifyError(err)).toBe(err);
  });

  it('classifies TypeError with fetch as network', () => {
    const err = new TypeError('Failed to fetch');
    const classified = classifyError(err);
    expect(classified.code).toBe('NETWORK_ERROR');
  });

  it('classifies unknown error', () => {
    const classified = classifyError('boom');
    expect(classified.code).toBe('UNKNOWN_ERROR');
  });

  it('classifies 429 as TRIAL_EXHAUSTED', () => {
    const err = classifyHttpError(429);
    expect(err.code).toBe('TRIAL_EXHAUSTED');
    expect(err.status).toBe(429);
  });

  it('classifies 401 as UNAUTHORIZED', () => {
    const err = classifyHttpError(401, { message: 'bad token' });
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('bad token');
  });

  it('classifies 500 as SERVER_ERROR', () => {
    const err = classifyHttpError(503);
    expect(err.code).toBe('SERVER_ERROR');
  });

  it('returns human-readable messages for every code', () => {
    const codes = [
      'TRIAL_EXHAUSTED',
      'UNAUTHORIZED',
      'IMAGE_TOO_SMALL',
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'CSP_BLOCKED',
      'UNKNOWN_ERROR',
    ] as const;
    for (const code of codes) {
      const msg = errorMessage(code);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});
