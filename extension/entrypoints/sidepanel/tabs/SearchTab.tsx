import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '@/src/lib/store';
import { canGenerate, incrementTrial, getAuthState } from '@/src/lib/quota';
import { searchWeb, type SearchResult } from '@/src/lib/api';
import { classifyError } from '@/src/lib/errors';
import { SEARCH_TEMPLATES } from '@/src/lib/templates';
import { addGeneration } from '@/src/lib/history';
import { PrimaryButton } from '../components/PrimaryButton';
import { ErrorBox } from '../components/ErrorBox';
import { TemplateChips } from '../components/TemplateChips';
import { HistorySection } from '../components/HistorySection';

export function SearchTab() {
  const store = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    if (store.pendingRequest?.kind === 'search') setQuery(store.pendingRequest.query);
  }, [store.pendingRequest]);

  const run = async () => {
    if (!query.trim()) return;
    if (!(await canGenerate())) {
      store.setView('paywall');
      return;
    }
    setPhase('loading');
    setError(null);
    try {
      const data = await searchWeb({ query, topK: 6 });
      if (!store.isAuthed) {
        await incrementTrial();
        const s = await getAuthState();
        store.setAuthState(s.isAuthed, s.remainingTrials);
      }
      setResults(data.results);
      const top = data.results[0];
      if (top) {
        await addGeneration({
          kind: 'search',
          resultUrl: top.url,
          srcUrl: '',
          prompt: query,
          title: `${data.results.length} results · "${query}"`,
          ts: Date.now(),
        });
        setHistoryKey((k) => k + 1);
      }
      setPhase('idle');
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setPhase('error');
      if (classified.code === 'TRIAL_EXHAUSTED') store.setView('paywall');
    }
  };

  return (
    <div className="space-y-3">
      <TemplateChips templates={SEARCH_TEMPLATES} onPick={(t) => setQuery(t.prompt)} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && run()}
        placeholder="Search the web…"
        className="w-full text-sm border border-border-input bg-surface-input rounded-xl px-3 py-2.5 text-text-primary placeholder:text-text-neutral focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
      />

      {phase === 'error' && error && <ErrorBox error={error} />}

      <PrimaryButton onClick={run} loading={phase === 'loading'} disabled={!query.trim()}>
        {phase === 'loading' ? 'Searching…' : 'Search'}
      </PrimaryButton>

      <HistorySection
        kind="search"
        variant="text"
        reloadKey={historyKey}
        emptyHint="Past queries will appear here for one-tap re-search."
        onPick={(r) => {
          if (r.prompt) {
            setQuery(r.prompt);
          }
        }}
      />

      {results.length > 0 && (
        <ul className="space-y-3 pt-1">
          {results.map((r, i) => (
            <li
              key={i}
              className="border-b border-border-divider pb-3 last:border-b-0 group"
            >
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-olive group-hover:text-olive-hover hover:underline inline-flex items-center gap-1"
              >
                {r.title}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
              </a>
              <p className="text-xs text-text-neutral mt-0.5 truncate" title={r.url}>
                {r.source ?? new URL(r.url).hostname}
              </p>
              <p className="text-xs text-text-body mt-1 leading-relaxed">{r.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
