import { useState } from 'react';
import { Download, ExternalLink, Sparkles, ImagePlus, Search, FileText, Plus } from 'lucide-react';
import { useStore, type CapabilityTab } from '@/src/lib/store';
import { canGenerate, incrementTrial, getAuthState } from '@/src/lib/quota';
import { generateVariation } from '@/src/lib/api';
import { classifyError, AnyCapError } from '@/src/lib/errors';
import { addGeneration } from '@/src/lib/history';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { ErrorBox } from '../components/ErrorBox';
import { HistorySection } from '../components/HistorySection';

const QUICK_ACTIONS: Array<{ tab: CapabilityTab; icon: typeof Sparkles; title: string; sub: string }> = [
  { tab: 'image', icon: ImagePlus, title: 'Generate image', sub: 'text prompt → AI image' },
  { tab: 'search', icon: Search, title: 'Search the web', sub: '6 source-cited results' },
  { tab: 'crawl', icon: FileText, title: 'Crawl a page', sub: 'extract → markdown' },
];

export function VaryTab() {
  const store = useStore();
  const [prompt, setPrompt] = useState('create a stylistic variation of this image');
  const [model] = useState('nano-banana-2');
  const [srcError, setSrcError] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const req = store.pendingRequest?.kind === 'vary' ? store.pendingRequest : null;

  const handleGenerate = async () => {
    if (!(await canGenerate())) {
      store.setView('paywall');
      return;
    }
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
        const s = await getAuthState();
        store.setAuthState(s.isAuthed, s.remainingTrials);
      }
      const url = result.outputs[0]?.url;
      if (!url) throw new Error('No image returned');
      await addGeneration({
        kind: 'vary',
        resultUrl: url,
        srcUrl: req.image.srcUrl,
        prompt,
        model,
        ts: Date.now(),
      });
      setHistoryKey((k) => k + 1);
      store.setGeneration({ phase: 'success', resultUrl: url });
    } catch (err) {
      const classified = classifyError(err);
      store.setGeneration({ phase: 'error', error: classified });
      if (classified.code === 'TRIAL_EXHAUSTED') store.setView('paywall');
    }
  };

  if (store.generation.phase === 'success') {
    const resultUrl = store.generation.resultUrl;
    return (
      <div className="space-y-3">
        <img
          src={resultUrl}
          alt="Generated variation"
          className="w-full rounded-xl"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
          onError={() =>
            store.setGeneration({ phase: 'error', error: new AnyCapError('UNKNOWN_ERROR', 'Failed to load image.') })
          }
        />
        <div className="flex gap-2">
          <a
            href={resultUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-olive text-white text-sm font-medium py-2.5 rounded-xl hover:bg-olive-hover transition-colors"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)' }}
          >
            <ExternalLink className="w-4 h-4" /> Open
          </a>
          <SecondaryButton onClick={() => store.reset()}>
            <span className="inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New
            </span>
          </SecondaryButton>
          <SecondaryButton
            onClick={() => chrome.downloads.download({ url: resultUrl, filename: `anycap-${Date.now()}.png` })}
          >
            <span className="inline-flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Save
            </span>
          </SecondaryButton>
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="space-y-4">
        {/* Hero illustration */}
        <div className="rounded-2xl bg-gradient-to-br from-pale-sage/40 via-cream-yellow/30 to-transparent border border-border-divider p-5 text-center"
          style={{ boxShadow: '0 6px 24px -16px rgba(107,125,58,0.35)' }}>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto"
            style={{ boxShadow: '0 4px 12px -6px rgba(28,31,23,0.15)' }}>
            <Sparkles className="w-6 h-6 text-olive" strokeWidth={1.8} />
          </div>
          <h2 className="text-sm font-semibold text-text-primary mt-3">Vary an image from any page</h2>
          <p className="text-xs text-text-body mt-1 leading-relaxed">
            Right-click any image, choose
            <br />
            <span className="font-medium">"✨ Generate variation with AnyCap"</span>
          </p>
        </div>

        {/* Or jump to another capability */}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-muted font-semibold mb-1.5">
            Or try another capability
          </div>
          <div className="space-y-1.5">
            {QUICK_ACTIONS.map(({ tab, icon: Icon, title, sub }) => (
              <button
                key={tab}
                onClick={() => store.setActiveTab(tab)}
                className="w-full flex items-center gap-3 rounded-xl border border-border-card bg-surface-input px-3 py-2.5 text-left card-hover"
              >
                <div className="w-8 h-8 rounded-lg bg-pale-sage/40 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-olive" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary leading-tight">{title}</div>
                  <div className="text-[11px] text-text-neutral mt-0.5">{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <HistorySection
          kind="vary"
          reloadKey={historyKey}
          emptyHint="Right-click an image and your variations will accumulate here."
          onPick={(r) => store.setGeneration({ phase: 'success', resultUrl: r.resultUrl })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {srcError ? (
        <div className="w-full h-40 bg-surface rounded-xl flex items-center justify-center text-sm text-text-muted border border-border-card">
          Image preview unavailable
        </div>
      ) : (
        <img
          src={req.image.srcUrl}
          alt="Source"
          className="w-full max-h-48 object-cover rounded-xl"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
          onError={() => setSrcError(true)}
        />
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full text-sm border border-border-input bg-surface-input rounded-xl p-2.5 resize-none h-20 text-text-primary placeholder:text-text-neutral focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
        placeholder="Describe the variation..."
      />
      {store.generation.phase === 'error' && <ErrorBox error={store.generation.error} />}
      <PrimaryButton onClick={handleGenerate} loading={store.generation.phase === 'loading'}>
        {store.generation.phase === 'loading' ? 'Generating…' : 'Generate Variation'}
      </PrimaryButton>

      <HistorySection
        kind="vary"
        reloadKey={historyKey}
        onPick={(r) => store.setGeneration({ phase: 'success', resultUrl: r.resultUrl })}
      />
    </div>
  );
}
