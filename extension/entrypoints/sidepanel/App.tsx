import { useEffect } from 'react';
import {
  Sparkles,
  ImagePlus,
  Film,
  Music,
  Search,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore, type CapabilityTab, type PendingRequest } from '@/src/lib/store';
import { getAuthState } from '@/src/lib/quota';
import { AnycapMark } from './components/AnycapMark';
import { VaryTab } from './tabs/VaryTab';
import { ImageTab } from './tabs/ImageTab';
import { VideoTab } from './tabs/VideoTab';
import { MusicTab } from './tabs/MusicTab';
import { SearchTab } from './tabs/SearchTab';
import { CrawlTab } from './tabs/CrawlTab';
import { SettingsTab } from './tabs/SettingsTab';

type TabSpec = {
  id: CapabilityTab;
  label: string;
  Icon: typeof Sparkles;
};

const TABS: TabSpec[] = [
  { id: 'vary', label: 'Vary', Icon: Sparkles },
  { id: 'image', label: 'Image', Icon: ImagePlus },
  { id: 'video', label: 'Video', Icon: Film },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'search', label: 'Search', Icon: Search },
  { id: 'crawl', label: 'Crawl', Icon: FileText },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal },
];

function tabFromPendingRequest(req: PendingRequest | null): CapabilityTab | null {
  if (!req) return null;
  switch (req.kind) {
    case 'vary':
      return 'vary';
    case 'image-from-text':
      return 'image';
    case 'video-from-text':
      return 'video';
    case 'music-from-text':
      return 'music';
    case 'search':
      return 'search';
    case 'crawl':
      return 'crawl';
  }
}

export default function App() {
  const store = useStore();

  useEffect(() => {
    let canceled = false;
    (async () => {
      const session = await chrome.storage.session.get('pendingRequest');
      const req = session.pendingRequest as PendingRequest | undefined;
      if (req && !canceled) {
        store.setPendingRequest(req);
        const t = tabFromPendingRequest(req);
        if (t) store.setActiveTab(t);
        await chrome.storage.session.remove('pendingRequest');
      }
      const state = await getAuthState();
      if (!canceled) {
        store.setAuthState(state.isAuthed, state.remainingTrials);
        if (!state.isAuthed && state.remainingTrials === 0) store.setView('paywall');
      }
    })();

    const handler = (changes: any, area: string) => {
      if (area !== 'session' || !changes.pendingRequest?.newValue) return;
      const req = changes.pendingRequest.newValue as PendingRequest;
      store.setPendingRequest(req);
      const t = tabFromPendingRequest(req);
      if (t) store.setActiveTab(t);
      store.setGeneration({ phase: 'idle' });
      chrome.storage.session.remove('pendingRequest');
    };
    chrome.storage.onChanged.addListener(handler);
    return () => {
      canceled = true;
      chrome.storage.onChanged.removeListener(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (store.view === 'paywall') {
    return (
      <div className="h-full flex flex-col bg-app">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 bg-gradient-to-br from-pale-sage to-cream-yellow rounded-2xl flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 6px 16px -8px rgba(107,125,58,0.5)' }}>
              <Sparkles className="w-7 h-7 text-olive" />
            </div>
            <h2 className="text-base font-bold text-text-primary mt-4">Free Tries Used</h2>
            <p className="text-sm text-text-body mt-1.5">
              You have used all 3 free generations. Sign in to get 50 free credits per month.
            </p>
            <button
              onClick={() => store.setActiveTab('settings')}
              className="mt-4 text-xs text-olive hover:text-olive-hover hover:underline font-medium"
            >
              Reset trial in Settings →
            </button>
            <p className="mt-3 text-xs text-text-neutral">Account login coming soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-app">
      <Header />
      <TabBar />
      <div className="flex-1 scroll-y px-4 py-4">
        {store.activeTab === 'vary' && <VaryTab />}
        {store.activeTab === 'image' && <ImageTab />}
        {store.activeTab === 'video' && <VideoTab />}
        {store.activeTab === 'music' && <MusicTab />}
        {store.activeTab === 'search' && <SearchTab />}
        {store.activeTab === 'crawl' && <CrawlTab />}
        {store.activeTab === 'settings' && <SettingsTab />}
      </div>
      <Footer />
    </div>
  );
}

function Header() {
  const store = useStore();
  const trialText = store.isAuthed
    ? 'Signed in'
    : store.remainingTrials === Infinity
      ? 'Unlimited'
      : `${store.remainingTrials} free ${store.remainingTrials === 1 ? 'try' : 'tries'} left`;

  return (
    <header className="px-4 py-3 border-b border-border-divider flex items-center justify-between header-gradient">
      <div className="flex items-center gap-2">
        <AnycapMark size={28} />
        <div>
          <h1 className="text-base font-bold text-olive leading-none" style={{ letterSpacing: '-0.4px' }}>
            AnyCap
          </h1>
          <p className="text-[10px] text-text-muted leading-tight mt-0.5">capability runtime</p>
        </div>
      </div>
      <span className="text-[11px] text-text-muted bg-surface-input border border-border-card rounded-full px-2.5 py-1">
        {trialText}
      </span>
    </header>
  );
}

function TabBar() {
  const store = useStore();
  return (
    <nav className="flex border-b border-border-divider bg-surface-card overflow-x-auto" role="tablist">
      {TABS.map((t) => {
        const active = store.activeTab === t.id;
        const Icon = t.Icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => store.setActiveTab(t.id)}
            className={`relative flex-1 min-w-[58px] flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
              active ? 'text-olive' : 'text-text-muted hover:text-text-body'
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
            <span>{t.label}</span>
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-olive"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="px-4 py-2 border-t border-border-divider text-[10px] text-text-neutral text-center bg-surface-card">
      Powered by AnyCap · capabilities for AI agents
    </footer>
  );
}
