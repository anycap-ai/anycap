import { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';
import { useStore } from '@/src/lib/store';
import { canGenerate, incrementTrial, getAuthState } from '@/src/lib/quota';
import { crawlPage, type CrawlPageResult } from '@/src/lib/api';
import { classifyError } from '@/src/lib/errors';
import { CRAWL_TEMPLATES } from '@/src/lib/templates';
import { addGeneration } from '@/src/lib/history';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { ErrorBox } from '../components/ErrorBox';
import { TemplateChips } from '../components/TemplateChips';
import { HistorySection } from '../components/HistorySection';

export function CrawlTab() {
  const store = useStore();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CrawlPageResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    if (store.pendingRequest?.kind === 'crawl') setUrl(store.pendingRequest.url);
  }, [store.pendingRequest]);

  const run = async () => {
    if (!url.trim()) return;
    if (!(await canGenerate())) {
      store.setView('paywall');
      return;
    }
    setPhase('loading');
    setError(null);
    try {
      const data = await crawlPage({ url });
      if (!store.isAuthed) {
        await incrementTrial();
        const s = await getAuthState();
        store.setAuthState(s.isAuthed, s.remainingTrials);
      }
      await addGeneration({
        kind: 'crawl',
        resultUrl: data.url,
        srcUrl: '',
        prompt: url,
        title: data.title,
        ts: Date.now(),
      });
      setResult(data);
      setPhase('idle');
      setHistoryKey((k) => k + 1);
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setPhase('error');
      if (classified.code === 'TRIAL_EXHAUSTED') store.setView('paywall');
    }
  };

  const useCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) setUrl(tab.url);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <TemplateChips templates={CRAWL_TEMPLATES} onPick={(t) => setUrl(t.prompt)} />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && run()}
        placeholder="https://example.com/article"
        className="w-full text-sm border border-border-input bg-surface-input rounded-xl px-3 py-2.5 text-text-primary placeholder:text-text-neutral focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
      />

      <button
        onClick={useCurrentTab}
        className="inline-flex items-center gap-1 text-xs text-olive hover:text-olive-hover hover:underline"
      >
        <Globe2 className="w-3.5 h-3.5" /> Use current tab URL
      </button>

      {phase === 'error' && error && <ErrorBox error={error} />}

      <PrimaryButton onClick={run} loading={phase === 'loading'} disabled={!url.trim()}>
        {phase === 'loading' ? 'Reading…' : 'Crawl Page'}
      </PrimaryButton>

      {result && (
        <div className="space-y-2 pt-1">
          <div
            className="rounded-xl border border-border-card bg-surface-input p-3"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h3 className="text-sm font-semibold text-text-primary leading-snug">{result.title}</h3>
            <p className="text-xs text-text-neutral mt-0.5">
              {result.word_count.toLocaleString()} words · {result.language.toUpperCase()}
            </p>
            <p className="text-sm text-text-body mt-2 leading-relaxed">{result.summary}</p>
          </div>

          <details className="rounded-xl border border-border-card bg-surface-input p-3">
            <summary className="text-sm font-medium text-text-primary cursor-pointer select-none">
              View extracted markdown
            </summary>
            <pre className="text-xs text-text-body whitespace-pre-wrap mt-2 max-h-64 overflow-y-auto">
              {result.markdown}
            </pre>
          </details>

          <div className="flex gap-2">
            <SecondaryButton onClick={copy}>{copied ? 'Copied ✓' : 'Copy markdown'}</SecondaryButton>
          </div>
        </div>
      )}

      <HistorySection
        kind="crawl"
        variant="text"
        reloadKey={historyKey}
        emptyHint="Crawled pages will appear here for re-fetch."
        onPick={(r) => {
          if (r.prompt) setUrl(r.prompt);
        }}
      />
    </div>
  );
}
