# AnyCap Chrome Extension v0.1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship AnyCap Chrome Extension v0.1 in 2 weeks — right-click any web image → generate a stylistic variation in ≤15 s, anonymous 3-try → OAuth → Free 50 credits/month.

**Architecture:** Chrome Manifest V3 extension. `background.ts` (service worker) owns auth/quota and brokers HTTP calls to existing `anycap-server`. `content.ts` captures right-click image targets. `popup` (React + Zustand) renders the 5 UI states. All anycap-server changes are additive — no schema changes.

**Tech Stack:** WXT (Vite) · React 19 · Tailwind 4 · Zustand · TypeScript · Vitest + MSW (unit/integration) · Playwright with `loadExtension` (E2E) · Go (server additions)

**Spec:** `docs/superpowers/specs/2026-04-21-chrome-extension-design.md`

---

## File Structure

```
extension/                                    (new top-level dir in anycap monorepo)
├── package.json
├── wxt.config.ts
├── tsconfig.json
├── tailwind.config.js
├── vitest.config.ts
├── playwright.config.ts
├── .gitignore
├── README.md
│
├── entrypoints/
│   ├── background.ts                         # service worker
│   ├── content.ts                            # content script (injected per page)
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx                           # top-level router + state
│   │   ├── store.ts                          # Zustand
│   │   └── views/
│   │       ├── IdleView.tsx
│   │       ├── GeneratingView.tsx
│   │       ├── DoneView.tsx
│   │       ├── ErrorView.tsx
│   │       ├── PaywallView.tsx
│   │       └── RecentGallery.tsx
│   └── options/
│       ├── index.html
│       ├── main.tsx
│       └── App.tsx                           # welcome + API key + privacy link
│
├── src/lib/
│   ├── auth.ts                               # launchWebAuthFlow → Auth0
│   ├── storage.ts                            # typed chrome.storage.local wrapper
│   ├── install-id.ts                         # persistent UUID for anon rate limit
│   ├── quota.ts                              # trial counter / state resolver
│   ├── api.ts                                # anycap-server HTTP client
│   ├── errors.ts                             # API/browser error → UX type
│   ├── messages.ts                           # typed content↔background protocol
│   └── constants.ts                          # endpoints, default prompt, image filter rules
│
├── public/
│   ├── icons/{16,48,128}.png
│   └── welcome.gif
│
└── tests/
    ├── unit/
    │   ├── quota.test.ts
    │   ├── errors.test.ts
    │   ├── storage.test.ts
    │   ├── install-id.test.ts
    │   ├── api.test.ts                        # with MSW
    │   └── store.test.ts
    └── e2e/
        ├── happy-path.spec.ts
        ├── paywall.spec.ts
        └── csp-blocked.spec.ts

Server-side additions (no schema changes):
├── internal/application/capabilities/image/watermark.go              (new)
├── internal/application/extension/config_service.go                  (new)
├── internal/transport/http/handlers/extension_config_handler.go      (new)
├── internal/transport/http/handlers/image_generate_handler.go        (modify: accept watermark param)
├── internal/middleware/anon_rate_limit.go                            (new: install_id + IP)
├── internal/transport/http/router.go                                 (modify: register /v1/extension/config)
└── test/integration/extension_config_test.go                         (new)

Privacy page (in existing web/):
└── web/src/app/(seo)/privacy/extension/page.tsx                      (new)
```

---

## Task 1: Scaffold WXT project with manifest and icons

**Files:**
- Create: `extension/package.json`, `extension/wxt.config.ts`, `extension/tsconfig.json`, `extension/tailwind.config.js`, `extension/.gitignore`, `extension/README.md`
- Create: `extension/public/icons/{16,48,128}.png` (placeholder — reuse anycap.ai logo PNGs resized)

- [ ] **Step 1: Create extension directory and init WXT**

```bash
cd /Users/shwang/projects/anycap
mkdir extension && cd extension
pnpm dlx wxt@latest init . --template react --pm pnpm
# When prompted, accept defaults
pnpm install
```

- [ ] **Step 2: Install additional deps**

```bash
pnpm add zustand
pnpm add -D tailwindcss@^4 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom msw playwright @playwright/test
pnpm exec tailwindcss init -p
```

- [ ] **Step 3: Configure `wxt.config.ts`**

```typescript
// extension/wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'AnyCap — Turn anything you see into new content',
    short_name: 'AnyCap',
    description: 'Right-click any image to generate AI variations. Powered by AnyCap.',
    permissions: ['contextMenus', 'activeTab', 'storage', 'identity'],
    host_permissions: ['https://api.anycap.ai/*', 'https://anycap.ai/*'],
    icons: { '16': 'icons/16.png', '48': 'icons/48.png', '128': 'icons/128.png' },
    action: { default_popup: 'popup.html', default_title: 'AnyCap' },
    minimum_chrome_version: '118',
  },
});
```

- [ ] **Step 4: Update `.gitignore`**

```
# extension/.gitignore (append)
.output
.wxt
node_modules
coverage
test-results
playwright-report
```

- [ ] **Step 5: Write minimal README**

```markdown
# AnyCap Chrome Extension

See `docs/superpowers/specs/2026-04-21-chrome-extension-design.md` for spec.

## Development

    pnpm install
    pnpm dev          # starts WXT dev server + auto-reload
    pnpm test         # vitest unit + integration
    pnpm e2e          # playwright
    pnpm build        # .output/chrome-mv3/ production bundle

## Load unpacked

1. `pnpm dev`
2. Chrome → chrome://extensions → Developer mode → Load unpacked → `.output/chrome-mv3-dev`
```

- [ ] **Step 6: Copy placeholder icons**

```bash
cp ../web/public/icon-16.png extension/public/icons/16.png
cp ../web/public/icon-48.png extension/public/icons/48.png
cp ../web/public/icon-128.png extension/public/icons/128.png
# (if these don't exist, use any 16/48/128 PNG placeholders — replaced in Task 12)
```

- [ ] **Step 7: Verify dev build loads in Chrome**

```bash
pnpm dev
# Open Chrome → chrome://extensions → Load unpacked → extension/.output/chrome-mv3-dev
# Expected: AnyCap icon appears in toolbar, clicking opens blank popup
```

- [ ] **Step 8: Commit**

```bash
git add extension/
git commit -m "feat(extension): scaffold WXT project with MV3 manifest"
```

---

## Task 2: Background service worker — register context menu

**Files:**
- Create: `extension/entrypoints/background.ts`
- Create: `extension/src/lib/constants.ts`
- Test: `extension/tests/unit/background.test.ts`

- [ ] **Step 1: Write constants**

```typescript
// extension/src/lib/constants.ts
export const MENU_ID_VARIATION = 'anycap-generate-variation';
export const MENU_TITLE = '✨ Generate variation with AnyCap';
export const MIN_IMAGE_DIMENSION = 256;                    // px
export const MAX_ANON_TRIALS = 3;
export const DEFAULT_PROMPT = 'create a stylistic variation of this image';
export const API_BASE = 'https://api.anycap.ai';
export const OAUTH_AUTHORIZE_URL = 'https://anycap.ai/oauth/authorize';
export const WELCOME_URL = 'https://anycap.ai/welcome-extension';
export const PRICING_URL = 'https://anycap.ai/pricing';
```

- [ ] **Step 2: Write failing test for context menu registration**

```typescript
// extension/tests/unit/background.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MENU_ID_VARIATION, MENU_TITLE, WELCOME_URL } from '../../src/lib/constants';

const mockCreate = vi.fn();
const mockTabsCreate = vi.fn();
const mockOnInstalledAdd = vi.fn();

// @ts-ignore
globalThis.chrome = {
  contextMenus: { create: mockCreate, onClicked: { addListener: vi.fn() } },
  runtime: { onInstalled: { addListener: mockOnInstalledAdd }, onMessage: { addListener: vi.fn() } },
  tabs: { create: mockTabsCreate },
};

describe('background service worker', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('registers the image-variation context menu on install', async () => {
    await import('../../entrypoints/background');
    const handler = mockOnInstalledAdd.mock.calls[0][0];
    handler({ reason: 'install' });

    expect(mockCreate).toHaveBeenCalledWith({
      id: MENU_ID_VARIATION,
      title: MENU_TITLE,
      contexts: ['image'],
    });
    expect(mockTabsCreate).toHaveBeenCalledWith({ url: WELCOME_URL });
  });
});
```

- [ ] **Step 3: Run test — expect failure**

```bash
cd extension && pnpm vitest run tests/unit/background.test.ts
```
Expected: FAIL (background.ts does not exist yet)

- [ ] **Step 4: Implement background.ts**

```typescript
// extension/entrypoints/background.ts
import { MENU_ID_VARIATION, MENU_TITLE, WELCOME_URL } from '@/src/lib/constants';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    chrome.contextMenus.create({
      id: MENU_ID_VARIATION,
      title: MENU_TITLE,
      contexts: ['image'],
    });
    if (details.reason === 'install') {
      chrome.tabs.create({ url: WELCOME_URL });
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== MENU_ID_VARIATION || !tab?.id || !info.srcUrl) return;
    // Forwarding to popup handled in Task 4
    chrome.tabs.sendMessage(tab.id, { type: 'ANYCAP_INVOKE_VARIATION', srcUrl: info.srcUrl });
  });
});
```

- [ ] **Step 5: Run test — expect pass**

```bash
pnpm vitest run tests/unit/background.test.ts
```
Expected: PASS

- [ ] **Step 6: Manual verify in browser**

```bash
pnpm dev
# Load extension in Chrome. Right-click any image on a page.
# Expected: "✨ Generate variation with AnyCap" menu item appears.
```

- [ ] **Step 7: Commit**

```bash
git add extension/entrypoints/background.ts extension/src/lib/constants.ts extension/tests/unit/background.test.ts
git commit -m "feat(extension): register context menu on install"
```

---

## Task 3: Content script — image capture with filter

**Files:**
- Create: `extension/entrypoints/content.ts`
- Create: `extension/src/lib/image-filter.ts`
- Test: `extension/tests/unit/image-filter.test.ts`

- [ ] **Step 1: Write failing test for image filter**

```typescript
// extension/tests/unit/image-filter.test.ts
import { describe, it, expect } from 'vitest';
import { shouldShowMenu } from '../../src/lib/image-filter';

describe('image filter', () => {
  it('rejects images smaller than 256px', () => {
    expect(shouldShowMenu({ naturalWidth: 100, naturalHeight: 500, src: 'https://x.com/a.jpg' })).toBe(false);
  });
  it('rejects non-image formats', () => {
    expect(shouldShowMenu({ naturalWidth: 800, naturalHeight: 600, src: 'https://x.com/a.svg' })).toBe(false);
  });
  it('rejects file:// URLs', () => {
    expect(shouldShowMenu({ naturalWidth: 800, naturalHeight: 600, src: 'file:///tmp/a.jpg' })).toBe(false);
  });
  it('accepts qualifying png/jpg/webp over 256px', () => {
    expect(shouldShowMenu({ naturalWidth: 800, naturalHeight: 600, src: 'https://x.com/a.png' })).toBe(true);
    expect(shouldShowMenu({ naturalWidth: 300, naturalHeight: 300, src: 'https://x.com/a.webp' })).toBe(true);
  });
  it('accepts data: urls for png/jpg', () => {
    expect(shouldShowMenu({ naturalWidth: 800, naturalHeight: 600, src: 'data:image/png;base64,...' })).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pnpm vitest run tests/unit/image-filter.test.ts
```

- [ ] **Step 3: Implement filter**

```typescript
// extension/src/lib/image-filter.ts
import { MIN_IMAGE_DIMENSION } from './constants';

type ImageInfo = { naturalWidth: number; naturalHeight: number; src: string };

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;
const ALLOWED_DATA = /^data:image\/(jpeg|png|webp);/i;

export function shouldShowMenu(img: ImageInfo): boolean {
  if (img.src.startsWith('file://')) return false;
  if (Math.min(img.naturalWidth, img.naturalHeight) < MIN_IMAGE_DIMENSION) return false;
  if (img.src.startsWith('data:')) return ALLOWED_DATA.test(img.src);
  try {
    const u = new URL(img.src);
    return ALLOWED_EXT.test(u.pathname);
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
pnpm vitest run tests/unit/image-filter.test.ts
```

- [ ] **Step 5: Implement content script**

```typescript
// extension/entrypoints/content.ts
import { shouldShowMenu } from '@/src/lib/image-filter';

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['file://*/*'],
  main() {
    let lastRightClickedImage: { srcUrl: string; width: number; height: number } | null = null;

    document.addEventListener('contextmenu', (evt) => {
      const target = evt.target as HTMLElement;
      if (target.tagName !== 'IMG') return;
      const img = target as HTMLImageElement;
      if (!shouldShowMenu({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, src: img.src })) {
        lastRightClickedImage = null;
        return;
      }
      lastRightClickedImage = { srcUrl: img.src, width: img.naturalWidth, height: img.naturalHeight };
    }, true);

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'ANYCAP_INVOKE_VARIATION' && lastRightClickedImage) {
        chrome.runtime.sendMessage({
          type: 'ANYCAP_START_GENERATION',
          image: lastRightClickedImage,
          pageUrl: location.href,
        });
      }
    });
  },
});
```

- [ ] **Step 6: Manual verify**

Load extension. On a site with >256px JPG, right-click → menu shows. On a tiny avatar (<256px), menu should NOT show.

- [ ] **Step 7: Commit**

```bash
git add extension/entrypoints/content.ts extension/src/lib/image-filter.ts extension/tests/unit/image-filter.test.ts
git commit -m "feat(extension): content script with image filter"
```

---

## Task 4: Typed message protocol and messaging

**Files:**
- Create: `extension/src/lib/messages.ts`
- Modify: `extension/entrypoints/background.ts`
- Test: `extension/tests/unit/messages.test.ts`

- [ ] **Step 1: Write test for message envelope parsing**

```typescript
// extension/tests/unit/messages.test.ts
import { describe, it, expect } from 'vitest';
import { isStartGeneration, ExtensionMessage } from '../../src/lib/messages';

describe('message protocol', () => {
  it('narrows ANYCAP_START_GENERATION correctly', () => {
    const msg: unknown = { type: 'ANYCAP_START_GENERATION', image: { srcUrl: 'x', width: 300, height: 300 }, pageUrl: 'https://y' };
    expect(isStartGeneration(msg)).toBe(true);
    if (isStartGeneration(msg)) {
      expect(msg.image.srcUrl).toBe('x');
    }
  });
  it('rejects malformed messages', () => {
    expect(isStartGeneration({ type: 'WRONG' })).toBe(false);
    expect(isStartGeneration(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement message types**

```typescript
// extension/src/lib/messages.ts
export type StartGenerationMsg = {
  type: 'ANYCAP_START_GENERATION';
  image: { srcUrl: string; width: number; height: number };
  pageUrl: string;
};

export type GenerationResultMsg = {
  type: 'ANYCAP_GENERATION_RESULT';
  resultUrl?: string;
  error?: { code: string; message: string };
};

export type ExtensionMessage = StartGenerationMsg | GenerationResultMsg;

export function isStartGeneration(m: unknown): m is StartGenerationMsg {
  return !!m && typeof m === 'object' && (m as any).type === 'ANYCAP_START_GENERATION'
    && (m as any).image?.srcUrl && typeof (m as any).image.width === 'number';
}
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Wire message handler in background.ts**

Append to `extension/entrypoints/background.ts`:

```typescript
import { isStartGeneration, type StartGenerationMsg } from '@/src/lib/messages';

// inside defineBackground(() => { ... })
chrome.runtime.onMessage.addListener((msg, _sender) => {
  if (isStartGeneration(msg)) {
    // Store pending request for popup to pick up
    chrome.storage.session.set({ pendingRequest: msg });
    chrome.action.openPopup?.().catch(() => {
      // Fallback: Chrome < 127 can't programmatically open popup — rely on user clicking toolbar
    });
  }
});
```

- [ ] **Step 6: Commit**

```bash
git add extension/src/lib/messages.ts extension/entrypoints/background.ts extension/tests/unit/messages.test.ts
git commit -m "feat(extension): typed content↔background message protocol"
```

---

## Task 5: Storage wrapper, install-id, quota logic

**Files:**
- Create: `extension/src/lib/storage.ts`
- Create: `extension/src/lib/install-id.ts`
- Create: `extension/src/lib/quota.ts`
- Test: `extension/tests/unit/{storage,install-id,quota}.test.ts`

- [ ] **Step 1: Write test for storage wrapper**

```typescript
// extension/tests/unit/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map<string, any>();
// @ts-ignore
globalThis.chrome = {
  storage: { local: {
    get: vi.fn(async (keys: string[]) => Object.fromEntries(keys.map(k => [k, store.get(k)]))),
    set: vi.fn(async (items: Record<string, any>) => { Object.entries(items).forEach(([k,v]) => store.set(k,v)); }),
    remove: vi.fn(async (key: string) => { store.delete(key); }),
  }},
};

describe('storage', () => {
  beforeEach(() => { store.clear(); });

  it('reads/writes typed values', async () => {
    const { setStored, getStored } = await import('../../src/lib/storage');
    await setStored('trialCount', 2);
    expect(await getStored('trialCount')).toBe(2);
  });

  it('returns default for missing key', async () => {
    const { getStored } = await import('../../src/lib/storage');
    expect(await getStored('trialCount')).toBe(0);
  });
});
```

- [ ] **Step 2: Implement storage**

```typescript
// extension/src/lib/storage.ts
export type StoredSchema = {
  trialCount: number;
  authToken: string | null;
  installId: string | null;
  apiKey: string | null;
  recentGenerations: Array<{ resultUrl: string; srcUrl: string; ts: number }>;
};

const DEFAULTS: StoredSchema = {
  trialCount: 0,
  authToken: null,
  installId: null,
  apiKey: null,
  recentGenerations: [],
};

export async function getStored<K extends keyof StoredSchema>(key: K): Promise<StoredSchema[K]> {
  const raw = await chrome.storage.local.get([key]);
  return (raw[key] ?? DEFAULTS[key]) as StoredSchema[K];
}

export async function setStored<K extends keyof StoredSchema>(key: K, value: StoredSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeStored(key: keyof StoredSchema): Promise<void> {
  await chrome.storage.local.remove(key);
}
```

- [ ] **Step 3: Test + implement install-id**

```typescript
// extension/tests/unit/install-id.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
// (reuse the chrome.storage mock from storage.test.ts — extract into tests/setup.ts in Task 5b)

describe('install-id', () => {
  it('generates a UUID on first call and returns the same one subsequently', async () => {
    const { getOrCreateInstallId } = await import('../../src/lib/install-id');
    const first = await getOrCreateInstallId();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    const second = await getOrCreateInstallId();
    expect(second).toBe(first);
  });
});
```

```typescript
// extension/src/lib/install-id.ts
import { getStored, setStored } from './storage';

export async function getOrCreateInstallId(): Promise<string> {
  const existing = await getStored('installId');
  if (existing) return existing;
  const id = crypto.randomUUID();
  await setStored('installId', id);
  return id;
}
```

- [ ] **Step 4: Test + implement quota**

```typescript
// extension/tests/unit/quota.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MAX_ANON_TRIALS } from '../../src/lib/constants';

describe('quota.resolveAuthState', () => {
  it('returns Fresh when no token and trial=0', async () => {
    const { resolveAuthState } = await import('../../src/lib/quota');
    expect(await resolveAuthState()).toBe('Fresh');
  });
  it('returns Trialing when trial in (0, MAX)', async () => {
    const { resolveAuthState, incrementTrial } = await import('../../src/lib/quota');
    await incrementTrial();
    expect(await resolveAuthState()).toBe('Trialing');
  });
  it('returns PaywallBlocked when trial >= MAX and no token', async () => {
    const { resolveAuthState, incrementTrial } = await import('../../src/lib/quota');
    for (let i = 0; i < MAX_ANON_TRIALS; i++) await incrementTrial();
    expect(await resolveAuthState()).toBe('PaywallBlocked');
  });
  it('returns Authed when token present', async () => {
    const { resolveAuthState } = await import('../../src/lib/quota');
    const { setStored } = await import('../../src/lib/storage');
    await setStored('authToken', 'test-token');
    expect(await resolveAuthState()).toBe('Authed');
  });
});
```

```typescript
// extension/src/lib/quota.ts
import { getStored, setStored } from './storage';
import { MAX_ANON_TRIALS } from './constants';

export type AuthState = 'Fresh' | 'Trialing' | 'PaywallBlocked' | 'Authed';

export async function resolveAuthState(): Promise<AuthState> {
  const [token, trialCount] = await Promise.all([
    getStored('authToken'),
    getStored('trialCount'),
  ]);
  if (token) return 'Authed';
  if (trialCount === 0) return 'Fresh';
  if (trialCount < MAX_ANON_TRIALS) return 'Trialing';
  return 'PaywallBlocked';
}

export async function incrementTrial(): Promise<number> {
  const current = await getStored('trialCount');
  const next = current + 1;
  await setStored('trialCount', next);
  return next;
}
```

- [ ] **Step 5: Run all unit tests — PASS**

```bash
pnpm vitest run tests/unit/
```

- [ ] **Step 6: Commit**

```bash
git add extension/src/lib/storage.ts extension/src/lib/install-id.ts extension/src/lib/quota.ts extension/tests/unit/{storage,install-id,quota}.test.ts
git commit -m "feat(extension): storage / install-id / quota libraries"
```

---

## Task 6: Error classification

**Files:**
- Create: `extension/src/lib/errors.ts`
- Test: `extension/tests/unit/errors.test.ts`

- [ ] **Step 1: Write test**

```typescript
// extension/tests/unit/errors.test.ts
import { describe, it, expect } from 'vitest';
import { classify } from '../../src/lib/errors';

describe('error classification', () => {
  it('classifies offline', () => {
    expect(classify(new TypeError('Failed to fetch'), { online: false })).toEqual({
      code: 'OFFLINE', retriable: 'auto', chargeCredit: false,
    });
  });
  it('classifies 402 as QUOTA_EXCEEDED', () => {
    expect(classify({ status: 402 }, { online: true })).toMatchObject({
      code: 'QUOTA_EXCEEDED', retriable: 'upgrade', chargeCredit: false,
    });
  });
  it('classifies 401 as TOKEN_EXPIRED', () => {
    expect(classify({ status: 401 }, { online: true })).toMatchObject({ code: 'TOKEN_EXPIRED' });
  });
  it('classifies 503 as SERVER_DOWN (do not charge)', () => {
    expect(classify({ status: 503 }, { online: true })).toEqual({
      code: 'SERVER_DOWN', retriable: 'manual', chargeCredit: false,
    });
  });
  it('classifies timeout', () => {
    const err = new Error('timeout'); err.name = 'AbortError';
    expect(classify(err, { online: true })).toMatchObject({ code: 'TIMEOUT', chargeCredit: false });
  });
});
```

- [ ] **Step 2: Implement**

```typescript
// extension/src/lib/errors.ts
export type ErrorCode =
  | 'OFFLINE' | 'TRIAL_EXHAUSTED' | 'QUOTA_EXCEEDED' | 'SERVER_DOWN'
  | 'IMAGE_FETCH_FAIL' | 'CSP_BLOCKED' | 'OAUTH_CANCEL' | 'TOKEN_EXPIRED' | 'TIMEOUT' | 'UNKNOWN';

export type ClassifiedError = {
  code: ErrorCode;
  retriable: 'auto' | 'manual' | 'upgrade' | 'login' | 'new-tab' | 'none';
  chargeCredit: boolean;
  message?: string;
};

export function classify(err: any, ctx: { online: boolean }): ClassifiedError {
  if (!ctx.online) return { code: 'OFFLINE', retriable: 'auto', chargeCredit: false };
  if (err?.name === 'AbortError') return { code: 'TIMEOUT', retriable: 'manual', chargeCredit: false };
  if (err instanceof TypeError && /fetch/.test(err.message)) {
    return { code: 'IMAGE_FETCH_FAIL', retriable: 'manual', chargeCredit: false, message: err.message };
  }
  const status = err?.status as number | undefined;
  if (status === 401) return { code: 'TOKEN_EXPIRED', retriable: 'auto', chargeCredit: false };
  if (status === 402) return { code: 'QUOTA_EXCEEDED', retriable: 'upgrade', chargeCredit: false };
  if (status === 403) return { code: 'CSP_BLOCKED', retriable: 'new-tab', chargeCredit: false };
  if (status && status >= 500) return { code: 'SERVER_DOWN', retriable: 'manual', chargeCredit: false };
  return { code: 'UNKNOWN', retriable: 'manual', chargeCredit: false };
}

export const ERROR_COPY: Record<ErrorCode, string> = {
  OFFLINE: "You're offline. We'll retry when you're back.",
  TRIAL_EXHAUSTED: "Sign in for 50 free credits/month.",
  QUOTA_EXCEEDED: "Monthly limit reached. Upgrade to Pro for more.",
  SERVER_DOWN: "AnyCap is having a bad day. Retry?",
  IMAGE_FETCH_FAIL: "Can't read this image. Try another.",
  CSP_BLOCKED: "This page doesn't allow extensions. Open image in new tab and retry.",
  OAUTH_CANCEL: "",
  TOKEN_EXPIRED: "Signed out. Please sign in again.",
  TIMEOUT: "Taking too long. Check your Drive later.",
  UNKNOWN: "Something went wrong. Retry?",
};
```

- [ ] **Step 3: Run — PASS**

- [ ] **Step 4: Commit**

```bash
git add extension/src/lib/errors.ts extension/tests/unit/errors.test.ts
git commit -m "feat(extension): error classification library"
```

---

## Task 7: API client with MSW-backed tests

**Files:**
- Create: `extension/src/lib/api.ts`
- Test: `extension/tests/unit/api.test.ts`
- Create: `extension/tests/setup.ts`

- [ ] **Step 1: Configure MSW in test setup**

```typescript
// extension/tests/setup.ts
import { setupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach } from 'vitest';

export const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Update `extension/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], globals: true },
});
```

- [ ] **Step 2: Write API test**

```typescript
// extension/tests/unit/api.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { generateVariation } from '../../src/lib/api';
import { API_BASE } from '../../src/lib/constants';

describe('generateVariation', () => {
  it('posts to /v1/image/generate and returns resultUrl', async () => {
    server.use(
      http.post(`${API_BASE}/v1/image/generate`, async ({ request }) => {
        const body = await request.json() as any;
        expect(body.mode).toBe('image-to-image');
        expect(body.prompt).toContain('variation');
        expect(body.images[0]).toBe('https://example.com/a.png');
        return HttpResponse.json({ resultUrl: 'https://cdn.anycap.ai/r/123.png', creditsUsed: 1 });
      }),
    );

    const result = await generateVariation({
      srcUrl: 'https://example.com/a.png',
      authToken: 't',
      installId: 'i',
      watermark: true,
    });
    expect(result.resultUrl).toBe('https://cdn.anycap.ai/r/123.png');
  });

  it('throws with status for 402', async () => {
    server.use(http.post(`${API_BASE}/v1/image/generate`, () => new HttpResponse(null, { status: 402 })));
    await expect(generateVariation({ srcUrl: 'x', authToken: 't', installId: 'i', watermark: true }))
      .rejects.toMatchObject({ status: 402 });
  });
});
```

- [ ] **Step 3: Implement API client**

```typescript
// extension/src/lib/api.ts
import { API_BASE, DEFAULT_PROMPT } from './constants';

export type GenerateArgs = {
  srcUrl: string;
  authToken: string | null;
  installId: string;
  watermark: boolean;
  apiKey?: string | null;
};

export type GenerateResult = {
  resultUrl: string;
  creditsUsed: number;
};

export async function generateVariation(args: GenerateArgs): Promise<GenerateResult> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-anycap-install-id': args.installId,
    'x-anycap-source': 'chrome-extension',
  };
  if (args.authToken) headers['authorization'] = `Bearer ${args.authToken}`;
  else if (args.apiKey) headers['authorization'] = `ApiKey ${args.apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(`${API_BASE}/v1/image/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mode: 'image-to-image',
        prompt: DEFAULT_PROMPT,
        images: [args.srcUrl],
        watermark: args.watermark,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err: any = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      try { err.body = await res.json(); } catch {}
      throw err;
    }
    return (await res.json()) as GenerateResult;
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add extension/src/lib/api.ts extension/tests/unit/api.test.ts extension/tests/setup.ts extension/vitest.config.ts
git commit -m "feat(extension): api client with 60s timeout"
```

---

## Task 8: Zustand store + Popup App shell

**Files:**
- Create: `extension/entrypoints/popup/store.ts`
- Create: `extension/entrypoints/popup/App.tsx`
- Create: `extension/entrypoints/popup/main.tsx`
- Test: `extension/tests/unit/store.test.ts`

- [ ] **Step 1: Write store test**

```typescript
// extension/tests/unit/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createPopupStore } from '../../entrypoints/popup/store';

describe('popup store', () => {
  it('starts in idle', () => {
    const s = createPopupStore();
    expect(s.getState().view).toBe('idle');
  });
  it('moves idle → generating → done', () => {
    const s = createPopupStore();
    s.getState().startGeneration({ srcUrl: 'https://x/a.png' });
    expect(s.getState().view).toBe('generating');
    s.getState().generationDone({ resultUrl: 'https://cdn/r.png' });
    expect(s.getState().view).toBe('done');
    expect(s.getState().result?.resultUrl).toBe('https://cdn/r.png');
  });
  it('moves to error on failure', () => {
    const s = createPopupStore();
    s.getState().startGeneration({ srcUrl: 'x' });
    s.getState().generationError({ code: 'SERVER_DOWN', retriable: 'manual', chargeCredit: false });
    expect(s.getState().view).toBe('error');
    expect(s.getState().error?.code).toBe('SERVER_DOWN');
  });
  it('moves to paywall when trial exhausted', () => {
    const s = createPopupStore();
    s.getState().showPaywall();
    expect(s.getState().view).toBe('paywall');
  });
});
```

- [ ] **Step 2: Implement store**

```typescript
// extension/entrypoints/popup/store.ts
import { create } from 'zustand';
import type { ClassifiedError } from '@/src/lib/errors';

export type PopupView = 'idle' | 'generating' | 'done' | 'error' | 'paywall';

type Result = { resultUrl: string; srcUrl: string };

type PopupState = {
  view: PopupView;
  currentSrc: string | null;
  result: Result | null;
  error: ClassifiedError | null;
  startGeneration: (args: { srcUrl: string }) => void;
  generationDone: (args: { resultUrl: string }) => void;
  generationError: (err: ClassifiedError) => void;
  showPaywall: () => void;
  reset: () => void;
};

export const createPopupStore = () => create<PopupState>((set, get) => ({
  view: 'idle',
  currentSrc: null,
  result: null,
  error: null,
  startGeneration: ({ srcUrl }) => set({ view: 'generating', currentSrc: srcUrl, error: null, result: null }),
  generationDone: ({ resultUrl }) => {
    const src = get().currentSrc ?? '';
    set({ view: 'done', result: { resultUrl, srcUrl: src } });
  },
  generationError: (err) => set({ view: 'error', error: err }),
  showPaywall: () => set({ view: 'paywall' }),
  reset: () => set({ view: 'idle', currentSrc: null, result: null, error: null }),
}));

export const usePopupStore = createPopupStore();
```

- [ ] **Step 3: Implement App shell**

```tsx
// extension/entrypoints/popup/App.tsx
import { usePopupStore } from './store';
import { IdleView } from './views/IdleView';
import { GeneratingView } from './views/GeneratingView';
import { DoneView } from './views/DoneView';
import { ErrorView } from './views/ErrorView';
import { PaywallView } from './views/PaywallView';

export function App() {
  const view = usePopupStore((s) => s.view);
  return (
    <div className="w-[320px] h-[480px] bg-white flex flex-col text-[#1c1f17]">
      <header className="px-4 py-3 border-b border-[#d4dbb8] text-xs tracking-wider text-[#6b7d3a] font-mono">
        ANYCAP
      </header>
      <main className="flex-1 overflow-hidden">
        {view === 'idle' && <IdleView />}
        {view === 'generating' && <GeneratingView />}
        {view === 'done' && <DoneView />}
        {view === 'error' && <ErrorView />}
        {view === 'paywall' && <PaywallView />}
      </main>
    </div>
  );
}
```

```tsx
// extension/entrypoints/popup/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/assets/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

- [ ] **Step 4: Create placeholder view files**

Create empty stubs for each view (filled in next tasks):

```tsx
// extension/entrypoints/popup/views/IdleView.tsx
export function IdleView() { return <div className="p-4 text-sm">Ready. Right-click any image to start.</div>; }

// extension/entrypoints/popup/views/GeneratingView.tsx
export function GeneratingView() { return <div className="p-4 text-sm">Generating…</div>; }

// extension/entrypoints/popup/views/DoneView.tsx
export function DoneView() { return <div className="p-4 text-sm">Done (stub)</div>; }

// extension/entrypoints/popup/views/ErrorView.tsx
export function ErrorView() { return <div className="p-4 text-sm">Error (stub)</div>; }

// extension/entrypoints/popup/views/PaywallView.tsx
export function PaywallView() { return <div className="p-4 text-sm">Paywall (stub)</div>; }
```

- [ ] **Step 5: Run tests + verify extension still builds**

```bash
pnpm vitest run
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add extension/entrypoints/popup/ extension/tests/unit/store.test.ts
git commit -m "feat(extension): zustand store + popup shell with 5 view stubs"
```

---

## Task 9: Wire popup to background (pending request pickup)

**Files:**
- Modify: `extension/entrypoints/popup/App.tsx`
- Modify: `extension/entrypoints/background.ts`
- Create: `extension/entrypoints/popup/use-pending-request.ts`

- [ ] **Step 1: Implement pending-request hook**

```tsx
// extension/entrypoints/popup/use-pending-request.ts
import { useEffect } from 'react';
import { usePopupStore } from './store';
import { resolveAuthState } from '@/src/lib/quota';

export function usePendingRequest() {
  const { startGeneration, showPaywall } = usePopupStore();

  useEffect(() => {
    (async () => {
      const { pendingRequest } = await chrome.storage.session.get('pendingRequest');
      if (!pendingRequest) return;
      await chrome.storage.session.remove('pendingRequest');

      const state = await resolveAuthState();
      if (state === 'PaywallBlocked') {
        showPaywall();
        return;
      }
      startGeneration({ srcUrl: pendingRequest.image.srcUrl });
    })();
  }, []);
}
```

- [ ] **Step 2: Wire into App**

```tsx
// extension/entrypoints/popup/App.tsx (modify)
import { usePendingRequest } from './use-pending-request';

export function App() {
  usePendingRequest();
  // ... rest unchanged
}
```

- [ ] **Step 3: Manual verify**

1. Reload extension. 2. Right-click an image. 3. Click the toolbar icon (popup should open). 4. Expected: popup enters "Generating…" immediately.

- [ ] **Step 4: Commit**

```bash
git add extension/entrypoints/popup/use-pending-request.ts extension/entrypoints/popup/App.tsx
git commit -m "feat(extension): popup picks up pending request on open"
```

---

## Task 10: Run generation end-to-end (wire api.ts into flow)

**Files:**
- Create: `extension/entrypoints/popup/run-generation.ts`
- Modify: `extension/entrypoints/popup/use-pending-request.ts`

- [ ] **Step 1: Implement runner**

```typescript
// extension/entrypoints/popup/run-generation.ts
import { generateVariation } from '@/src/lib/api';
import { classify } from '@/src/lib/errors';
import { getStored, setStored } from '@/src/lib/storage';
import { getOrCreateInstallId } from '@/src/lib/install-id';
import { incrementTrial, resolveAuthState } from '@/src/lib/quota';
import { usePopupStore } from './store';

export async function runGeneration(srcUrl: string) {
  const store = usePopupStore.getState();
  try {
    const [authToken, apiKey] = await Promise.all([getStored('authToken'), getStored('apiKey')]);
    const installId = await getOrCreateInstallId();
    const watermark = !authToken; // TODO: Pro account check in Task 13

    const result = await generateVariation({ srcUrl, authToken, apiKey, installId, watermark });

    // Track state: increment trial if anon, save recent
    const state = await resolveAuthState();
    if (state === 'Trialing' || state === 'Fresh') {
      await incrementTrial();
    }
    const recent = await getStored('recentGenerations');
    await setStored('recentGenerations', [
      { resultUrl: result.resultUrl, srcUrl, ts: Date.now() },
      ...recent,
    ].slice(0, 10));

    store.generationDone({ resultUrl: result.resultUrl });
  } catch (err) {
    const classified = classify(err, { online: navigator.onLine });
    store.generationError(classified);
  }
}
```

- [ ] **Step 2: Wire into pending request hook**

```tsx
// extension/entrypoints/popup/use-pending-request.ts (modify startGeneration call)
import { runGeneration } from './run-generation';

// replace `startGeneration({ srcUrl: pendingRequest.image.srcUrl });` with:
startGeneration({ srcUrl: pendingRequest.image.srcUrl });
runGeneration(pendingRequest.image.srcUrl);
```

- [ ] **Step 3: Manual end-to-end with dev server**

1. Run `make dev` in anycap root (or point `API_BASE` at dev server via env). 2. Reload extension. 3. Right-click image → should see generating → done state with `resultUrl`.

- [ ] **Step 4: Commit**

```bash
git add extension/entrypoints/popup/run-generation.ts extension/entrypoints/popup/use-pending-request.ts
git commit -m "feat(extension): end-to-end generation flow"
```

---

## Task 11: Auth0 OAuth via launchWebAuthFlow

**Files:**
- Create: `extension/src/lib/auth.ts`
- Test: `extension/tests/unit/auth.test.ts`

- [ ] **Step 1: Test token extraction from callback URL**

```typescript
// extension/tests/unit/auth.test.ts
import { describe, it, expect } from 'vitest';
import { parseCallback } from '../../src/lib/auth';

describe('parseCallback', () => {
  it('extracts token from fragment', () => {
    const url = 'https://abc.chromiumapp.org/#access_token=xyz&token_type=Bearer&expires_in=3600';
    expect(parseCallback(url)).toEqual({ token: 'xyz', expiresIn: 3600 });
  });
  it('returns null when error in fragment', () => {
    const url = 'https://abc.chromiumapp.org/#error=access_denied';
    expect(parseCallback(url)).toBeNull();
  });
});
```

- [ ] **Step 2: Implement auth lib**

```typescript
// extension/src/lib/auth.ts
import { setStored } from './storage';

const CLIENT_ID = 'anycap-chrome-extension';      // to be configured in Auth0
const AUTH_URL = 'https://anycap.us.auth0.com/authorize';

export function parseCallback(url: string): { token: string; expiresIn: number } | null {
  const fragment = url.split('#')[1];
  if (!fragment) return null;
  const params = new URLSearchParams(fragment);
  if (params.get('error')) return null;
  const token = params.get('access_token');
  const expiresIn = Number(params.get('expires_in') ?? 3600);
  return token ? { token, expiresIn } : null;
}

export async function signIn(): Promise<boolean> {
  const redirectUri = chrome.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const authUrl =
    `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
  try {
    const resultUrl = await chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true });
    if (!resultUrl) return false;
    const parsed = parseCallback(resultUrl);
    if (!parsed) return false;
    await setStored('authToken', parsed.token);
    return true;
  } catch {
    return false; // user cancelled — Section 9 error matrix "OAuth Cancel" = silent return
  }
}

export async function signOut(): Promise<void> {
  await setStored('authToken', null);
}
```

- [ ] **Step 3: Run — PASS**

- [ ] **Step 4: Commit**

```bash
git add extension/src/lib/auth.ts extension/tests/unit/auth.test.ts
git commit -m "feat(extension): Auth0 OAuth via launchWebAuthFlow"
```

---

## Task 12: Popup views — full UI

**Files:**
- Replace stubs from Task 8: all files in `extension/entrypoints/popup/views/`

- [ ] **Step 1: Implement IdleView (with recent gallery)**

```tsx
// extension/entrypoints/popup/views/IdleView.tsx
import { useEffect, useState } from 'react';
import { getStored } from '@/src/lib/storage';

export function IdleView() {
  const [recent, setRecent] = useState<Array<{ resultUrl: string; ts: number }>>([]);
  useEffect(() => { getStored('recentGenerations').then(setRecent); }, []);

  return (
    <div className="p-4 flex flex-col gap-4">
      <p className="text-sm">Right-click any image on the web to start.</p>
      {recent.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wider text-[#6b7d3a]">Recent</p>
          <div className="grid grid-cols-3 gap-1">
            {recent.slice(0, 6).map((r) => (
              <img key={r.ts} src={r.resultUrl} className="aspect-square object-cover rounded" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement GeneratingView (animated)**

```tsx
// extension/entrypoints/popup/views/GeneratingView.tsx
import { usePopupStore } from '../store';

export function GeneratingView() {
  const src = usePopupStore((s) => s.currentSrc);
  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <div className="w-full aspect-square bg-[#f0f0f0] rounded overflow-hidden">
        {src && <img src={src} className="w-full h-full object-cover opacity-60" />}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full bg-[#6b7d3a] animate-pulse" />
        Generating variation…
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement DoneView (with download)**

```tsx
// extension/entrypoints/popup/views/DoneView.tsx
import { usePopupStore } from '../store';
import { getStored } from '@/src/lib/storage';
import { useState, useEffect } from 'react';

export function DoneView() {
  const { result, reset } = usePopupStore();
  const [authed, setAuthed] = useState(false);
  useEffect(() => { getStored('authToken').then((t) => setAuthed(!!t)); }, []);

  if (!result) return null;

  const download = () => chrome.downloads.download({ url: result.resultUrl, filename: `anycap-${Date.now()}.png` });

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-1">
        <img src={result.srcUrl} className="aspect-square object-cover rounded" />
        <img src={result.resultUrl} className="aspect-square object-cover rounded border-2 border-[#6b7d3a]" />
      </div>
      <button onClick={download} className="px-4 py-2 rounded bg-[#6b7d3a] text-white text-sm">Download</button>
      <button onClick={reset} className="px-4 py-2 rounded border border-[#d4dbb8] text-sm">Try another</button>
      <button disabled={!authed} className="px-4 py-2 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed">
        {authed ? 'Save to Drive' : 'Save to Drive (sign in required)'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement ErrorView**

```tsx
// extension/entrypoints/popup/views/ErrorView.tsx
import { usePopupStore } from '../store';
import { ERROR_COPY } from '@/src/lib/errors';
import { PRICING_URL } from '@/src/lib/constants';
import { signIn } from '@/src/lib/auth';

export function ErrorView() {
  const { error, reset, currentSrc } = usePopupStore();
  if (!error) return null;
  const retry = () => { reset(); if (currentSrc) import('../run-generation').then(m => m.runGeneration(currentSrc)); };
  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="text-sm">{error.message || ERROR_COPY[error.code]}</p>
      {error.retriable === 'manual' && <button onClick={retry} className="px-4 py-2 rounded bg-[#6b7d3a] text-white text-sm">Retry</button>}
      {error.retriable === 'upgrade' && <button onClick={() => chrome.tabs.create({ url: PRICING_URL })} className="px-4 py-2 rounded bg-[#6b7d3a] text-white text-sm">Upgrade to Pro</button>}
      {error.retriable === 'login' && <button onClick={async () => { if (await signIn()) retry(); }} className="px-4 py-2 rounded bg-[#6b7d3a] text-white text-sm">Sign In</button>}
    </div>
  );
}
```

- [ ] **Step 5: Implement PaywallView**

```tsx
// extension/entrypoints/popup/views/PaywallView.tsx
import { signIn } from '@/src/lib/auth';
import { usePopupStore } from '../store';

export function PaywallView() {
  const { reset, currentSrc } = usePopupStore();
  const handleSignIn = async () => {
    const ok = await signIn();
    if (ok && currentSrc) {
      reset();
      const m = await import('../run-generation');
      m.runGeneration(currentSrc);
    }
  };
  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-base font-semibold">You've used your 3 free tries</h3>
      <p className="text-sm text-[#4d5145]">Sign in to get <strong>50 free credits/month</strong> and save to Drive.</p>
      <button onClick={handleSignIn} className="px-4 py-2 rounded bg-[#6b7d3a] text-white text-sm">Sign in with AnyCap</button>
    </div>
  );
}
```

- [ ] **Step 6: Add downloads permission to manifest**

```typescript
// extension/wxt.config.ts — add 'downloads' to permissions array
permissions: ['contextMenus', 'activeTab', 'storage', 'identity', 'downloads'],
```

- [ ] **Step 7: Manual verify each view**

Trigger each state: idle (first open), generating (after right-click), done (successful), error (disconnect network), paywall (click 3 times without sign-in).

- [ ] **Step 8: Commit**

```bash
git add extension/entrypoints/popup/views/ extension/wxt.config.ts
git commit -m "feat(extension): full popup UI for 5 states"
```

---

## Task 13: Drive save + Pro watermark toggle

**Files:**
- Modify: `extension/entrypoints/popup/views/DoneView.tsx`
- Create: `extension/src/lib/drive.ts`
- Test: `extension/tests/unit/drive.test.ts`

- [ ] **Step 1: Test drive upload**

```typescript
// extension/tests/unit/drive.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { saveToDrive } from '../../src/lib/drive';
import { API_BASE } from '../../src/lib/constants';

describe('saveToDrive', () => {
  it('POSTs to /v1/drive/upload-url with anycap:// ref', async () => {
    server.use(
      http.post(`${API_BASE}/v1/drive/upload-url`, async ({ request }) => {
        const body = await request.json() as any;
        expect(body.sourceUrl).toBe('https://cdn/r.png');
        return HttpResponse.json({ externalId: 'dn_abc' });
      }),
    );
    const id = await saveToDrive({ resultUrl: 'https://cdn/r.png', authToken: 't' });
    expect(id).toBe('dn_abc');
  });
});
```

- [ ] **Step 2: Implement**

```typescript
// extension/src/lib/drive.ts
import { API_BASE } from './constants';

export async function saveToDrive(args: { resultUrl: string; authToken: string }): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/drive/upload-url`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${args.authToken}` },
    body: JSON.stringify({ sourceUrl: args.resultUrl }),
  });
  if (!res.ok) {
    const err: any = new Error(`Drive save failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const { externalId } = await res.json();
  return externalId;
}
```

- [ ] **Step 3: Wire into DoneView**

Replace the disabled button in `DoneView.tsx`:

```tsx
// extension/entrypoints/popup/views/DoneView.tsx (modify)
import { saveToDrive } from '@/src/lib/drive';
import { getStored } from '@/src/lib/storage';
import { useState } from 'react';

// inside DoneView component
const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const handleSaveDrive = async () => {
  setSaveState('saving');
  const token = await getStored('authToken');
  if (!token) { setSaveState('error'); return; }
  try {
    await saveToDrive({ resultUrl: result.resultUrl, authToken: token });
    setSaveState('saved');
  } catch { setSaveState('error'); }
};

// replace the disabled button with:
<button onClick={handleSaveDrive} disabled={!authed || saveState === 'saving'} className="...">
  {saveState === 'saved' ? '✓ Saved to Drive' : saveState === 'saving' ? 'Saving…' : authed ? 'Save to Drive' : 'Sign in to save'}
</button>
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add extension/src/lib/drive.ts extension/entrypoints/popup/views/DoneView.tsx extension/tests/unit/drive.test.ts
git commit -m "feat(extension): save result to drive button"
```

---

## Task 14: Server — watermark param on /v1/image/generate

**Files:**
- Create: `internal/application/capabilities/image/watermark.go`
- Modify: `internal/transport/http/handlers/image_generate_handler.go`
- Test: `test/integration/image_watermark_test.go`

- [ ] **Step 1: Write failing integration test**

```go
// test/integration/image_watermark_test.go (skeleton; adapt to existing test style)
package integration_test

import (
    "bytes"
    "net/http"
    "testing"
)

func TestImageGenerateAcceptsWatermarkParam(t *testing.T) {
    srv := startTestServer(t) // existing helper
    body := []byte(`{"mode":"image-to-image","prompt":"x","images":["https://x/a.png"],"watermark":true}`)
    req, _ := http.NewRequest("POST", srv.URL+"/v1/image/generate", bytes.NewReader(body))
    req.Header.Set("content-type", "application/json")
    req.Header.Set("authorization", "Bearer "+testToken(t))
    res, err := http.DefaultClient.Do(req)
    if err != nil { t.Fatal(err) }
    if res.StatusCode != 200 { t.Fatalf("want 200, got %d", res.StatusCode) }
    // Further: verify watermark was applied in resulting asset metadata
}
```

- [ ] **Step 2: Run — FAIL (watermark not plumbed yet)**

```bash
cd /Users/shwang/projects/anycap && go test ./test/integration/... -run TestImageGenerateAcceptsWatermark
```

- [ ] **Step 3: Add watermark helper**

```go
// internal/application/capabilities/image/watermark.go
package image

// WatermarkConfig describes whether/how to stamp a generated asset.
// When Enabled is true, the pipeline composites the "made with anycap.ai" glyph.
type WatermarkConfig struct {
    Enabled bool
}

func ResolveWatermark(userIsPro bool, requested bool) WatermarkConfig {
    // Pro may turn off; Free/anon always ON
    if !userIsPro {
        return WatermarkConfig{Enabled: true}
    }
    return WatermarkConfig{Enabled: requested}
}
```

- [ ] **Step 4: Plumb into handler**

```go
// internal/transport/http/handlers/image_generate_handler.go (modify request struct + call site)
type generateRequest struct {
    Mode      string   `json:"mode"`
    Prompt    string   `json:"prompt"`
    Images    []string `json:"images"`
    Watermark bool     `json:"watermark"` // NEW
}

// in Handle():
wm := image.ResolveWatermark(authUser.IsPro(), req.Watermark)
result, err := h.service.Generate(ctx, application.GenerateArgs{
    // ... existing fields
    Watermark: wm.Enabled,
})
```

(Engineer should add the corresponding field to the service layer's `GenerateArgs` and plumb down to the NexusHub client; the NexusHub integration exposes a `watermark` flag — see `internal/infrastructure/nexushub/image_client.go`.)

- [ ] **Step 5: Run — PASS**

```bash
go test ./test/integration/... -run TestImageGenerateAcceptsWatermark
```

- [ ] **Step 6: Commit**

```bash
git add internal/application/capabilities/image/watermark.go internal/transport/http/handlers/image_generate_handler.go test/integration/image_watermark_test.go
git commit -m "feat(server): accept watermark param on image/generate"
```

---

## Task 15: Server — anonymous rate limit (install_id + IP)

**Files:**
- Create: `internal/middleware/anon_rate_limit.go`
- Modify: `internal/app/bootstrap.go`
- Test: `test/integration/anon_rate_limit_test.go`

- [ ] **Step 1: Write failing test**

```go
// test/integration/anon_rate_limit_test.go
func TestAnonRateLimit_3PerInstallID(t *testing.T) {
    srv := startTestServer(t)
    installID := "test-install-123"
    req := func() *http.Response {
        r, _ := http.NewRequest("POST", srv.URL+"/v1/image/generate", validBody())
        r.Header.Set("x-anycap-install-id", installID)
        r.Header.Set("x-anycap-source", "chrome-extension")
        // NO authorization header → anonymous
        res, _ := http.DefaultClient.Do(r)
        return res
    }
    for i := 0; i < 3; i++ {
        if got := req(); got.StatusCode != 200 { t.Fatalf("req %d: want 200, got %d", i, got.StatusCode) }
    }
    if got := req(); got.StatusCode != 429 { t.Fatalf("4th req: want 429, got %d", got.StatusCode) }
}
```

- [ ] **Step 2: Implement middleware**

```go
// internal/middleware/anon_rate_limit.go
package middleware

import (
    "net/http"
    "sync"
    "time"

    "github.com/cloudwego/hertz/pkg/app"
)

const anonMaxPerInstall = 3

type anonLimiter struct {
    mu    sync.Mutex
    byKey map[string]int
    reset map[string]time.Time
    ttl   time.Duration
}

func NewAnonRateLimit() app.HandlerFunc {
    lim := &anonLimiter{
        byKey: map[string]int{},
        reset: map[string]time.Time{},
        ttl:   30 * 24 * time.Hour, // "install terminal"
    }
    return func(c context.Context, ctx *app.RequestContext) {
        if ctx.Request.Header.Get("authorization") != "" {
            ctx.Next(c)
            return
        }
        installID := ctx.Request.Header.Get("x-anycap-install-id")
        if installID == "" {
            ctx.Next(c) // non-extension anon path — other rate limiter applies
            return
        }
        ip := ctx.ClientIP()
        key := installID + ":" + ip

        lim.mu.Lock()
        defer lim.mu.Unlock()
        if t, ok := lim.reset[key]; ok && time.Now().After(t) {
            delete(lim.byKey, key)
            delete(lim.reset, key)
        }
        if lim.byKey[key] >= anonMaxPerInstall {
            ctx.AbortWithStatusJSON(http.StatusTooManyRequests, map[string]string{
                "code": "TRIAL_EXHAUSTED",
                "message": "Anonymous trial exhausted. Sign in for more.",
            })
            return
        }
        lim.byKey[key]++
        lim.reset[key] = time.Now().Add(lim.ttl)
        ctx.Next(c)
    }
}
```

- [ ] **Step 3: Register middleware in bootstrap**

```go
// internal/app/bootstrap.go (append to anonymous-allowed routes)
router.POST("/v1/image/generate", middleware.NewAnonRateLimit(), auth.Optional(), handler.Generate)
```

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add internal/middleware/anon_rate_limit.go internal/app/bootstrap.go test/integration/anon_rate_limit_test.go
git commit -m "feat(server): anonymous rate limit (install_id + IP, 3 per 30d)"
```

---

## Task 16: Server — `/v1/extension/config` endpoint

**Files:**
- Create: `internal/application/extension/config_service.go`
- Create: `internal/transport/http/handlers/extension_config_handler.go`
- Modify: `internal/transport/http/router.go`
- Test: `test/integration/extension_config_test.go`

- [ ] **Step 1: Write failing test**

```go
// test/integration/extension_config_test.go
func TestExtensionConfig_ReturnsDefaults(t *testing.T) {
    srv := startTestServer(t)
    res, err := http.Get(srv.URL + "/v1/extension/config")
    if err != nil { t.Fatal(err) }
    if res.StatusCode != 200 { t.Fatalf("want 200, got %d", res.StatusCode) }
    var cfg struct {
        DefaultPrompt string `json:"default_prompt"`
        DefaultModel  string `json:"default_model"`
        MinImageDim   int    `json:"min_image_dim"`
    }
    json.NewDecoder(res.Body).Decode(&cfg)
    if cfg.DefaultPrompt == "" { t.Error("empty prompt") }
    if cfg.DefaultModel == "" { t.Error("empty model") }
    if cfg.MinImageDim < 256 { t.Error("min dim < 256") }
}
```

- [ ] **Step 2: Implement**

```go
// internal/application/extension/config_service.go
package extension

type Config struct {
    DefaultPrompt string `json:"default_prompt"`
    DefaultModel  string `json:"default_model"`
    MinImageDim   int    `json:"min_image_dim"`
}

type ConfigService struct{ cfg Config }

func NewConfigService() *ConfigService {
    return &ConfigService{cfg: Config{
        DefaultPrompt: "create a stylistic variation of this image",
        DefaultModel:  "nano-banana-2",
        MinImageDim:   256,
    }}
}

func (s *ConfigService) Current() Config { return s.cfg }
```

```go
// internal/transport/http/handlers/extension_config_handler.go
type ExtensionConfigHandler struct{ svc *extension.ConfigService }

func NewExtensionConfigHandler(svc *extension.ConfigService) *ExtensionConfigHandler {
    return &ExtensionConfigHandler{svc: svc}
}

func (h *ExtensionConfigHandler) Get(ctx context.Context, c *app.RequestContext) {
    c.JSON(http.StatusOK, h.svc.Current())
}
```

```go
// internal/transport/http/router.go — add route
router.GET("/v1/extension/config", extensionConfigHandler.Get)
```

- [ ] **Step 3: Run — PASS**

- [ ] **Step 4: Commit**

```bash
git add internal/application/extension/ internal/transport/http/handlers/extension_config_handler.go internal/transport/http/router.go test/integration/extension_config_test.go
git commit -m "feat(server): /v1/extension/config endpoint"
```

---

## Task 17: Extension reads server config (optional — hook for v0.2 remote prompt tuning)

**Files:**
- Modify: `extension/src/lib/api.ts`
- Modify: `extension/src/lib/constants.ts`

- [ ] **Step 1: Add `fetchConfig` to api.ts**

```typescript
// extension/src/lib/api.ts (append)
export async function fetchConfig(): Promise<{ defaultPrompt: string; defaultModel: string; minImageDim: number }> {
  const res = await fetch(`${API_BASE}/v1/extension/config`);
  if (!res.ok) throw new Error('config fetch failed');
  const json = await res.json();
  return { defaultPrompt: json.default_prompt, defaultModel: json.default_model, minImageDim: json.min_image_dim };
}
```

- [ ] **Step 2: Cache in storage, refresh on install/startup**

```typescript
// extension/entrypoints/background.ts — add in onInstalled and on startup
import { fetchConfig } from '@/src/lib/api';

chrome.runtime.onStartup.addListener(async () => {
  try {
    const cfg = await fetchConfig();
    await chrome.storage.local.set({ serverConfig: cfg });
  } catch {}
});
```

- [ ] **Step 3: Use cached prompt in `generateVariation` (fall back to constant)**

```typescript
// extension/src/lib/api.ts (modify body construction)
// Replace DEFAULT_PROMPT usage with:
const cached = (await chrome.storage.local.get('serverConfig')).serverConfig;
const prompt = cached?.defaultPrompt ?? DEFAULT_PROMPT;
```

- [ ] **Step 4: Commit**

```bash
git add extension/src/lib/api.ts extension/entrypoints/background.ts
git commit -m "feat(extension): fetch server-side default prompt/model"
```

---

## Task 18: Options / Welcome page

**Files:**
- Create: `extension/entrypoints/options/{index.html,main.tsx,App.tsx}`
- Modify: `extension/wxt.config.ts` (register options_ui)

- [ ] **Step 1: Implement App**

```tsx
// extension/entrypoints/options/App.tsx
import { useEffect, useState } from 'react';
import { getStored, setStored } from '@/src/lib/storage';
import { signIn, signOut } from '@/src/lib/auth';
import { PRICING_URL } from '@/src/lib/constants';

export function App() {
  const [authed, setAuthed] = useState(false);
  const [apiKey, setApiKey] = useState('');
  useEffect(() => { getStored('authToken').then(t => setAuthed(!!t)); getStored('apiKey').then(k => setApiKey(k ?? '')); }, []);

  const saveKey = async () => { await setStored('apiKey', apiKey || null); };

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Welcome to AnyCap for Chrome</h1>
      <p className="text-sm mb-6">Right-click any image on the web to generate a variation. Turn anything you see into new content.</p>
      <img src="/welcome.gif" alt="demo" className="w-full max-w-md rounded mb-8" />

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        {authed ? (
          <button onClick={async () => { await signOut(); setAuthed(false); }} className="px-4 py-2 border rounded">Sign out</button>
        ) : (
          <button onClick={async () => { if (await signIn()) setAuthed(true); }} className="px-4 py-2 bg-[#6b7d3a] text-white rounded">Sign in with AnyCap</button>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Or use API Key</h2>
        <p className="text-sm text-gray-600 mb-2">For CLI users. <a href="https://anycap.ai/keys" className="underline">Get a key</a>.</p>
        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="akid_..." className="w-full px-3 py-2 border rounded mb-2" />
        <button onClick={saveKey} className="px-4 py-2 border rounded">Save</button>
      </section>

      <section className="text-xs text-gray-500">
        <a href="https://anycap.ai/privacy/extension" className="underline">Privacy policy</a> · <a href={PRICING_URL} className="underline">Pricing</a>
      </section>
    </div>
  );
}
```

```tsx
// extension/entrypoints/options/main.tsx — same pattern as popup/main.tsx
```

- [ ] **Step 2: Register in manifest**

```typescript
// extension/wxt.config.ts — add
manifest: {
  options_ui: { page: 'options.html', open_in_tab: true },
  // ...
}
```

- [ ] **Step 3: Commit**

```bash
git add extension/entrypoints/options/ extension/wxt.config.ts
git commit -m "feat(extension): options/welcome page with sign-in + api key"
```

---

## Task 19: Privacy page on anycap.ai

**Files:**
- Create: `web/src/app/(seo)/privacy/extension/page.tsx`
- Create: `web/src/app/[locale]/(seo)/privacy/extension/page.tsx`

- [ ] **Step 1: Write the page (follow existing privacy page style)**

```tsx
// web/src/app/(seo)/privacy/extension/page.tsx
import { SeoShell } from '@/components/layout/SeoShell';

export const metadata = {
  title: 'Privacy — AnyCap Chrome Extension',
  description: 'What data the AnyCap Chrome Extension collects and how it is used.',
};

export default function ExtensionPrivacyPage() {
  return (
    <SeoShell>
      <article className="prose max-w-2xl mx-auto py-12">
        <h1>AnyCap Chrome Extension — Privacy</h1>
        <p><em>Effective date: 2026-04-28</em></p>

        <h2>Data we collect</h2>
        <ul>
          <li><strong>The image URL you right-click</strong>. Sent to our server to generate the variation.</li>
          <li><strong>An anonymous install ID</strong> (random UUID generated in your browser). Used only for anonymous-trial rate limiting.</li>
          <li><strong>If you sign in</strong>: your AnyCap account ID and auth token. Stored only in <code>chrome.storage.local</code>.</li>
          <li><strong>Usage telemetry</strong> (install / generate / download / login counts). No URLs, no image content.</li>
        </ul>

        <h2>What we DO NOT collect</h2>
        <ul>
          <li>Page DOM, cookies, or browsing history.</li>
          <li>Any content from pages you do not right-click on.</li>
          <li>Your clipboard.</li>
        </ul>

        <h2>Data retention</h2>
        <p>Generated images (results) are stored in your AnyCap Drive when you sign in. They are deleted when you delete them from Drive or close your account. Anonymous generations are not persisted beyond the session.</p>

        <h2>Third parties</h2>
        <p>Images are sent to our model providers (NexusHub → e.g. nano-banana) to produce the variation. These providers do not retain the images after the generation completes.</p>

        <h2>Contact</h2>
        <p><a href="mailto:privacy@anycap.ai">privacy@anycap.ai</a></p>
      </article>
    </SeoShell>
  );
}
```

Replicate localized variant under `web/src/app/[locale]/(seo)/privacy/extension/page.tsx` (standard SEO convention in this repo).

- [ ] **Step 2: Add to sitemap priorities**

```typescript
// web/src/lib/site.ts — append to publicRouteDefinitions
{ path: '/privacy/extension', priority: 0.3 },
```

- [ ] **Step 3: Run local dev and verify**

```bash
cd web && pnpm dev
# Visit http://localhost:3000/privacy/extension
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/
git commit -m "docs(web): add chrome extension privacy page"
```

---

## Task 20: Visual polish — icons, brand colors, dark mode

**Files:**
- Modify: `extension/public/icons/*.png` (real brand icons from design)
- Modify: `extension/entrypoints/popup/App.tsx` (dark mode support)
- Create: `extension/assets/tailwind.css`

- [ ] **Step 1: Replace placeholder icons with real brand assets**

Copy from design repo / anycap.ai logos:
- 16×16 PNG (toolbar)
- 48×48 PNG (management page)
- 128×128 PNG (Store listing)

Optimize with `pngquant` or similar.

- [ ] **Step 2: Set up Tailwind theme matching anycap.ai brand**

```css
/* extension/assets/tailwind.css */
@import 'tailwindcss';
@theme {
  --color-brand: #6b7d3a;
  --color-ink: #1c1f17;
  --color-cream: #f4f5f0;
  --color-mid: #4d5145;
  --color-mist: #d4dbb8;
  --font-mono: ui-monospace, SFMono-Regular, monospace;
}
```

- [ ] **Step 3: Add dark mode basic support**

```tsx
// extension/entrypoints/popup/App.tsx — modify header + main wrapper
<div className="w-[320px] h-[480px] bg-white dark:bg-[#1c1f17] text-[#1c1f17] dark:text-[#f4f5f0] flex flex-col">
```

- [ ] **Step 4: Run `pnpm build`, load in dark-themed Chrome, verify**

- [ ] **Step 5: Commit**

```bash
git add extension/public/icons/ extension/assets/tailwind.css extension/entrypoints/popup/App.tsx
git commit -m "polish(extension): brand icons + tailwind theme + dark mode"
```

---

## Task 21: Playwright E2E — happy path

**Files:**
- Create: `extension/playwright.config.ts`
- Create: `extension/tests/e2e/fixtures.ts`
- Create: `extension/tests/e2e/happy-path.spec.ts`

- [ ] **Step 1: Configure Playwright to load the unpacked extension**

```typescript
// extension/playwright.config.ts
import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: false, viewport: { width: 1280, height: 800 } },
  webServer: { command: 'pnpm dev', port: 3001, reuseExistingServer: true, timeout: 120_000 },
});
```

```typescript
// extension/tests/e2e/fixtures.ts
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';

export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  context: async ({}, use) => {
    const pathToExtension = path.resolve(__dirname, '../../.output/chrome-mv3-dev');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const sw = await context.waitForEvent('serviceworker');
    const extensionId = sw.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
```

- [ ] **Step 2: Write happy path test**

```typescript
// extension/tests/e2e/happy-path.spec.ts
import { test, expect } from './fixtures';

test('right-click image → generate variation → download', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto('data:text/html,<img id="x" src="https://picsum.photos/800/600" width="800" height="600">');
  await page.waitForSelector('#x');

  // Right-click the image
  await page.click('#x', { button: 'right' });
  // Chrome context menu is native — we can't click it via Playwright.
  // Workaround: send the message directly via extension bus.
  await context.backgroundPages()[0]?.evaluate(() => {
    chrome.runtime.sendMessage({
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
      pageUrl: 'about:blank',
    });
  });

  // Open popup
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByText(/Generating/i)).toBeVisible({ timeout: 2_000 });
  await expect(popup.getByRole('button', { name: /Download/i })).toBeVisible({ timeout: 30_000 });
});
```

- [ ] **Step 3: Run — initially may FAIL because you need a dev server + real network**

```bash
pnpm build && pnpm exec playwright test tests/e2e/happy-path.spec.ts
```

Expected: PASS against dev anycap-server (with known-good test account token injected in fixtures).

- [ ] **Step 4: Commit**

```bash
git add extension/playwright.config.ts extension/tests/e2e/
git commit -m "test(extension): e2e happy path"
```

---

## Task 22: E2E — paywall and CSP-blocked scenarios

**Files:**
- Create: `extension/tests/e2e/paywall.spec.ts`
- Create: `extension/tests/e2e/csp-blocked.spec.ts`

- [ ] **Step 1: Paywall test**

```typescript
// extension/tests/e2e/paywall.spec.ts
import { test, expect } from './fixtures';

test('4th anonymous generation shows paywall', async ({ context, extensionId }) => {
  // Seed trialCount=3 in storage
  const bg = context.backgroundPages()[0];
  await bg?.evaluate(() => chrome.storage.local.set({ trialCount: 3 }));

  await bg?.evaluate(() => {
    chrome.runtime.sendMessage({
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
      pageUrl: 'about:blank',
    });
  });

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByText(/used your 3 free tries/i)).toBeVisible();
  await expect(popup.getByRole('button', { name: /Sign in/i })).toBeVisible();
});
```

- [ ] **Step 2: CSP-blocked test**

```typescript
// extension/tests/e2e/csp-blocked.spec.ts
import { test, expect } from './fixtures';

test('CSP-blocked site shows appropriate error', async ({ context, extensionId }) => {
  const bg = context.backgroundPages()[0];
  // Simulate CSP by returning 403 from a mocked endpoint (requires intercept in fixtures)
  await bg?.evaluate(() => {
    chrome.runtime.sendMessage({
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'https://mail.google.com/secure-image.png', width: 800, height: 600 },
      pageUrl: 'about:blank',
    });
  });
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByText(/doesn.t allow extensions/i)).toBeVisible({ timeout: 15_000 });
});
```

- [ ] **Step 3: Run all E2E**

```bash
pnpm exec playwright test
```

- [ ] **Step 4: Commit**

```bash
git add extension/tests/e2e/
git commit -m "test(extension): e2e paywall + csp-blocked scenarios"
```

---

## Task 23: Chrome Web Store listing assets

**Files:**
- Create: `extension/store-assets/screenshots/{1,2,3,4}.png` (1280×800)
- Create: `extension/store-assets/icon-store.png` (128×128)
- Create: `extension/store-assets/description.md`
- Create: `extension/store-assets/demo.mp4` (≤ 60 sec)

- [ ] **Step 1: Capture 4 screenshots**

1. Right-click menu over a real web image
2. Popup "generating" state
3. Popup "done" state showing before/after
4. Options/Welcome page

Use Chrome DevTools → device mode at 1280×800, save PNG.

- [ ] **Step 2: Record 60-second demo**

Show: install → right-click image on Unsplash → 10-sec generate → before/after → download. Use Loom/screen-recorder. Export MP4.

- [ ] **Step 3: Store description**

```markdown
<!-- extension/store-assets/description.md -->
Turn anything you see into new content.

AnyCap for Chrome lets you right-click any image on the web and get a stylistic variation in about 10 seconds. Powered by AnyCap — the capability runtime for AI agents.

★ One click: right-click any image → get a stylistic variation
★ Works everywhere: Gmail, Twitter, Reddit, Pinterest, any site with images
★ 3 free trials, no signup. 50 free generations/month after signing in.
★ Everything saves to your AnyCap Drive
★ Pro: no watermark, 1,000+ generations/month

AnyCap is the capability runtime that gives AI agents everything they can't do natively — image generation, video, web clipping, and more. This extension brings image generation to every browser tab.

Privacy: we only send the URL of the image you right-click, nothing else. See https://anycap.ai/privacy/extension

Get started: https://anycap.ai
```

- [ ] **Step 4: Commit**

```bash
git add extension/store-assets/
git commit -m "docs(extension): store listing assets (screenshots + description)"
```

---

## Task 24: GitLab CI — build extension on push

**Files:**
- Modify: `.gitlab-ci.yml`

- [ ] **Step 1: Add extension build job**

```yaml
# .gitlab-ci.yml (append)
extension_build:
  stage: build
  image: node:20
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH =~ /^feat/
    - changes:
        - extension/**/*
  before_script:
    - corepack enable
    - cd extension && pnpm install --frozen-lockfile
  script:
    - pnpm test
    - pnpm build
  artifacts:
    paths:
      - extension/.output/chrome-mv3/
    expire_in: 7 days
```

- [ ] **Step 2: Commit**

```bash
git add .gitlab-ci.yml
git commit -m "ci: build extension on changes"
```

---

## Task 25: Chrome Web Store submission + launch checklist

**Files:**
- Create: `extension/LAUNCH_CHECKLIST.md`

- [ ] **Step 1: Write checklist**

```markdown
<!-- extension/LAUNCH_CHECKLIST.md -->
# v0.1 Launch Checklist

Run through in order. Each item must pass before submitting to Chrome Web Store.

## Pre-submit
- [ ] `pnpm build` produces a clean .output/chrome-mv3/
- [ ] All unit tests pass (`pnpm test`)
- [ ] All E2E tests pass (`pnpm e2e`)
- [ ] Manual smoke: Gmail / Twitter / Xiaohongshu-web each work
- [ ] Internal dogfood (5 people, 2 days, zero P0 bugs)
- [ ] P90 generation latency < 15 s on dev server
- [ ] Privacy page live at anycap.ai/privacy/extension
- [ ] Auth0 `anycap-chrome-extension` client has the extension's redirect URI registered
- [ ] Server deployed with watermark param + anon rate limit + /v1/extension/config

## Store submission
- [ ] Zip .output/chrome-mv3/ → upload to CWS
- [ ] Description (from store-assets/description.md)
- [ ] 4 screenshots (1280×800)
- [ ] Icon (128×128)
- [ ] Demo video (YouTube link from store-assets/demo.mp4)
- [ ] Privacy policy URL: https://anycap.ai/privacy/extension
- [ ] Permission justifications:
  - contextMenus: "Show 'Generate variation' menu on right-clicked images"
  - activeTab: "Read only the image you right-clicked; nothing else"
  - storage: "Save your trial count and auth token locally"
  - identity: "Sign you into your AnyCap account"
  - downloads: "Save generated images to your computer"
- [ ] Submit for review

## Post-submit (while waiting 3-7 days)
- [ ] Write Product Hunt launch post
- [ ] Write 即刻 / 少数派 / V2EX 介绍帖
- [ ] Record 2-minute B 站 tutorial
- [ ] Prep launch tweet thread

## Day-1 after approval
- [ ] Announce in anycap.ai banner
- [ ] Announce in飞书 daemon welcome message
- [ ] Post Product Hunt
- [ ] Monitor CWS reviews + anycap-server metrics (P90 latency, error rate, conversion funnel)
```

- [ ] **Step 2: Submit to Chrome Web Store (manual, via CWS dashboard)**

Upload `.output/chrome-mv3/` as zip. Fill in listing using `store-assets/`.

- [ ] **Step 3: Commit**

```bash
git add extension/LAUNCH_CHECKLIST.md
git commit -m "docs(extension): launch checklist"
```

---

## Self-Review

**Spec coverage check:**
- Q1 目标用户 D (3 群通吃) → reflected in opening copy ("Turn anything you see into new content") ✅
- Q2 Wedge A (image → variation) → Task 2-3, 10 ✅
- Q3 Toolbar Popup UI → Task 8, 12 ✅
- Q4 Positioning → store description Task 23 ✅
- Q5 Auth (匿名 → OAuth + API Key) → Task 11, 18 ✅
- Q6 Scout 节奏 → 25 tasks spread across 2 weeks per D1–D12 of spec Section 11 ✅
- 4-state auth machine → Task 5 quota.ts ✅
- 3-tier quota (3 trials / 50 free / Pro) → Tasks 5, 14 ✅
- 9 error cases → Task 6 errors.ts + Task 12 ErrorView ✅
- Privacy minimisation (activeTab only, no <all_urls>) → Task 1 manifest ✅
- Server: watermark / anon rate limit / extension config → Tasks 14, 15, 16 ✅
- Privacy page → Task 19 ✅
- Milestones (2-week) → all tasks have commit steps; Task 25 maps to D12 submission ✅
- Testing strategy (Vitest / MSW / Playwright) → Tasks 5-7 unit, 21-22 E2E ✅

**Placeholder scan:** no "TBD", "implement later" — one `TODO` in Task 10 (`watermark = !authToken; // TODO: Pro account check in Task 13`) resolved by Task 14 server-side watermark resolution.

**Type consistency:** `StoredSchema`, `AuthState`, `ErrorCode`, `PopupView`, `ExtensionMessage` are defined once and reused. `generateVariation` signature is consistent across Tasks 7 and 10.

---

## Open Questions (from spec Section 15 — needs resolution before Task 10)

1. **`image-to-image` accepts external URL?** — if NOT, insert a presign step in Task 10 runner (adds ~2 hours). Validate on D0 with a curl against dev server.
2. **Free tier 50 credits — shared with web?** — answer determines whether Task 15's anonymous limit needs separate counter logic.
3. **Chrome min version 118 vs 114?** — current plan uses 118 (for future Side Panel); drop to 114 if Store analytics shows long tail.
4. **Store assets produced by whom?** — Task 23 assumes engineer; if designer is in scope, transfer the sub-task.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-21-chrome-extension-v0-1.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Each task runs in isolation with full context.

2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Which approach?
