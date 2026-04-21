import { useEffect, useState } from 'react';
import { getOrCreateInstallId } from '@/src/lib/install-id';
import { getAuthState } from '@/src/lib/quota';
import { WELCOME_URL, PRICING_URL } from '@/src/lib/constants';

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
      <h1 className="text-2xl font-bold text-blue-600">AnyCap Options</h1>
      <p className="text-gray-600 mt-2">
        Manage your AnyCap extension settings and account.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700">Install ID</h2>
          <p className="text-sm text-gray-600 mt-1 font-mono break-all">{installId}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700">Account</h2>
          <p className="text-sm text-gray-600 mt-1">
            {`Anonymous — ${remainingTrials} free ${remainingTrials === 1 ? 'try' : 'tries'} remaining`}
          </p>
          <p className="mt-1 text-xs text-gray-400">Account login coming soon.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700">Links</h2>
          <div className="mt-1 space-y-1">
            <a
              href={WELCOME_URL}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Welcome page
            </a>
            <a
              href={PRICING_URL}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
