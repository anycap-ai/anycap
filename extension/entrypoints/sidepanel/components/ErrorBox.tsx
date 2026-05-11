import type { AnyCapError, AnyCapErrorCode } from '@/src/lib/errors';
import { errorMessage } from '@/src/lib/errors';
import { AlertCircle, AlertTriangle, Lock, WifiOff, RotateCcw } from 'lucide-react';

const ICON_MAP: Record<AnyCapErrorCode, typeof AlertCircle> = {
  OFFLINE: WifiOff,
  SERVER_ERROR: AlertTriangle,
  NETWORK_ERROR: WifiOff,
  UNAUTHORIZED: Lock,
  TRIAL_EXHAUSTED: AlertCircle,
  IMAGE_TOO_SMALL: AlertCircle,
  CSP_BLOCKED: AlertCircle,
  UNKNOWN_ERROR: AlertCircle,
};

const ACTION_LABEL: Partial<Record<AnyCapErrorCode, string>> = {
  OFFLINE: 'Retry',
  SERVER_ERROR: 'Retry',
  NETWORK_ERROR: 'Retry',
  UNAUTHORIZED: 'Go to Settings',
  UNKNOWN_ERROR: 'Retry',
};

export function ErrorBox({
  error,
  onRetry,
  onLogin,
}: {
  error: AnyCapError;
  onRetry?: () => void;
  onLogin?: () => void;
}) {
  const Icon = ICON_MAP[error.code] ?? AlertCircle;
  const actionLabel = ACTION_LABEL[error.code];
  const canRetry = onRetry && error.code !== 'TRIAL_EXHAUSTED' && error.code !== 'IMAGE_TOO_SMALL' && error.code !== 'CSP_BLOCKED';
  const canLogin = onLogin && error.code === 'UNAUTHORIZED';

  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-error/10 p-3">
      <Icon className="w-4 h-4 text-error mt-0.5 shrink-0" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-error leading-snug">{errorMessage(error.code)}</p>
        {(canRetry || canLogin) && (
          <button
            type="button"
            onClick={canLogin ? onLogin : onRetry}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-error hover:text-error-hover hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-error/30 rounded px-1 -mx-1"
          >
            <RotateCcw className="w-3 h-3" />
            {canLogin ? 'Go to Settings' : actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
