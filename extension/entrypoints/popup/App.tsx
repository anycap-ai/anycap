import { useEffect, useState } from 'react';
import { useStore } from '@/src/lib/store';
import { getAuthState, canGenerate, incrementTrial } from '@/src/lib/quota';
import { generateVariation, fetchExtensionConfig } from '@/src/lib/api';
import { classifyError, errorMessage } from '@/src/lib/errors';
import { signIn, signOut } from '@/src/lib/auth';

export default function App() {
  const store = useStore();
  const [prompt, setPrompt] = useState('create a stylistic variation of this image');
  const [model, setModel] = useState('nano-banana-2');

  useEffect(() => {
    (async () => {
      const session = await chrome.storage.session.get('pendingRequest');
      if (session.pendingRequest && typeof session.pendingRequest === 'object') {
        store.setPendingRequest(session.pendingRequest as any);
        await chrome.storage.session.remove('pendingRequest');
      }

      const state = await getAuthState();
      store.setAuthState(state.isAuthed, state.remainingTrials);
      if (!state.isAuthed && state.remainingTrials === 0) {
        store.setView('paywall');
      }

      try {
        const cfg = await fetchExtensionConfig();
        setPrompt(cfg.default_prompt);
        setModel(cfg.default_model);
      } catch {
        // ignore: use hardcoded defaults if server is unreachable
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!(await canGenerate())) {
      store.setView('paywall');
      return;
    }

    const req = store.pendingRequest;
    if (!req) return;

    store.setGeneration({ phase: 'loading' });

    try {
      const result = await generateVariation({
        prompt,
        model,
        images: [req.image.srcUrl],
      });

      if (!store.isAuthed) {
        await incrementTrial();
        const state = await getAuthState();
        store.setAuthState(state.isAuthed, state.remainingTrials);
      }

      const url = result.outputs[0]?.url;
      if (url) {
        store.setGeneration({ phase: 'success', resultUrl: url });
        store.setView('result');
      } else {
        throw new Error('No image returned');
      }
    } catch (err) {
      const classified = classifyError(err);
      store.setGeneration({ phase: 'error', error: classified });
      if (classified.code === 'TRIAL_EXHAUSTED') {
        store.setView('paywall');
      }
    }
  };

  if (store.view === 'paywall') {
    return (
      <div className="p-4 w-80 text-center">
        <h2 className="text-lg font-bold text-gray-900">Free Tries Used</h2>
        <p className="text-sm text-gray-600 mt-2">
          You have used all 3 free generations. Sign in to get 50 free credits per month.
        </p>
        <button
          onClick={() => store.setView('auth')}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (store.view === 'auth') {
    return (
      <div className="p-4 w-80 text-center">
        <h2 className="text-lg font-bold text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-600 mt-2">Connect your AnyCap account to get 50 free credits per month.</p>
        <button
          onClick={async () => {
            const token = await signIn();
            if (token) {
              const state = await getAuthState();
              store.setAuthState(state.isAuthed, state.remainingTrials);
              store.setView('generate');
            }
          }}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Sign In with AnyCap
        </button>
        <button
          onClick={() => store.setView('generate')}
          className="mt-2 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  if (store.view === 'result' && store.generation.phase === 'success') {
    return (
      <div className="p-4 w-80">
        <img
          src={store.generation.resultUrl}
          alt="Generated variation"
          className="w-full rounded-lg"
        />
        <div className="flex gap-2 mt-3">
          <a
            href={store.generation.resultUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Open
          </a>
          <button
            onClick={() => {
              store.reset();
              store.setView('generate');
            }}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
          >
            New
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-80">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">AnyCap</h1>
        {store.isAuthed ? (
          <button
            onClick={async () => {
              await signOut();
              const state = await getAuthState();
              store.setAuthState(state.isAuthed, state.remainingTrials);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Sign out
          </button>
        ) : null}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {store.isAuthed
          ? 'Signed in'
          : `${store.remainingTrials} free ${store.remainingTrials === 1 ? 'try' : 'tries'} remaining`}
      </p>

      {store.pendingRequest ? (
        <>
          <div className="mt-3">
            <img
              src={store.pendingRequest.image.srcUrl}
              alt="Source"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-3 w-full text-sm border rounded-lg p-2 resize-none h-20"
            placeholder="Describe the variation..."
          />
          {store.generation.phase === 'error' && (
            <p className="mt-2 text-sm text-red-600">
              {errorMessage(store.generation.error.code)}
            </p>
          )}
          <button
            onClick={handleGenerate}
            disabled={store.generation.phase === 'loading'}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {store.generation.phase === 'loading' ? 'Generating...' : 'Generate Variation'}
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-600 mt-2">
          Right-click any image and select "Generate variation with AnyCap" to start.
        </p>
      )}
    </div>
  );
}
