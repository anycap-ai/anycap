import { useEffect, useState } from 'react';
import { getOrCreateInstallId } from '@/src/lib/install-id';
import { getAuthState } from '@/src/lib/quota';
import { signOut } from '@/src/lib/auth';
import { WELCOME_URL, PRICING_URL } from '@/src/lib/constants';

export default function App() {
  const [installId, setInstallId] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [remainingTrials, setRemainingTrials] = useState(0);

  useEffect(() => {
    (async () => {
      const id = await getOrCreateInstallId();
      setInstallId(id);
      const state = await getAuthState();
      setIsAuthed(state.isAuthed);
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
            {isAuthed ? 'Signed in' : `Anonymous — ${remainingTrials} free ${remainingTrials === 1 ? 'try' : 'tries'} remaining`}
          </p>
          {isAuthed ? (
            <button
              onClick={async () => {
                await signOut();
                const state = await getAuthState();
                setIsAuthed(state.isAuthed);
                setRemainingTrials(state.remainingTrials);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Sign out
            </button>
          ) : (
            <a
              href={WELCOME_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Sign in to get 50 free credits per month
            </a>
          )}
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
