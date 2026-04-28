import type { AnyCapError } from '@/src/lib/errors';
import { errorMessage } from '@/src/lib/errors';

export function ErrorBox({ error }: { error: AnyCapError }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-error/10 p-2.5">
      <svg className="w-4 h-4 text-error mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-error">{errorMessage(error.code)}</p>
    </div>
  );
}
