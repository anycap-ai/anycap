import { useEffect, useState } from 'react';
import { getOrCreateInstallId } from '@/src/lib/install-id';
import { getAuthState } from '@/src/lib/quota';
import { WELCOME_URL, PRICING_URL } from '@/src/lib/constants';

function AnycapMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="20 25 160 150" fill="none" aria-label="AnyCap" className={className}>
      <g transform="rotate(-5 100 100)">
        <rect x="15" y="15" width="170" height="170" rx="8" fill="#d4e0a4" opacity=".18" />
      </g>
      <g transform="rotate(-3 100 100)">
        <rect x="28" y="28" width="144" height="144" rx="5" fill="#8fa34e" opacity=".42" />
      </g>
      <rect x="49" y="49" width="102" height="102" rx="3" fill="#6b7d3a" />
      <rect x="83" y="83" width="34" height="34" rx="2" fill="#f4f5f0" />
    </svg>
  );
}

export default function App() {
  const [installId, setInstallId] = useState('');
  const [remainingTrials, setRemainingTrials] = useState(0);

  useEffect(() => {
    (async () => {
      const id = await getOrCreateInstallId();
      setInstallId(id);
      const state = await getAuthState();
      setRemainingTrials(state.remainingTrials);
    })();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <AnycapMark size={32} />
        <h1 className="text-2xl font-bold text-olive" style={{ letterSpacing: '-0.5px' }}>AnyCap Options</h1>
      </div>
      <p className="text-text-body mt-2">
        Manage your AnyCap extension settings and account.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-surface-card border border-border-card rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-semibold text-text-secondary">Install ID</h2>
          <p className="text-sm text-text-body mt-1 font-mono break-all">{installId}</p>
        </div>

        <div className="bg-surface-card border border-border-card rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-semibold text-text-secondary">Account</h2>
          <p className="text-sm text-text-body mt-1">
            {`Anonymous — ${remainingTrials} free ${remainingTrials === 1 ? 'try' : 'tries'} remaining`}
          </p>
          <p className="mt-1 text-xs text-text-neutral">Account login coming soon.</p>
        </div>

        <div className="bg-surface-card border border-border-card rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 className="text-sm font-semibold text-text-secondary">Links</h2>
          <div className="mt-1 space-y-1">
            <a
              href={WELCOME_URL}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-olive hover:text-olive-hover underline transition-colors"
            >
              Welcome page
            </a>
            <a
              href={PRICING_URL}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-olive hover:text-olive-hover underline transition-colors"
            >
              Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
