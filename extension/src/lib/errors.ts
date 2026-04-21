export type AnyCapErrorCode =
  | 'TRIAL_EXHAUSTED'
  | 'UNAUTHORIZED'
  | 'IMAGE_TOO_SMALL'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'CSP_BLOCKED'
  | 'UNKNOWN_ERROR';

export class AnyCapError extends Error {
  constructor(
    public readonly code: AnyCapErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'AnyCapError';
  }
}

export function classifyError(err: unknown): AnyCapError {
  if (err instanceof AnyCapError) return err;

  if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network'))) {
    return new AnyCapError('NETWORK_ERROR', 'Network error. Please check your connection and try again.');
  }

  return new AnyCapError('UNKNOWN_ERROR', err instanceof Error ? err.message : 'An unexpected error occurred.');
}

export function classifyHttpError(status: number, body?: { code?: string; message?: string }): AnyCapError {
  const message = body?.message ?? `HTTP ${status}`;

  if (status === 429) {
    return new AnyCapError('TRIAL_EXHAUSTED', message || 'Trial limit reached. Sign in to continue.', status);
  }
  if (status === 401) {
    return new AnyCapError('UNAUTHORIZED', message || 'Session expired. Please sign in again.', status);
  }
  if (status >= 500) {
    return new AnyCapError('SERVER_ERROR', message || 'Server error. Please try again later.', status);
  }
  return new AnyCapError('UNKNOWN_ERROR', message, status);
}

export function errorMessage(code: AnyCapErrorCode): string {
  const map: Record<AnyCapErrorCode, string> = {
    TRIAL_EXHAUSTED: 'You have used all free tries. Sign in to get 50 free credits per month.',
    UNAUTHORIZED: 'Your session has expired. Please sign in again.',
    IMAGE_TOO_SMALL: 'Image is too small. Minimum dimension is 256 pixels.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    CSP_BLOCKED: 'This page blocks image access. Try opening the image in a new tab first.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  };
  return map[code];
}
