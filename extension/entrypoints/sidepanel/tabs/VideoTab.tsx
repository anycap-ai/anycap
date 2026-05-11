import { useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { useStore } from '@/src/lib/store';
import { canGenerate, incrementTrial, getAuthState } from '@/src/lib/quota';
import { generateVideo } from '@/src/lib/api';
import { classifyError } from '@/src/lib/errors';
import { loadSettings } from '@/src/lib/settings';
import { VIDEO_TEMPLATES } from '@/src/lib/templates';
import { addGeneration } from '@/src/lib/history';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { ErrorBox } from '../components/ErrorBox';
import { TemplateChips } from '../components/TemplateChips';
import { HistorySection } from '../components/HistorySection';

const MODELS = ['veo-3-1', 'kling-2', 'sora-1'];
const DURATIONS = [3, 5, 8];

export function VideoTab() {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('veo-3-1');
  const [duration, setDuration] = useState(5);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | undefined>();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setModel(s.defaultVideoModel);
    })();
  }, []);

  useEffect(() => {
    if (store.pendingRequest?.kind === 'video-from-text') {
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
      const result = await generateVideo({ prompt, model, durationSeconds: duration });
      if (!store.isAuthed) {
        await incrementTrial();
        const s = await getAuthState();
        store.setAuthState(s.isAuthed, s.remainingTrials);
      }
      const out = result.outputs[0];
      if (!out?.url) throw new Error('No video returned');
      await addGeneration({
        kind: 'video',
        resultUrl: out.url,
        srcUrl: out.poster ?? '',
        prompt,
        model,
        durationSeconds: duration,
        ts: Date.now(),
      });
      setResultUrl(out.url);
      setPoster(out.poster);
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
        templates={VIDEO_TEMPLATES}
        onPick={(t) => {
          setPrompt(t.prompt);
          if (t.params?.durationSeconds) setDuration(t.params.durationSeconds);
          if (t.params?.model) setModel(t.params.model);
        }}
      />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the video you want to generate…"
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
          Duration
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full text-sm border border-border-input bg-surface-input rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </select>
        </label>
      </div>

      {phase === 'error' && error && <ErrorBox error={error} onRetry={run} />}

      <PrimaryButton onClick={run} loading={phase === 'loading'} disabled={!prompt.trim()}>
        {phase === 'loading' ? 'Rendering…' : 'Generate Video'}
      </PrimaryButton>

      {resultUrl && (
        <div className="space-y-2 pt-1">
          <video
            src={resultUrl}
            poster={poster}
            controls
            playsInline
            className="w-full rounded-xl bg-black"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
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
              onClick={() => chrome.downloads.download({ url: resultUrl, filename: `anycap-${Date.now()}.mp4` })}
            >
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download
              </span>
            </SecondaryButton>
          </div>
        </div>
      )}

      <HistorySection
        kind="video"
        reloadKey={historyKey}
        onPick={(r) => {
          if (r.prompt) setPrompt(r.prompt);
          if (r.model) setModel(r.model);
          if (r.durationSeconds) setDuration(r.durationSeconds);
          setResultUrl(r.resultUrl);
          setPoster(r.srcUrl || undefined);
        }}
      />
    </div>
  );
}
