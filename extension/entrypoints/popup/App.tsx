import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/src/lib/store';
import { getAuthState, canGenerate, incrementTrial } from '@/src/lib/quota';
import { generateVariation, fetchExtensionConfig } from '@/src/lib/api';
import { classifyError, errorMessage, AnyCapError } from '@/src/lib/errors';
import { addGeneration, getRecentGenerations, clearHistory, type GenerationRecord } from '@/src/lib/history';

function AnycapMark({ size = 28, className }: { size?: number; className?: string }) {
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
      className="w-full bg-surface-input border border-border-input text-text-body text-sm font-medium py-2.5 rounded-xl hover:bg-surface-hover hover:border-border-input-hover transition-colors"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
    >
      Download
    </button>
  );
}

function TrialBadge({ isAuthed, remainingTrials }: { isAuthed: boolean; remainingTrials: number }) {
  if (isAuthed) {
    return <p className="text-xs text-olive mt-0.5 font-medium">Signed in</p>;
  }
  if (remainingTrials === Infinity) {
    return <p className="text-xs text-olive mt-0.5 font-medium">Unlimited tries</p>;
  }
  return (
    <p className="text-xs text-text-muted mt-0.5">
      {`${remainingTrials} free ${remainingTrials === 1 ? 'try' : 'tries'} remaining`}
    </p>
  );
}

export default function App() {
  const store = useStore();
  const [prompt, setPrompt] = useState('create a stylistic variation of this image');
  const [model, setModel] = useState('nano-banana-2');
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [srcError, setSrcError] = useState(false);

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

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
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
        <div className="w-12 h-12 bg-pale-sage/30 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-text-primary mt-3">Free Tries Used</h2>
        <p className="text-sm text-text-body mt-1">
          You have used all 3 free generations. Sign in to get 50 free credits per month.
        </p>
        <p className="mt-3 text-xs text-text-neutral">Account login coming soon.</p>
      </div>
    );
  }

  if (store.view === 'result' && store.generation.phase === 'success') {
    return (
      <div className="p-5 w-80">
        <img
          src={store.generation.resultUrl}
          alt="Generated variation"
          className="w-full rounded-xl"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
          loading="lazy"
          onError={() => store.setGeneration({ phase: 'error', error: new AnyCapError('UNKNOWN_ERROR', 'Failed to load generated image.') })}
        />
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-2">
            <a
              href={store.generation.resultUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-olive text-white text-sm font-medium py-2.5 rounded-xl hover:bg-olive-hover transition-colors"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              Open
            </a>
            <button
              onClick={() => {
                store.reset();
                store.setView('generate');
              }}
              className="flex-1 bg-surface-input border border-border-input text-text-body text-sm font-medium py-2.5 rounded-xl hover:bg-surface-hover hover:border-border-input-hover transition-colors"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
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
      <div className="flex items-center gap-2">
        <AnycapMark size={28} />
        <h1 className="text-base font-bold text-olive" style={{ letterSpacing: '-0.5px' }}>AnyCap</h1>
      </div>
      <TrialBadge isAuthed={store.isAuthed} remainingTrials={store.remainingTrials} />

      {store.pendingRequest ? (
        <>
          <div className="mt-3">
            {srcError ? (
              <div className="w-full h-32 bg-surface rounded-xl flex items-center justify-center text-sm text-text-muted border border-border-card">
                Image preview unavailable
              </div>
            ) : (
              <img
                src={store.pendingRequest.image.srcUrl}
                alt="Source"
                className="w-full h-32 object-cover rounded-xl"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
                onError={() => setSrcError(true)}
              />
            )}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-3 w-full text-sm border border-border-input bg-surface-input rounded-xl p-2.5 resize-none h-20 text-text-primary placeholder:text-text-neutral focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
            placeholder="Describe the variation..."
          />
          {store.generation.phase === 'error' && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-error/10 p-2.5">
              <svg className="w-4 h-4 text-error mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error">
                {errorMessage(store.generation.error.code)}
              </p>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={store.generation.phase === 'loading'}
            className="mt-3 w-full bg-olive text-white text-sm font-medium py-2.5 rounded-xl hover:bg-olive-hover disabled:bg-pale-sage disabled:text-white/70 disabled:shadow-none disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)' }}
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
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Recent</h2>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-text-neutral hover:text-error transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {history.map((item, i) => (
                  <a key={i} href={item.resultUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={item.resultUrl}
                      alt="Recent"
                      className="w-full h-16 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-pale-sage/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-sm text-text-body mt-2">
                Right-click any image and select "Generate variation with AnyCap" to start.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
