import { Spinner } from './Spinner';

export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full bg-olive text-white text-sm font-medium py-2.5 rounded-xl hover:bg-olive-hover disabled:bg-pale-sage disabled:text-white/70 disabled:shadow-none disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)' }}
    >
      {loading ? (
        <>
          <Spinner />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-surface-input border border-border-input text-text-body text-sm font-medium py-2.5 rounded-xl hover:bg-surface-hover hover:border-border-input-hover transition-colors px-3"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      {children}
    </button>
  );
}
