import { useEffect, useState } from 'react';
import { useStore } from '@/src/lib/store';
import { getAuthState, canGenerate, incrementTrial } from '@/src/lib/quota';
import { generateVariation, fetchExtensionConfig } from '@/src/lib/api';
import { classifyError, errorMessage } from '@/src/lib/errors';
// import { signIn, signOut } from '@/src/lib/auth';
import { addGeneration, getRecentGenerations, type GenerationRecord } from '@/src/lib/history';
// import { saveToDrive } from '@/src/lib/drive';

function ResultActions({ resultUrl }: { resultUrl: string }) {
  const handleDownload = () => {
    chrome.downloads.download({
      url: resultUrl,
      filename: `anycap-${Date.now()}.png`,
    });
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
    >
      Download
    </button>
  );
}

export default function App() {
  const store = useStore();
  const [prompt, setPrompt] = useState('create a stylistic variation of this image');
  const [model, setModel] = useState('nano-banana-2');
  const [history, setHistory] = useState<GenerationRecord[]>([]);

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

      const recent = await getRecentGenerations();
      setHistory(recent);
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
      const state = await getAuthState();
      const result = await generateVariation({
        prompt,
        model,
        images: [req.image.srcUrl],
        watermark: !state.isAuthed,
      });

      if (!store.isAuthed) {
        await incrementTrial();
        const state = await getAuthState();
        store.setAuthState(state.isAuthed, state.remainingTrials);
      }

      const url = result.outputs[0]?.url;
      if (url) {
        await addGeneration({
          resultUrl: url,
          srcUrl: req.image.srcUrl,
          ts: Date.now(),
        });
        const recent = await getRecentGenerations();
        setHistory(recent);
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
      <div className="p-5 w-80 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900 mt-3">Free Tries Used</h2>
        <p className="text-sm text-gray-600 mt-1">
          You have used all 3 free generations. Sign in to get 50 free credits per month.
        </p>
        <p className="mt-3 text-xs text-gray-400">Account login coming soon.</p>
      </div>
    );
  }

  if (store.view === 'result' && store.generation.phase === 'success') {
    return (
      <div className="p-5 w-80">
        <img
          src={store.generation.resultUrl}
          alt="Generated variation"
          className="w-full rounded-lg shadow-sm"
        />
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-2">
            <a
              href={store.generation.resultUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open
            </a>
            <button
              onClick={() => {
                store.reset();
                store.setView('generate');
              }}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              New
            </button>
          </div>
          <ResultActions resultUrl={store.generation.resultUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 w-80">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-blue-600">AnyCap</h1>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        {`${store.remainingTrials} free ${store.remainingTrials === 1 ? 'try' : 'tries'} remaining`}
      </p>

      {store.pendingRequest ? (
        <>
          <div className="mt-3">
            <img
              src={store.pendingRequest.image.srcUrl}
              alt="Source"
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-3 w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {store.generation.phase === 'loading' ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Variation'
            )}
          </button>
        </>
      ) : (
        <div className="mt-4">
          {history.length > 0 ? (
            <>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent</h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {history.map((item, i) => (
                  <a key={i} href={item.resultUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={item.resultUrl}
                      alt="Recent"
                      className="w-full h-16 object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Right-click any image and select "Generate variation with AnyCap" to start.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
