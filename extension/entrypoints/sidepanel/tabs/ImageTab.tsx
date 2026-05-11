import { useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { useStore } from '@/src/lib/store';
import { canGenerate, incrementTrial, getAuthState } from '@/src/lib/quota';
import { generateImage } from '@/src/lib/api';
import { classifyError } from '@/src/lib/errors';
import { addGeneration } from '@/src/lib/history';
import { HistorySection } from '../components/HistorySection';
import { loadSettings } from '@/src/lib/settings';
import { IMAGE_TEMPLATES } from '@/src/lib/templates';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { ErrorBox } from '../components/ErrorBox';
import { TemplateChips } from '../components/TemplateChips';

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '4:5'];
const MODELS = ['nano-banana-2', 'seedream-5', 'flux-dev'];

export function ImageTab() {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('nano-banana-2');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setModel(s.defaultImageModel);
    })();
  }, []);

  useEffect(() => {
    if (store.pendingRequest?.kind === 'image-from-text') {
      setPrompt(store.pendingRequest.prompt);
    }
  }, [store.pendingRequest]);

  const run = async () => {
    if (!prompt.trim()) return;
    if (!(await canGenerate())) {
      store.setView('paywall');
      return;
    }
    setPhase('loading');
    setError(null);
    try {
      const result = await generateImage({ prompt, model, aspectRatio });
      if (!store.isAuthed) {
        await incrementTrial();
        const s = await getAuthState();
        store.setAuthState(s.isAuthed, s.remainingTrials);
      }
      const url = result.outputs[0]?.url;
      if (!url) throw new Error('No image returned');
      await addGeneration({
        kind: 'image',
        resultUrl: url,
        srcUrl: '',
        prompt,
        model,
        aspectRatio,
        ts: Date.now(),
      });
      setResultUrl(url);
      setPhase('idle');
      setHistoryKey((k) => k + 1);
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setPhase('error');
      if (classified.code === 'TRIAL_EXHAUSTED') store.setView('paywall');
    }
  };

  return (
    <div className="space-y-3">
      <TemplateChips
        templates={IMAGE_TEMPLATES}
        onPick={(t) => {
          setPrompt(t.prompt);
          if (t.params?.aspectRatio) setAspectRatio(t.params.aspectRatio);
          if (t.params?.model) setModel(t.params.model);
        }}
      />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate…"
        className="w-full text-sm border border-border-input bg-surface-input rounded-xl p-2.5 resize-none h-24 text-text-primary placeholder:text-text-neutral focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-text-muted">
          Model
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full text-sm border border-border-input bg-surface-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-text-muted">
          Aspect ratio
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="mt-1 w-full text-sm border border-border-input bg-surface-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
          >
            {RATIOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {phase === 'error' && error && <ErrorBox error={error} onRetry={run} />}

      <PrimaryButton onClick={run} loading={phase === 'loading'} disabled={!prompt.trim()}>
        {phase === 'loading' ? 'Generating…' : 'Generate Image'}
      </PrimaryButton>

      {resultUrl && (
        <div className="space-y-2 pt-1">
          <img
            src={resultUrl}
            alt="Generated"
            className="w-full rounded-xl"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
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
            <SecondaryButton
              onClick={() => chrome.downloads.download({ url: resultUrl, filename: `anycap-${Date.now()}.png` })}
            >
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download
              </span>
            </SecondaryButton>
          </div>
        </div>
      )}

      <HistorySection
        kind="image"
        reloadKey={historyKey}
        onPick={(r) => {
          if (r.prompt) setPrompt(r.prompt);
          if (r.model) setModel(r.model);
          if (r.aspectRatio) setAspectRatio(r.aspectRatio);
          setResultUrl(r.resultUrl);
        }}
      />
    </div>
  );
}
