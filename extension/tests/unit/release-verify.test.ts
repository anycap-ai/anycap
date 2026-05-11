/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type ReleaseVerifyModule = {
  validateManifest: (manifest: Record<string, unknown>) => string[];
  validatePackageScripts: (pkg: Record<string, unknown>) => string[];
  readPNGDimensions: (buffer: Buffer) => { width: number; height: number };
  validateCWSAssets: (rootDir: string) => string[];
  validateStoreDescription: (text: string) => string[];
  validateLaunchCopy: (rootDir: string) => string[];
  validatePermissionJustifications: (text: string) => string[];
  validateCWSSubmissionGuide: (text: string, currentReleaseZipSha256?: string) => string[];
  validateProductionLaunchRunbook: (text: string) => string[];
  validateSupportScripts: (rootDir: string) => string[];
  validateVisibleChromeDocs: (rootDir: string) => string[];
  validateChromeExtensionLaunchDconf: (
    featureAccess: Record<string, unknown>,
    rateLimit: Record<string, unknown>,
  ) => string[];
  validateDemoVideoMetadata: (metadata: Record<string, unknown>) => string[];
  validateZipIcons: (
    manifest: Record<string, unknown>,
    readEntry: (entry: string) => Buffer,
  ) => string[];
  validateZipEntries: (
    entries: string[],
    readEntryText: (entry: string) => string,
  ) => string[];
  validateZipRequiredEntries: (entries: string[]) => string[];
  validateSyncedReleaseZip: (rootDir: string) => string[];
  validateGitLabCIExtensionJob: (text: string) => string[];
};

async function loadVerifier(): Promise<ReleaseVerifyModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/verify-release.mjs');
}

const validManifest = {
  manifest_version: 3,
  name: 'AnyCap — Image, Video, Music, Search, Crawl in your browser',
  description:
    'Side-panel access to AI capabilities — generate images, videos, music; search the web; extract pages to markdown. Right-click anything to start.',
  version: '0.2.0',
  permissions: ['contextMenus', 'activeTab', 'storage', 'downloads', 'sidePanel'],
  optional_permissions: ['identity'],
  host_permissions: ['https://api.anycap.ai/*', 'https://anycap.ai/*'],
  action: { default_title: 'AnyCap' },
  side_panel: { default_path: 'sidepanel.html' },
  background: { service_worker: 'background.js' },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      exclude_matches: ['file://*/*'],
      js: ['content-scripts/content.js'],
    },
  ],
  minimum_chrome_version: '118',
};

function pngHeader(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  buffer.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function writeAsset(root: string, relPath: string, width: number, height: number) {
  const target = path.join(root, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, pngHeader(width, height));
}

function createValidAssetTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-cws-assets-'));
  writeAsset(root, 'store-assets/cws/01-hero-1280x800.png', 1280, 800);
  writeAsset(root, 'store-assets/cws/02-rightclick-1280x800.png', 1280, 800);
  writeAsset(root, 'store-assets/cws/03-templates-1280x800.png', 1280, 800);
  writeAsset(root, 'store-assets/cws/04-history-1280x800.png', 1280, 800);
  writeAsset(root, 'store-assets/cws/05-marquee-1400x560.png', 1400, 560);
  writeAsset(root, 'store-assets/cws/06-promo-440x280.png', 440, 280);
  fs.writeFileSync(
    path.join(root, 'store-assets/description.md'),
    [
      'Image, Video, Music, Search, Crawl — in your browser.',
      '6 capabilities, one panel:',
      'Vary Image Video Music Search Crawl',
      '7 context-aware right-click menus:',
      'Free trial: 3 anonymous capability runs / month during launch, no signup.',
      'Privacy: selected text, image URL, page URL, link URL, search query, model choice. No cookies, background screenshots, or clipboard contents. https://anycap.ai/privacy/extension',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(root, 'store-assets/permission-justifications.md'),
    [
      '# Permission justifications',
      '- `contextMenus`: Show AnyCap actions on right-click.',
      '- `activeTab`: Read the current tab URL only after a user action.',
      '- `storage`: Save preferences, trial state, and local history.',
      '- `downloads`: Save generated media to the user machine.',
      '- `sidePanel`: Show the AnyCap interface in Chrome side panel.',
      '- `identity` (optional): Sign in only when the user chooses to.',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(root, 'store-assets/cws-submission.md'),
    [
      '# Chrome Web Store submission',
      'Developer console: https://chrome.google.com/webstore/devconsole/',
      'Package: releases/anycap-extension-0.2.0-chrome.zip',
      'Listing copy: store-assets/description.md',
      'Privacy policy URL: https://anycap.ai/privacy/extension',
      'Permission copy: store-assets/permission-justifications.md',
      'Screenshots: store-assets/cws/01-hero-1280x800.png, store-assets/cws/02-rightclick-1280x800.png, store-assets/cws/03-templates-1280x800.png, store-assets/cws/04-history-1280x800.png',
      'Promo assets: store-assets/cws/05-marquee-1400x560.png, store-assets/cws/06-promo-440x280.png',
      'Promotional video source: store-assets/demo.mp4. Upload to YouTube after approval.',
      'Permissions: `contextMenus`, `activeTab`, `storage`, `downloads`, `sidePanel`, optional `identity`.',
      'Privacy Practices: disclose Website content, User-provided content, Authentication information, and User activity.',
      'Purposes: app functionality, abuse prevention, security, support, and debugging.',
      'Data is not sold and not used for advertising.',
      'Limited Use disclosure is included in the privacy policy.',
      'Pre-submit gates: pnpm verify:release; pnpm smoke:server -- --base-url https://api.anycap.ai; ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real after explicit approval because it opens headed Chromium.',
      'Final upload gate: pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed.',
      'Server gates: deploy/server-prod, feature_access, rate_limit.',
    ].join('\n'),
  );
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'docs/PRODUCTION-LAUNCH-RUNBOOK.md'),
    [
      '# Production launch runbook',
      'Deploy branches: deploy/server-dev and deploy/server-prod.',
      'Configure dconf: feature_access and rate_limit.',
      'Browser-free smoke: pnpm smoke:server -- --base-url https://api.anycap.ai.',
      'Real E2E: ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real after explicit approval because it opens headed Chromium.',
      'Final audit: pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed.',
      'Chrome Web Store package: releases/anycap-extension-0.2.0-chrome.zip.',
      'Rollback: revert deploy/server-prod or tighten feature_access.',
    ].join('\n'),
  );
  return root;
}

function createVisibleChromeDocsTree(overrides: Record<string, string> = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-visible-chrome-docs-'));
  const docs: Record<string, string> = {
    'README.md': '安装步骤会使用可见 Chrome UI。Agent 执行时不要在未获明确批准的情况下运行这些步骤。',
    'DEMO.md': 'Manual Chrome steps below use a visible browser window. Run only with explicit approval.',
    'LOAD_AND_USE.md': 'Manual loading and smoke steps use visible Chrome UI. Run only with explicit approval.',
    'LAUNCH_CHECKLIST.md': 'Manual smoke is pending explicit approval because it interacts with visible Chrome.',
    ...overrides,
  };

  for (const [relPath, content] of Object.entries(docs)) {
    const target = path.join(root, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return root;
}

function createLaunchCopyTree(overrides: Record<string, string> = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-launch-copy-'));
  const files: Record<string, string> = {
    'entrypoints/sidepanel/App.tsx': [
      'You have used all 3 anonymous launch runs for this month.',
      'Account sign-in and paid plans are planned.',
    ].join('\n'),
    'entrypoints/sidepanel/tabs/SettingsTab.tsx': [
      'import { MOCK_MODE } from "@/src/lib/constants";',
      '{MOCK_MODE && (',
      '  <button>Reset demo trial counter</button>',
      ')}',
      'Account sign-in and paid plans are planned. Anonymous users get 3 runs / month during launch.',
    ].join('\n'),
    'entrypoints/options/App.tsx': 'Account sign-in and paid plans are planned.',
    'src/lib/errors.ts': 'TRIAL_EXHAUSTED: "You have used all 3 anonymous launch runs for this month."',
    ...overrides,
  };

  for (const [relPath, content] of Object.entries(files)) {
    const target = path.join(root, relPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return root;
}

describe('release verifier', () => {
  it('accepts the production Chrome Web Store manifest shape', async () => {
    const { validateManifest } = await loadVerifier();

    expect(validateManifest(validManifest)).toEqual([]);
  });

  it('rejects non-production release host permissions', async () => {
    const { validateManifest } = await loadVerifier();

    const errors = validateManifest({
      ...validManifest,
      host_permissions: [...validManifest.host_permissions, 'https://api-staging.anycap.ai/*'],
    });

    expect(errors).toContain('manifest.host_permissions must be exactly https://api.anycap.ai/*, https://anycap.ai/*');
  });

  it('rejects manifests without the side-panel runtime entrypoints', async () => {
    const { validateManifest } = await loadVerifier();

    const errors = validateManifest({
      ...validManifest,
      background: {},
      content_scripts: [],
    });

    expect(errors).toContain('manifest.background.service_worker must be background.js');
    expect(errors).toContain('manifest.content_scripts must include content-scripts/content.js for <all_urls>');
  });

  it('rejects content scripts that do not exclude local file pages', async () => {
    const { validateManifest } = await loadVerifier();

    const errors = validateManifest({
      ...validManifest,
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content-scripts/content.js'],
        },
      ],
    });

    expect(errors).toContain('manifest.content_scripts must exclude file://*/*');
  });

  it('requires the release, demo, and real smoke scripts', async () => {
    const { validatePackageScripts } = await loadVerifier();

    expect(
      validatePackageScripts({
        packageManager: 'pnpm@10.33.0',
        devDependencies: {
          '@types/chrome': '^0.1.40',
        },
        scripts: {
          release:
            'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip && node scripts/sync-release-hash.mjs',
          e2e: 'node scripts/confirm-headed-e2e.mjs && pnpm build && playwright test',
          'e2e:demo':
            'node scripts/confirm-headed-e2e.mjs && pnpm demo && ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
          'e2e:real':
            'node scripts/confirm-headed-e2e.mjs && pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
          'smoke:server': 'node scripts/smoke-server.mjs',
          'launch:audit': 'node scripts/launch-audit.mjs',
          'render:cws': 'node scripts/render-cws-assets.mjs',
          'render:demo': 'node scripts/render-demo-video.mjs',
          'shots:feishu':
            'node scripts/confirm-headed-e2e.mjs && pnpm demo && ANYCAP_E2E_MODE=demo playwright test tests/e2e/feishu-shots.spec.ts',
          'preflight:local': 'pnpm release && pnpm test && npx tsc --noEmit && pnpm verify:release',
        },
      }),
    ).toEqual([]);
  });

  it('requires the real E2E script to run the headed browser approval guard', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
        'render:demo': 'node scripts/render-demo-video.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.e2e:real must run scripts/confirm-headed-e2e.mjs first');
  });

  it('requires package.json to pin pnpm 10 for GitLab Node 22 CI installs', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release:
          'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip && node scripts/sync-release-hash.mjs',
      },
    });

    expect(errors).toContain('package.json must pin packageManager to pnpm@10.x for GitLab Node 22 CI installs');
  });

  it('requires package.json to install Chrome extension globals for clean CI type checks', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      packageManager: 'pnpm@10.33.0',
      devDependencies: {},
      scripts: {
        release:
          'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip && node scripts/sync-release-hash.mjs',
      },
    });

    expect(errors).toContain('package.json devDependencies must include @types/chrome for clean CI type checks');
  });

  it('accepts the GitLab extension job with pinned pnpm and native verifier tools', async () => {
    const { validateGitLabCIExtensionJob } = await loadVerifier();
    const text = [
      'build:extension:',
      '  script:',
      '    - apt-get update && apt-get install -y --no-install-recommends unzip ffmpeg && rm -rf /var/lib/apt/lists/*',
      '    - corepack enable',
      '    - corepack prepare pnpm@10.33.0 --activate',
      '    - cd extension',
      '    - pnpm install --frozen-lockfile',
      '    - pnpm preflight:local',
    ].join('\n');

    expect(validateGitLabCIExtensionJob(text)).toEqual([]);
  });

  it('requires the GitLab extension job to install release verifier native tools', async () => {
    const { validateGitLabCIExtensionJob } = await loadVerifier();

    expect(validateGitLabCIExtensionJob('corepack enable\npnpm preflight:local')).toContain(
      '.gitlab-ci.yml build:extension must install unzip and ffmpeg for release verification',
    );
  });

  it('requires all headed Playwright scripts to run the browser approval guard', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        e2e: 'pnpm build && playwright test',
        'e2e:demo': 'pnpm demo && ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real':
          'node scripts/confirm-headed-e2e.mjs && pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
        'render:demo': 'node scripts/render-demo-video.mjs',
        'shots:feishu': 'pnpm demo && ANYCAP_E2E_MODE=demo playwright test tests/e2e/feishu-shots.spec.ts',
        'preflight:local': 'pnpm release && pnpm test && npx tsc --noEmit && pnpm verify:release',
      },
    });

    expect(errors).toContain('package.json scripts.e2e must run scripts/confirm-headed-e2e.mjs first');
    expect(errors).toContain('package.json scripts.e2e:demo must run scripts/confirm-headed-e2e.mjs first');
    expect(errors).toContain('package.json scripts.shots:feishu must run scripts/confirm-headed-e2e.mjs first');
  });

  it('requires support scripts referenced by package release gates to exist', async () => {
    const { validateSupportScripts } = await loadVerifier();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-release-scripts-'));
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    for (const scriptName of [
      'sync-release-hash.mjs',
      'smoke-server.mjs',
      'launch-audit.mjs',
      'render-cws-assets.mjs',
      'render-demo-video.mjs',
    ]) {
      fs.writeFileSync(path.join(root, 'scripts', scriptName), '');
    }

    expect(validateSupportScripts(root)).toEqual(['scripts/confirm-headed-e2e.mjs is missing']);
  });

  it('accepts docs that gate visible Chrome operations behind explicit approval', async () => {
    const { validateVisibleChromeDocs } = await loadVerifier();

    expect(validateVisibleChromeDocs(createVisibleChromeDocsTree())).toEqual([]);
  });

  it('accepts launch UI copy scoped to anonymous v0.2 rollout', async () => {
    const { validateLaunchCopy } = await loadVerifier();

    expect(validateLaunchCopy(createLaunchCopyTree())).toEqual([]);
  });

  it('rejects launch UI copy that promises hidden sign-in quota', async () => {
    const { validateLaunchCopy } = await loadVerifier();

    expect(
      validateLaunchCopy(createLaunchCopyTree({
        'entrypoints/sidepanel/App.tsx': 'Sign in to get 50 free credits per month.',
      })),
    ).toEqual([
      'extension launch UI must not promise 50 free credits while login UI is hidden',
      'extension launch UI must not direct exhausted anonymous users to hidden sign-in quota',
      'extension launch UI must not mention unavailable monthly sign-in credits',
    ]);
  });

  it('rejects production launch UI copy that exposes trial reset controls', async () => {
    const { validateLaunchCopy } = await loadVerifier();

    expect(
      validateLaunchCopy(createLaunchCopyTree({
        'entrypoints/sidepanel/tabs/SettingsTab.tsx': 'Reset demo trial counter',
      })),
    ).toContain('demo trial reset control must be gated behind MOCK_MODE');

    expect(
      validateLaunchCopy(createLaunchCopyTree({
        'entrypoints/sidepanel/tabs/SettingsTab.tsx': 'Reset free trial counter',
      })),
    ).toContain('production extension UI must not expose a reset free trial counter');
  });

  it('rejects docs that describe visible Chrome operations without approval language', async () => {
    const { validateVisibleChromeDocs } = await loadVerifier();

    const errors = validateVisibleChromeDocs(createVisibleChromeDocsTree({
      'README.md': 'Open chrome://extensions and load the extension.',
      'DEMO.md': 'Click the toolbar icon and Chrome opens the side panel.',
      'LOAD_AND_USE.md': 'Manual smoke after loading.',
      'LAUNCH_CHECKLIST.md': 'Manual smoke: side panel opens via toolbar click.',
    }));

    expect(errors).toEqual([
      'README.md must state manual Chrome install/use steps require explicit approval because they use visible Chrome UI',
      'DEMO.md must state manual Chrome demo steps require explicit approval because they use a visible browser window',
      'LOAD_AND_USE.md must state manual loading/smoke steps require explicit approval because they use visible Chrome UI',
      'LAUNCH_CHECKLIST.md must state manual smoke requires explicit approval because it interacts with visible Chrome',
    ]);
  });

  it('requires a browser-free local production preflight script', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real':
          'node scripts/confirm-headed-e2e.mjs && pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
        'render:demo': 'node scripts/render-demo-video.mjs',
      },
    });

    expect(errors).toContain(
      'package.json scripts.preflight:local must run pnpm release, pnpm test, npx tsc --noEmit, and pnpm verify:release',
    );
  });

  it('requires local production preflight to rebuild the release package before verification', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'preflight:local': 'pnpm test && npx tsc --noEmit && pnpm verify:release',
        e2e: 'node scripts/confirm-headed-e2e.mjs && pnpm build && playwright test',
        'e2e:demo':
          'node scripts/confirm-headed-e2e.mjs && pnpm demo && ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real':
          'node scripts/confirm-headed-e2e.mjs && pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
        'render:demo': 'node scripts/render-demo-video.mjs',
      },
    });

    expect(errors).toContain(
      'package.json scripts.preflight:local must run pnpm release, pnpm test, npx tsc --noEmit, and pnpm verify:release',
    );
  });

  it('rejects local production preflight scripts that can open browsers', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'preflight:local': 'pnpm release && pnpm test && npx tsc --noEmit && pnpm verify:release && pnpm e2e:real',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real':
          'node scripts/confirm-headed-e2e.mjs && pnpm build && ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
        'render:demo': 'node scripts/render-demo-video.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.preflight:local must stay browser-free');
  });

  it('requires the browser-free server smoke script', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
      },
    });

    expect(errors).toContain('package.json scripts.smoke:server must run scripts/smoke-server.mjs');
  });

  it('requires the browser-free launch audit script', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.launch:audit must run scripts/launch-audit.mjs');
  });

  it('requires the headless Chrome Web Store asset renderer script', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.render:cws must run scripts/render-cws-assets.mjs');
  });

  it('requires the headless demo video renderer script', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
        'launch:audit': 'node scripts/launch-audit.mjs',
        'render:cws': 'node scripts/render-cws-assets.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.render:demo must run scripts/render-demo-video.mjs');
  });

  it('requires the release script to sync the WXT zip into releases', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release: 'export WXT_RELEASE=true && wxt build && wxt zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
      },
    });

    expect(errors).toContain(
      'package.json scripts.release must copy .output/anycap-extension-0.2.0-chrome.zip to releases/anycap-extension-0.2.0-chrome.zip',
    );
  });

  it('requires the release script to sync the current release zip hash into launch docs', async () => {
    const { validatePackageScripts } = await loadVerifier();

    const errors = validatePackageScripts({
      scripts: {
        release:
          'export WXT_RELEASE=true && wxt build && wxt zip && mkdir -p releases && cp .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip',
        'e2e:demo': 'ANYCAP_E2E_MODE=demo playwright test tests/e2e/sidepanel-tabs.spec.ts tests/e2e/demo-mock.spec.ts',
        'e2e:real': 'ANYCAP_E2E_MODE=real playwright test tests/e2e/real-flow.spec.ts',
        'smoke:server': 'node scripts/smoke-server.mjs',
      },
    });

    expect(errors).toContain('package.json scripts.release must run scripts/sync-release-hash.mjs after copying the release zip');
  });

  it('reads PNG dimensions from the IHDR header', async () => {
    const { readPNGDimensions } = await loadVerifier();

    expect(readPNGDimensions(pngHeader(1280, 800))).toEqual({ width: 1280, height: 800 });
  });

  it('accepts CWS assets with required dimensions', async () => {
    const { validateCWSAssets } = await loadVerifier();

    expect(validateCWSAssets(createValidAssetTree())).toEqual([]);
  });

  it('accepts demo video metadata that is browser-compatible and store-ready', async () => {
    const { validateDemoVideoMetadata } = await loadVerifier();

    expect(
      validateDemoVideoMetadata({
        streams: [{ codec_name: 'h264', width: 1280, height: 720, pix_fmt: 'yuv420p', duration: '72.000000' }],
        format: { duration: '72.000000', size: '773360' },
      }),
    ).toEqual([]);
  });

  it('rejects demo video metadata outside the CWS-ready envelope', async () => {
    const { validateDemoVideoMetadata } = await loadVerifier();

    expect(
      validateDemoVideoMetadata({
        streams: [{ codec_name: 'hevc', width: 1920, height: 1080, pix_fmt: 'yuv444p', duration: '39.000000' }],
        format: { duration: '39.000000', size: '0' },
      }),
    ).toEqual([
      'store-assets/demo.mp4 must use h264 video, got hevc',
      'store-assets/demo.mp4 must be 1280x720, got 1920x1080',
      'store-assets/demo.mp4 must use yuv420p pixel format, got yuv444p',
      'store-assets/demo.mp4 must be 60-120 seconds, got 39s',
      'store-assets/demo.mp4 must not be empty',
    ]);
  });

  it('rejects CWS assets with wrong dimensions', async () => {
    const { validateCWSAssets } = await loadVerifier();
    const root = createValidAssetTree();
    writeAsset(root, 'store-assets/cws/06-promo-440x280.png', 441, 280);

    expect(validateCWSAssets(root)).toContain(
      'store-assets/cws/06-promo-440x280.png must be 440x280, got 441x280',
    );
  });

  it('accepts store description copy with required launch claims', async () => {
    const { validateStoreDescription } = await loadVerifier();
    const text = [
      'Image, Video, Music, Search, Crawl — in your browser.',
      '6 capabilities, one panel:',
      'Vary Image Video Music Search Crawl',
      '7 context-aware right-click menus:',
      'Free trial: 3 anonymous capability runs / month during launch, no signup.',
      'Privacy: selected text, image URL, page URL, link URL, search query, model choice. No cookies, background screenshots, or clipboard contents. https://anycap.ai/privacy/extension',
    ].join('\n');

    expect(validateStoreDescription(text)).toEqual([]);
  });

  it('rejects store description copy that promises unavailable sign-in quota', async () => {
    const { validateStoreDescription } = await loadVerifier();
    const text = [
      'Image, Video, Music, Search, Crawl — in your browser.',
      '6 capabilities, one panel:',
      'Vary Image Video Music Search Crawl',
      '7 context-aware right-click menus:',
      'Free tier: 3 generations / month, no signup. Sign in for 50 / month.',
      'Privacy: https://anycap.ai/privacy/extension',
    ].join('\n');

    expect(validateStoreDescription(text)).toContain(
      'store-assets/description.md must not promise sign-in quota while extension login UI is hidden',
    );
  });

  it('rejects store description copy that advertises production trial reset controls', async () => {
    const { validateStoreDescription } = await loadVerifier();
    const text = [
      'Image, Video, Music, Search, Crawl — in your browser.',
      '6 capabilities, one panel:',
      'Vary Image Video Music Search Crawl',
      '7 context-aware right-click menus:',
      'Settings tab: default models, watermark control, reduced motion, reset trial.',
      'Free trial: 3 anonymous capability runs / month during launch, no signup.',
      'Privacy: selected text, image URL, page URL, link URL, search query, model choice. No cookies, background screenshots, or clipboard contents. https://anycap.ai/privacy/extension',
    ].join('\n');

    expect(validateStoreDescription(text)).toContain(
      'store-assets/description.md must not advertise trial reset controls in production listing copy',
    );
  });

  it('rejects store description copy without the privacy policy URL', async () => {
    const { validateStoreDescription } = await loadVerifier();

    expect(validateStoreDescription('Image Video Music Search Crawl')).toContain(
      'store-assets/description.md must include https://anycap.ai/privacy/extension',
    );
  });

  it('rejects store description copy with an incomplete privacy summary', async () => {
    const { validateStoreDescription } = await loadVerifier();
    const text = [
      'Image, Video, Music, Search, Crawl — in your browser.',
      '6 capabilities, one panel:',
      'Vary Image Video Music Search Crawl',
      '7 context-aware right-click menus:',
      'Free trial: 3 anonymous capability runs / month during launch, no signup.',
      'Privacy: prompt and image URL only. https://anycap.ai/privacy/extension',
    ].join('\n');

    expect(validateStoreDescription(text)).toContain(
      'store-assets/description.md privacy summary must mention selected text',
    );
  });

  it('rejects store description copy without all current capabilities', async () => {
    const { validateStoreDescription } = await loadVerifier();

    expect(validateStoreDescription('Privacy: https://anycap.ai/privacy/extension')).toContain(
      'store-assets/description.md must mention all current capabilities: Vary, Image, Video, Music, Search, Crawl',
    );
  });

  it('accepts permission justifications for all manifest permissions', async () => {
    const { validatePermissionJustifications } = await loadVerifier();
    const text = [
      '`contextMenus`: Show AnyCap actions on right-click.',
      '`activeTab`: Read the current tab URL only after user action.',
      '`storage`: Save preferences and history.',
      '`downloads`: Save generated media.',
      '`sidePanel`: Show the interface.',
      '`identity` (optional): Sign in when chosen.',
    ].join('\n');

    expect(validatePermissionJustifications(text)).toEqual([]);
  });

  it('rejects permission justifications that miss an optional permission', async () => {
    const { validatePermissionJustifications } = await loadVerifier();

    expect(validatePermissionJustifications('`contextMenus`: Show menus.')).toContain(
      'store-assets/permission-justifications.md must justify identity',
    );
  });

  it('accepts the Chrome Web Store submission guide with all release gates', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs.readFileSync(
      path.join(createValidAssetTree(), 'store-assets/cws-submission.md'),
      'utf8',
    );

    expect(validateCWSSubmissionGuide(text)).toEqual([]);
  });

  it('rejects the Chrome Web Store submission guide when the prod smoke gate is missing', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();

    expect(validateCWSSubmissionGuide('Package: releases/anycap-extension-0.2.0-chrome.zip')).toContain(
      'store-assets/cws-submission.md must require pnpm smoke:server -- --base-url https://api.anycap.ai',
    );
  });

  it('rejects the Chrome Web Store submission guide without the final abuse-control audit flag', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs
      .readFileSync(path.join(createValidAssetTree(), 'store-assets/cws-submission.md'), 'utf8')
      .replace(' --abuse-control-passed', '');

    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must require pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed',
    );
  });

  it('rejects the Chrome Web Store submission guide without the final real-E2E audit flag', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs
      .readFileSync(path.join(createValidAssetTree(), 'store-assets/cws-submission.md'), 'utf8')
      .replace(' --real-e2e-passed', '');

    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must require pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed',
    );
  });

  it('rejects the Chrome Web Store submission guide with a stale release zip hash', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs.readFileSync(
      path.join(createValidAssetTree(), 'store-assets/cws-submission.md'),
      'utf8',
    );

    expect(validateCWSSubmissionGuide(text, 'abc123')).toContain(
      'store-assets/cws-submission.md must include current release zip SHA-256: abc123',
    );
  });

  it('rejects the Chrome Web Store submission guide without demo video upload instructions', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs
      .readFileSync(path.join(createValidAssetTree(), 'store-assets/cws-submission.md'), 'utf8')
      .replace('Promotional video source: store-assets/demo.mp4. Upload to YouTube after approval.', '');

    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must include promotional video source: store-assets/demo.mp4',
    );
    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must include YouTube upload instruction: YouTube',
    );
  });

  it('rejects the Chrome Web Store submission guide without privacy practices disclosure', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs
      .readFileSync(path.join(createValidAssetTree(), 'store-assets/cws-submission.md'), 'utf8')
      .replace('Privacy Practices', 'Privacy Checklist');

    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must include Privacy Practices disclosure: Privacy Practices',
    );
  });

  it('rejects the Chrome Web Store submission guide without the guarded real E2E command', async () => {
    const { validateCWSSubmissionGuide } = await loadVerifier();
    const text = fs
      .readFileSync(path.join(createValidAssetTree(), 'store-assets/cws-submission.md'), 'utf8')
      .replace('ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real', 'pnpm e2e:real');

    expect(validateCWSSubmissionGuide(text)).toContain(
      'store-assets/cws-submission.md must require ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real',
    );
  });

  it('accepts the production launch runbook with deploy, dconf, validation, and rollback gates', async () => {
    const { validateProductionLaunchRunbook } = await loadVerifier();
    const text = [
      'deploy/server-dev deploy/server-prod',
      'feature_access rate_limit',
      'pnpm smoke:server -- --base-url https://api.anycap.ai',
      'ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real explicit approval headed Chromium',
      'pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed',
      'Chrome Web Store releases/anycap-extension-0.2.0-chrome.zip',
      'Rollback revert deploy/server-prod feature_access',
    ].join('\n');

    expect(validateProductionLaunchRunbook(text)).toEqual([]);
  });

  it('rejects the production launch runbook without the guarded real E2E command', async () => {
    const { validateProductionLaunchRunbook } = await loadVerifier();
    const text = [
      'deploy/server-dev deploy/server-prod',
      'feature_access rate_limit',
      'pnpm smoke:server -- --base-url https://api.anycap.ai',
      'pnpm e2e:real explicit approval headed Chromium',
      'pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed',
      'Chrome Web Store releases/anycap-extension-0.2.0-chrome.zip',
      'Rollback revert deploy/server-prod feature_access',
    ].join('\n');

    expect(validateProductionLaunchRunbook(text)).toContain(
      'docs/PRODUCTION-LAUNCH-RUNBOOK.md must require ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real',
    );
  });

  it('rejects the production launch runbook without rollback coverage', async () => {
    const { validateProductionLaunchRunbook } = await loadVerifier();

    expect(validateProductionLaunchRunbook('deploy/server-prod feature_access rate_limit')).toContain(
      'docs/PRODUCTION-LAUNCH-RUNBOOK.md must include rollback steps',
    );
  });

  it('accepts launch dconf that enables every anonymous Chrome operation with explicit RPMs', async () => {
    const { validateChromeExtensionLaunchDconf } = await loadVerifier();

    expect(
      validateChromeExtensionLaunchDconf(
        {
          features: {
            'image.generate': { enabled: true, rollout: 'all' },
            'video.generate': { enabled: true, rollout: 'all' },
            'music.generate': { enabled: true, rollout: 'all' },
            'web.search': { enabled: true, rollout: 'all' },
            'web.crawl': { enabled: true, rollout: 'all' },
          },
        },
        {
          capabilities: {
            'image.generate': 10,
            'video.generate': 5,
            'music.generate': 8,
            'web.search': 30,
            'web.crawl': 30,
          },
        },
      ),
    ).toEqual([]);
  });

  it('rejects launch dconf that would block anonymous Chrome operations', async () => {
    const { validateChromeExtensionLaunchDconf } = await loadVerifier();

    const errors = validateChromeExtensionLaunchDconf(
      {
        features: {
          'image.generate': { enabled: true, rollout: 'groups' },
          'video.generate': { enabled: true, rollout: 'all' },
          'music.generate': { enabled: true, rollout: 'all' },
          'web.search': { enabled: true, rollout: 'all' },
        },
      },
      {
        capabilities: {
          'image.generate': 10,
          'video.generate': 0,
          'music.generate': 8,
          'web.search': 30,
          'web.crawl': 30,
        },
      },
    );

    expect(new Set(errors)).toEqual(new Set([
      'chrome extension launch feature_access must set image.generate enabled=true and rollout=all',
      'chrome extension launch feature_access must set web.crawl enabled=true and rollout=all',
      'chrome extension launch rate_limit must set positive RPM for video.generate',
    ]));
  });

  it('accepts release zip icons declared in manifest with required dimensions', async () => {
    const { validateZipIcons } = await loadVerifier();
    const manifest = {
      icons: {
        '16': 'icons/16.png',
        '48': 'icons/48.png',
        '128': 'icons/128.png',
      },
    };

    expect(
      validateZipIcons(manifest, (entry) => {
        if (entry === 'icons/16.png') return pngHeader(16, 16);
        if (entry === 'icons/48.png') return pngHeader(48, 48);
        if (entry === 'icons/128.png') return pngHeader(128, 128);
        throw new Error(`missing ${entry}`);
      }),
    ).toEqual([]);
  });

  it('rejects release zip icons with wrong dimensions', async () => {
    const { validateZipIcons } = await loadVerifier();
    const manifest = {
      icons: {
        '16': 'icons/16.png',
        '48': 'icons/48.png',
        '128': 'icons/128.png',
      },
    };

    expect(
      validateZipIcons(manifest, (entry) => {
        if (entry === 'icons/16.png') return pngHeader(16, 16);
        if (entry === 'icons/48.png') return pngHeader(48, 48);
        if (entry === 'icons/128.png') return pngHeader(256, 256);
        throw new Error(`missing ${entry}`);
      }),
    ).toContain('manifest icon 128 at icons/128.png must be 128x128, got 256x256');
  });

  it('accepts release zip entries without development artifacts or forbidden hosts', async () => {
    const { validateZipEntries } = await loadVerifier();
    const entries = [
      'manifest.json',
      'background.js',
      'sidepanel.html',
      'content-scripts/content.js',
      'chunks/sidepanel.js',
      'icons/128.png',
    ];

    expect(validateZipEntries(entries, () => 'https://api.anycap.ai')).toEqual([]);
  });

  it('rejects release zips that are missing required runtime files', async () => {
    const { validateZipRequiredEntries } = await loadVerifier();

    expect(validateZipRequiredEntries(['manifest.json'])).toEqual([
      'release zip must include background.js',
      'release zip must include sidepanel.html',
      'release zip must include content-scripts/content.js',
    ]);
  });

  it('rejects release zip entries that include development artifacts', async () => {
    const { validateZipEntries } = await loadVerifier();

    expect(validateZipEntries(['chunks/sidepanel.js.map', 'tests/unit/foo.test.ts'], () => '')).toEqual([
      'release zip must not include source map chunks/sidepanel.js.map',
      'release zip must not include test file tests/unit/foo.test.ts',
    ]);
  });

  it('rejects release zip JavaScript that includes development hosts', async () => {
    const { validateZipEntries } = await loadVerifier();

    expect(
      validateZipEntries(['background.js', 'chunks/sidepanel.js'], (entry) =>
        entry === 'background.js' ? 'https://api-staging.anycap.ai' : 'http://localhost:8080',
      ),
    ).toEqual([
      'release zip background.js must not contain api-staging.anycap.ai',
      'release zip chunks/sidepanel.js must not contain localhost',
    ]);
  });

  it('rejects release zip JavaScript with stale hidden-login launch copy', async () => {
    const { validateZipEntries } = await loadVerifier();

    expect(
      validateZipEntries(['chunks/sidepanel.js'], () =>
        'Free Tries Used. Sign in to get 50 free credits per month. Reset trial in Settings. Account login coming soon.',
      ),
    ).toEqual([
      'release zip chunks/sidepanel.js: extension launch UI must not promise 50 free credits while login UI is hidden',
      'release zip chunks/sidepanel.js: extension launch UI must not direct exhausted anonymous users to hidden sign-in quota',
      'release zip chunks/sidepanel.js: extension launch UI must not mention unavailable monthly sign-in credits',
      'release zip chunks/sidepanel.js: extension launch UI must use planned account sign-in language, not stale login copy',
      'release zip chunks/sidepanel.js: paywall must not direct production users to reset anonymous trial state',
    ]);
  });

  it('rejects stale releases zip when WXT output zip differs', async () => {
    const { validateSyncedReleaseZip } = await loadVerifier();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'anycap-release-sync-'));
    fs.mkdirSync(path.join(root, '.output'), { recursive: true });
    fs.mkdirSync(path.join(root, 'releases'), { recursive: true });
    fs.writeFileSync(path.join(root, '.output/anycap-extension-0.2.0-chrome.zip'), 'new zip');
    fs.writeFileSync(path.join(root, 'releases/anycap-extension-0.2.0-chrome.zip'), 'old zip');

    expect(validateSyncedReleaseZip(root)).toEqual([
      'releases/anycap-extension-0.2.0-chrome.zip must match .output/anycap-extension-0.2.0-chrome.zip; run pnpm release',
    ]);
  });
});
