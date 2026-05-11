#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const EXPECTED_RELEASE_HOSTS = ['https://api.anycap.ai/*', 'https://anycap.ai/*'];
const EXPECTED_PERMISSIONS = ['contextMenus', 'activeTab', 'storage', 'downloads', 'sidePanel'];
const FORBIDDEN_ZIP_TEXT = ['api-staging.anycap.ai', 'localhost', '127.0.0.1', 'WXT_MOCK=true'];
const EXPECTED_EXTENSION_ICONS = [
  ['16', 16, 16],
  ['48', 48, 48],
  ['128', 128, 128],
];
const REQUIRED_CWS_PNG_ASSETS = [
  ['store-assets/cws/01-hero-1280x800.png', 1280, 800],
  ['store-assets/cws/02-rightclick-1280x800.png', 1280, 800],
  ['store-assets/cws/03-templates-1280x800.png', 1280, 800],
  ['store-assets/cws/04-history-1280x800.png', 1280, 800],
  ['store-assets/cws/05-marquee-1400x560.png', 1400, 560],
  ['store-assets/cws/06-promo-440x280.png', 440, 280],
];
const REQUIRED_CWS_TEXT_ASSETS = [
  'store-assets/description.md',
  'store-assets/permission-justifications.md',
  'store-assets/cws-submission.md',
  'docs/PRODUCTION-LAUNCH-RUNBOOK.md',
];
const REQUIRED_CWS_COMPOSER_ASSETS = [
  'store-assets/composer/01-hero.html',
  'store-assets/composer/02-rightclick.html',
  'store-assets/composer/03-templates.html',
  'store-assets/composer/04-history.html',
  'store-assets/composer/05-marquee.html',
  'store-assets/composer/06-promo.html',
];
const REQUIRED_ZIP_RUNTIME_ENTRIES = [
  'background.js',
  'sidepanel.html',
  'content-scripts/content.js',
];
const REQUIRED_SUPPORT_SCRIPTS = [
  'scripts/confirm-headed-e2e.mjs',
  'scripts/sync-release-hash.mjs',
  'scripts/smoke-server.mjs',
  'scripts/launch-audit.mjs',
  'scripts/render-cws-assets.mjs',
  'scripts/render-demo-video.mjs',
];
const CURRENT_UNIT_TEST_COUNT = 180;
const MAX_RELEASE_ZIP_COMPRESSED_BYTES = 200 * 1024;
const MAX_SIDEPANEL_JS_GZIP_BYTES = 80 * 1024;
const REQUIRED_VISIBLE_CHROME_DOCS = [
  {
    path: 'README.md',
    error: 'README.md must state manual Chrome install/use steps require explicit approval because they use visible Chrome UI',
    validate(source) {
      return (
        (source.includes('可见 Chrome UI') || source.toLowerCase().includes('visible chrome ui')) &&
        (source.includes('明确批准') || source.toLowerCase().includes('explicit approval'))
      );
    },
  },
  {
    path: 'DEMO.md',
    error: 'DEMO.md must state manual Chrome demo steps require explicit approval because they use a visible browser window',
    validate(source) {
      const lower = source.toLowerCase();
      return lower.includes('visible browser window') && lower.includes('explicit approval');
    },
  },
  {
    path: 'LOAD_AND_USE.md',
    error: 'LOAD_AND_USE.md must state manual loading/smoke steps require explicit approval because they use visible Chrome UI',
    validate(source) {
      const lower = source.toLowerCase();
      return lower.includes('visible chrome ui') && lower.includes('explicit approval');
    },
  },
  {
    path: 'LAUNCH_CHECKLIST.md',
    error: 'LAUNCH_CHECKLIST.md must state manual smoke requires explicit approval because it interacts with visible Chrome',
    validate(source) {
      const lower = source.toLowerCase();
      return lower.includes('manual smoke') && lower.includes('explicit approval') && lower.includes('visible chrome');
    },
  },
];
const REQUIRED_RELEASE_DOCS = [
  {
    path: 'README.md',
    error: `README.md must document current Vitest unit test count: ${CURRENT_UNIT_TEST_COUNT}`,
    validate(source) {
      return String(source || '').includes(`Vitest — ${CURRENT_UNIT_TEST_COUNT} 个用例`);
    },
  },
  {
    path: 'README.md',
    error: 'README.md must not reference retired engineering/anycap_chrome repository',
    validate(source) {
      return !/engineering\/anycap_chrome|anycap_chrome/i.test(String(source || ''));
    },
  },
  {
    path: 'LOAD_AND_USE.md',
    error: `LOAD_AND_USE.md must document current Vitest unit test count: ${CURRENT_UNIT_TEST_COUNT}`,
    validate(source) {
      return String(source || '').includes(`${CURRENT_UNIT_TEST_COUNT} unit tests`);
    },
  },
  {
    path: 'CHANGELOG.md',
    error: 'CHANGELOG.md must describe CWS listing and screenshot composer hidden sign-in quota/trial-reset guards',
    validate(source) {
      const lower = String(source || '').toLowerCase();
      return (
        lower.includes('listing') &&
        lower.includes('screenshot composer') &&
        lower.includes('sign-in quota') &&
        lower.includes('trial-reset')
      );
    },
  },
];
const ACCESSIBILITY_SOURCE_CHECKS = [
  {
    path: 'entrypoints/sidepanel/App.tsx',
    error: 'entrypoints/sidepanel/App.tsx must connect each tab to a labelled tabpanel with aria-controls and aria-labelledby',
    validate(source) {
      return (
        source.includes('role="tablist"') &&
        source.includes('role="tab"') &&
        source.includes('aria-controls={`tabpanel-${t.id}`}') &&
        source.includes('id={`tab-${t.id}`}') &&
        source.includes('role="tabpanel"') &&
        source.includes('id={`tabpanel-${store.activeTab}`}') &&
        source.includes('aria-labelledby={`tab-${store.activeTab}`}')
      );
    },
  },
  {
    path: 'entrypoints/sidepanel/components/OnboardingOverlay.tsx',
    error: 'entrypoints/sidepanel/components/OnboardingOverlay.tsx must expose the onboarding overlay as an aria-modal dialog labelled by its title',
    validate(source) {
      return (
        source.includes('role="dialog"') &&
        source.includes('aria-modal="true"') &&
        source.includes('aria-labelledby="onboarding-title"') &&
        source.includes('id="onboarding-title"')
      );
    },
  },
  {
    path: 'entrypoints/sidepanel/components/HistorySection.tsx',
    error: 'entrypoints/sidepanel/components/HistorySection.tsx thumbnail history buttons must use aria-label instead of relying on title only',
    validate(source) {
      return source.includes('aria-label') && source.includes('Open recent');
    },
  },
];
const REQUIRED_REAL_E2E_COMMAND = 'ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real';
const REQUIRED_FINAL_LAUNCH_AUDIT_COMMAND =
  'pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed';
const CURRENT_CAPABILITIES = ['Vary', 'Image', 'Video', 'Music', 'Search', 'Crawl'];
const REQUIRED_STORE_PRIVACY_SUMMARY_TERMS = [
  'selected text',
  'image URL',
  'page URL',
  'link URL',
  'search query',
  'model choice',
  'cookies',
  'background screenshots',
  'clipboard contents',
];
const REQUIRED_ANONYMOUS_EXTENSION_OPERATIONS = [
  'image.generate',
  'video.generate',
  'music.generate',
  'web.search',
  'web.crawl',
];
const LAUNCH_COPY_SOURCE_FILES = [
  'entrypoints/sidepanel/App.tsx',
  'entrypoints/sidepanel/tabs/SettingsTab.tsx',
  'entrypoints/options/App.tsx',
  'src/lib/errors.ts',
];
const FORBIDDEN_LAUNCH_COPY_PATTERNS = [
  [/50\s+free\s+credits/i, 'extension launch UI must not promise 50 free credits while login UI is hidden'],
  [/sign\s+in\s+to\s+get\s+50/i, 'extension launch UI must not direct exhausted anonymous users to hidden sign-in quota'],
  [/free\s+credits\s+per\s+month/i, 'extension launch UI must not mention unavailable monthly sign-in credits'],
  [/account\s+login\s+coming\s+soon/i, 'extension launch UI must use planned account sign-in language, not stale login copy'],
  [/reset\s+free\s+trial\s+counter/i, 'production extension UI must not expose a reset free trial counter'],
  [/reset\s+trial\s+in\s+settings/i, 'paywall must not direct production users to reset anonymous trial state'],
];
const FORBIDDEN_SIGN_IN_QUOTA_COPY = /(?:sign\s+in\s+(?:to\s+get|for)\s+50|50\s+free\s+credits|free\s+credits\s+per\s+month)/i;
const FORBIDDEN_TRIAL_RESET_COPY = /(?:\breset\s+(free\s+)?trial\b|\btrial\s+reset\b)/i;
const DEMO_VIDEO_PATH = 'store-assets/demo.mp4';
const REQUIRED_CWS_SUBMISSION_ITEMS = [
  ['developer console URL', 'https://chrome.google.com/webstore/devconsole/'],
  ['release package path', 'releases/anycap-extension-0.2.0-chrome.zip'],
  ['store description path', 'store-assets/description.md'],
  ['permission justifications path', 'store-assets/permission-justifications.md'],
  ['privacy policy URL', 'https://anycap.ai/privacy/extension'],
  ['screenshot 1', 'store-assets/cws/01-hero-1280x800.png'],
  ['screenshot 2', 'store-assets/cws/02-rightclick-1280x800.png'],
  ['screenshot 3', 'store-assets/cws/03-templates-1280x800.png'],
  ['screenshot 4', 'store-assets/cws/04-history-1280x800.png'],
  ['marquee promo asset', 'store-assets/cws/05-marquee-1400x560.png'],
  ['small promo asset', 'store-assets/cws/06-promo-440x280.png'],
  ['promotional video source', 'store-assets/demo.mp4'],
  ['YouTube upload instruction', 'YouTube'],
  ['release verifier gate', 'pnpm verify:release'],
  ['prod server smoke gate', 'pnpm smoke:server -- --base-url https://api.anycap.ai'],
  ['final launch audit gate', REQUIRED_FINAL_LAUNCH_AUDIT_COMMAND],
  ['real E2E gate', 'pnpm e2e:real'],
  ['prod deploy gate', 'deploy/server-prod'],
  ['feature access dconf gate', 'feature_access'],
  ['rate limit dconf gate', 'rate_limit'],
];
const REQUIRED_CWS_PRIVACY_PRACTICES = [
  'Privacy Practices',
  'Website content',
  'User-provided content',
  'Authentication information',
  'User activity',
  'app functionality',
  'abuse prevention',
  'not sold',
  'not used for advertising',
  'Limited Use',
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sameMembers(actual, expected) {
  return actual.length === expected.length && expected.every((item) => actual.includes(item));
}

export function validateManifest(manifest) {
  const errors = [];
  const permissions = asArray(manifest.permissions);
  const optionalPermissions = asArray(manifest.optional_permissions);
  const hostPermissions = asArray(manifest.host_permissions);

  if (manifest.manifest_version !== 3) {
    errors.push('manifest.manifest_version must be 3');
  }
  if (manifest.version !== '0.2.0') {
    errors.push('manifest.version must be 0.2.0');
  }
  if (!sameMembers(permissions, EXPECTED_PERMISSIONS)) {
    errors.push(`manifest.permissions must be exactly ${EXPECTED_PERMISSIONS.join(', ')}`);
  }
  if (permissions.includes('identity')) {
    errors.push('identity must stay optional, not a required permission');
  }
  if (!optionalPermissions.includes('identity')) {
    errors.push('manifest.optional_permissions must include identity');
  }
  if (!sameMembers(hostPermissions, EXPECTED_RELEASE_HOSTS)) {
    errors.push(`manifest.host_permissions must be exactly ${EXPECTED_RELEASE_HOSTS.join(', ')}`);
  }
  if (manifest.action?.default_popup) {
    errors.push('manifest.action.default_popup must not be set');
  }
  if (manifest.side_panel?.default_path !== 'sidepanel.html') {
    errors.push('manifest.side_panel.default_path must be sidepanel.html');
  }
  if (manifest.background?.service_worker !== 'background.js') {
    errors.push('manifest.background.service_worker must be background.js');
  }
  const contentScripts = asArray(manifest.content_scripts);
  const matchingContentScript = contentScripts.find((script) => {
    if (!script || typeof script !== 'object') return false;
    return asArray(script.matches).includes('<all_urls>') && asArray(script.js).includes('content-scripts/content.js');
  });
  if (!matchingContentScript) {
    errors.push('manifest.content_scripts must include content-scripts/content.js for <all_urls>');
  } else if (!asArray(matchingContentScript.exclude_matches).includes('file://*/*')) {
    errors.push('manifest.content_scripts must exclude file://*/*');
  }
  if (Number.parseInt(String(manifest.minimum_chrome_version ?? '0'), 10) < 118) {
    errors.push('manifest.minimum_chrome_version must be at least 118');
  }
  return errors;
}

export function validatePackageScripts(pkg) {
  const scripts = pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
  const devDependencies = pkg.devDependencies && typeof pkg.devDependencies === 'object' ? pkg.devDependencies : {};
  const errors = [];
  const packageManager = String(pkg.packageManager ?? '');

  if (!/^pnpm@10\./.test(packageManager)) {
    errors.push('package.json must pin packageManager to pnpm@10.x for GitLab Node 22 CI installs');
  }
  if (!devDependencies['@types/chrome']) {
    errors.push('package.json devDependencies must include @types/chrome for clean CI type checks');
  }

  if (!String(scripts.release ?? '').includes('WXT_RELEASE=true')) {
    errors.push('package.json scripts.release must build with WXT_RELEASE=true');
  }
  if (!String(scripts.release ?? '').includes('wxt zip')) {
    errors.push('package.json scripts.release must create a zip with wxt zip');
  }
  if (
    !String(scripts.release ?? '').includes('.output/anycap-extension-0.2.0-chrome.zip') ||
    !String(scripts.release ?? '').includes('releases/anycap-extension-0.2.0-chrome.zip')
  ) {
    errors.push(
      'package.json scripts.release must copy .output/anycap-extension-0.2.0-chrome.zip to releases/anycap-extension-0.2.0-chrome.zip',
    );
  }
  if (!String(scripts.release ?? '').includes('scripts/sync-release-hash.mjs')) {
    errors.push('package.json scripts.release must run scripts/sync-release-hash.mjs after copying the release zip');
  }
  if (!String(scripts['e2e:demo'] ?? '').includes('ANYCAP_E2E_MODE=demo')) {
    errors.push('package.json scripts.e2e:demo must set ANYCAP_E2E_MODE=demo');
  }
  const localPreflight = String(scripts['preflight:local'] ?? '');
  if (
    !localPreflight.includes('pnpm release') ||
    !localPreflight.includes('pnpm test') ||
    !localPreflight.includes('npx tsc --noEmit') ||
    !localPreflight.includes('pnpm verify:release')
  ) {
    errors.push(
      'package.json scripts.preflight:local must run pnpm release, pnpm test, npx tsc --noEmit, and pnpm verify:release',
    );
  }
  if (/\b(e2e|playwright|chromium)\b/i.test(localPreflight)) {
    errors.push('package.json scripts.preflight:local must stay browser-free');
  }
  if (!String(scripts['e2e:real'] ?? '').includes('ANYCAP_E2E_MODE=real')) {
    errors.push('package.json scripts.e2e:real must set ANYCAP_E2E_MODE=real');
  }
  for (const [scriptName, rawScriptValue] of Object.entries(scripts)) {
    const scriptValue = String(rawScriptValue ?? '').trim();
    if (scriptValue.includes('playwright') && !scriptValue.startsWith('node scripts/confirm-headed-e2e.mjs')) {
      errors.push(`package.json scripts.${scriptName} must run scripts/confirm-headed-e2e.mjs first`);
    }
  }
  if (!String(scripts['e2e:real'] ?? '').includes('tests/e2e/real-flow.spec.ts')) {
    errors.push('package.json scripts.e2e:real must run tests/e2e/real-flow.spec.ts');
  }
  if (!String(scripts['smoke:server'] ?? '').includes('scripts/smoke-server.mjs')) {
    errors.push('package.json scripts.smoke:server must run scripts/smoke-server.mjs');
  }
  if (!String(scripts['launch:audit'] ?? '').includes('scripts/launch-audit.mjs')) {
    errors.push('package.json scripts.launch:audit must run scripts/launch-audit.mjs');
  }
  if (!String(scripts['render:cws'] ?? '').includes('scripts/render-cws-assets.mjs')) {
    errors.push('package.json scripts.render:cws must run scripts/render-cws-assets.mjs');
  }
  if (!String(scripts['render:demo'] ?? '').includes('scripts/render-demo-video.mjs')) {
    errors.push('package.json scripts.render:demo must run scripts/render-demo-video.mjs');
  }
  return errors;
}

export function validateSupportScripts(rootDir) {
  return REQUIRED_SUPPORT_SCRIPTS
    .filter((relPath) => !fs.existsSync(path.join(rootDir, relPath)))
    .map((relPath) => `${relPath} is missing`);
}

export function validateVisibleChromeDocs(rootDir) {
  const errors = [];
  for (const item of REQUIRED_VISIBLE_CHROME_DOCS) {
    const absPath = path.join(rootDir, item.path);
    if (!fs.existsSync(absPath)) {
      errors.push(`${item.path} is missing`);
      continue;
    }
    if (!item.validate(fs.readFileSync(absPath, 'utf8'))) {
      errors.push(item.error);
    }
  }
  return errors;
}

export function validateReleaseDocs(rootDir) {
  const errors = [];
  for (const item of REQUIRED_RELEASE_DOCS) {
    const absPath = path.join(rootDir, item.path);
    if (!fs.existsSync(absPath)) {
      errors.push(`${item.path} is missing`);
      continue;
    }
    if (!item.validate(fs.readFileSync(absPath, 'utf8'))) {
      errors.push(item.error);
    }
  }
  return errors;
}

export function validateGitLabCIExtensionJob(text) {
  const source = String(text || '');
  const errors = [];

  if (!source.includes('corepack prepare pnpm@10.33.0 --activate')) {
    errors.push('.gitlab-ci.yml build:extension must activate pnpm@10.33.0');
  }
  if (!source.includes('apt-get install') || !source.includes('unzip') || !source.includes('ffmpeg')) {
    errors.push('.gitlab-ci.yml build:extension must install unzip and ffmpeg for release verification');
  }
  return errors;
}

export function readPNGDimensions(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 24) {
    throw new Error('PNG is too small to contain an IHDR header');
  }
  const signature = buffer.subarray(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(expectedSignature)) {
    throw new Error('file is not a PNG');
  }
  if (buffer.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error('PNG missing IHDR header');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function validateCWSAssets(rootDir = process.cwd()) {
  const errors = [];
  const releaseZipHash = currentReleaseZipHash(rootDir);

  for (const [relPath, expectedWidth, expectedHeight] of REQUIRED_CWS_PNG_ASSETS) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      errors.push(`${relPath} is missing`);
      continue;
    }
    try {
      const { width, height } = readPNGDimensions(fs.readFileSync(absPath));
      if (width !== expectedWidth || height !== expectedHeight) {
        errors.push(`${relPath} must be ${expectedWidth}x${expectedHeight}, got ${width}x${height}`);
      }
    } catch (err) {
      errors.push(`${relPath} is not a valid PNG: ${err.message}`);
    }
  }

  for (const relPath of REQUIRED_CWS_TEXT_ASSETS) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      errors.push(`${relPath} is missing`);
    } else if (relPath === 'store-assets/description.md') {
      errors.push(...validateStoreDescription(fs.readFileSync(absPath, 'utf8')));
    } else if (relPath === 'store-assets/permission-justifications.md') {
      errors.push(...validatePermissionJustifications(fs.readFileSync(absPath, 'utf8')));
    } else if (relPath === 'store-assets/cws-submission.md') {
      errors.push(...validateCWSSubmissionGuide(fs.readFileSync(absPath, 'utf8'), releaseZipHash));
    } else if (relPath === 'docs/PRODUCTION-LAUNCH-RUNBOOK.md') {
      errors.push(...validateProductionLaunchRunbook(fs.readFileSync(absPath, 'utf8')));
    }
  }

  for (const relPath of REQUIRED_CWS_COMPOSER_ASSETS) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      errors.push(`${relPath} is missing`);
      continue;
    }
    errors.push(...validateCWSScreenshotComposerCopy(relPath, fs.readFileSync(absPath, 'utf8')));
  }

  return errors;
}

function currentReleaseZipHash(rootDir) {
  const releaseZipPath = path.join(rootDir, 'releases/anycap-extension-0.2.0-chrome.zip');
  if (!fs.existsSync(releaseZipPath)) return undefined;
  return crypto.createHash('sha256').update(fs.readFileSync(releaseZipPath)).digest('hex');
}

export function validateDemoVideoMetadata(metadata) {
  const errors = [];
  const streams = Array.isArray(metadata?.streams) ? metadata.streams : [];
  const video = streams.find((stream) => stream && typeof stream === 'object');
  const duration = Number(metadata?.format?.duration ?? video?.duration ?? 0);
  const size = Number(metadata?.format?.size ?? 0);

  if (!video) {
    return [`${DEMO_VIDEO_PATH} must contain a video stream`];
  }
  if (video.codec_name !== 'h264') {
    errors.push(`${DEMO_VIDEO_PATH} must use h264 video, got ${video.codec_name || 'unknown'}`);
  }
  if (video.width !== 1280 || video.height !== 720) {
    errors.push(`${DEMO_VIDEO_PATH} must be 1280x720, got ${video.width || 0}x${video.height || 0}`);
  }
  if (video.pix_fmt !== 'yuv420p') {
    errors.push(`${DEMO_VIDEO_PATH} must use yuv420p pixel format, got ${video.pix_fmt || 'unknown'}`);
  }
  if (!Number.isFinite(duration) || duration < 60 || duration > 120) {
    errors.push(`${DEMO_VIDEO_PATH} must be 60-120 seconds, got ${Number.isFinite(duration) ? Math.round(duration) : 0}s`);
  }
  if (!Number.isFinite(size) || size <= 0) {
    errors.push(`${DEMO_VIDEO_PATH} must not be empty`);
  }
  return errors;
}

export function validateDemoVideoAsset(rootDir = process.cwd()) {
  const videoPath = path.join(rootDir, DEMO_VIDEO_PATH);
  if (!fs.existsSync(videoPath)) {
    return [`${DEMO_VIDEO_PATH} is missing`];
  }

  try {
    const raw = execFileSync(
      'ffprobe',
      [
        '-hide_banner',
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=codec_name,width,height,pix_fmt,duration',
        '-show_entries',
        'format=duration,size',
        '-of',
        'json',
        videoPath,
      ],
      { encoding: 'utf8' },
    );
    return validateDemoVideoMetadata(JSON.parse(raw));
  } catch (err) {
    return [`${DEMO_VIDEO_PATH} could not be probed: ${err.message}`];
  }
}

export function validateStoreDescription(text) {
  const errors = [];
  const source = String(text || '');
  const normalized = source.toLowerCase();

  if (!source.includes('https://anycap.ai/privacy/extension')) {
    errors.push('store-assets/description.md must include https://anycap.ai/privacy/extension');
  }
  if (!source.includes('6 capabilities')) {
    errors.push('store-assets/description.md must mention 6 capabilities');
  }
  if (!source.includes('7 context-aware right-click menus')) {
    errors.push('store-assets/description.md must mention 7 context-aware right-click menus');
  }
  if (!normalized.includes('free tier') && !normalized.includes('free trial')) {
    errors.push('store-assets/description.md must mention the free tier or free trial');
  }
  if (FORBIDDEN_SIGN_IN_QUOTA_COPY.test(source)) {
    errors.push('store-assets/description.md must not promise sign-in quota while extension login UI is hidden');
  }
  if (FORBIDDEN_TRIAL_RESET_COPY.test(source)) {
    errors.push('store-assets/description.md must not advertise trial reset controls in production listing copy');
  }

  const missingCapabilities = CURRENT_CAPABILITIES.filter((capability) => !source.includes(capability));
  if (missingCapabilities.length > 0) {
    errors.push(`store-assets/description.md must mention all current capabilities: ${CURRENT_CAPABILITIES.join(', ')}`);
  }
  for (const term of REQUIRED_STORE_PRIVACY_SUMMARY_TERMS) {
    if (!normalized.includes(term.toLowerCase())) {
      errors.push(`store-assets/description.md privacy summary must mention ${term}`);
    }
  }
  return errors;
}

function validateCWSScreenshotComposerCopy(relPath, source) {
  const errors = [];
  const text = String(source || '');
  if (FORBIDDEN_SIGN_IN_QUOTA_COPY.test(text)) {
    errors.push(`${relPath} must not promise sign-in quota while extension login UI is hidden`);
  }
  if (FORBIDDEN_TRIAL_RESET_COPY.test(text)) {
    errors.push(`${relPath} must not advertise trial reset controls in CWS screenshot copy`);
  }
  return errors;
}

export function validateLaunchCopy(rootDir = process.cwd()) {
  const errors = [];
  let combinedSource = '';
  let settingsSource = '';

  for (const relPath of LAUNCH_COPY_SOURCE_FILES) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      errors.push(`${relPath} is missing`);
      continue;
    }
    const source = fs.readFileSync(absPath, 'utf8');
    combinedSource += `\n${source}`;
    if (relPath.endsWith('SettingsTab.tsx')) {
      settingsSource = source;
    }
  }

  for (const [pattern, message] of FORBIDDEN_LAUNCH_COPY_PATTERNS) {
    if (pattern.test(combinedSource)) {
      errors.push(message);
    }
  }

  if (settingsSource.includes('Reset demo trial counter') && !settingsSource.includes('{MOCK_MODE && (')) {
    errors.push('demo trial reset control must be gated behind MOCK_MODE');
  }

  return errors;
}

export function validateAccessibilitySource(rootDir = process.cwd()) {
  const errors = [];

  for (const check of ACCESSIBILITY_SOURCE_CHECKS) {
    const absPath = path.join(rootDir, check.path);
    if (!fs.existsSync(absPath)) {
      errors.push(`${check.path} is missing`);
      continue;
    }
    const source = fs.readFileSync(absPath, 'utf8');
    if (!check.validate(source)) {
      errors.push(check.error);
    }
  }

  return errors;
}

export function validatePermissionJustifications(text) {
  const source = String(text || '');
  const errors = [];
  for (const permission of [...EXPECTED_PERMISSIONS, 'identity']) {
    if (!source.includes(`\`${permission}\``)) {
      errors.push(`store-assets/permission-justifications.md must justify ${permission}`);
    }
  }
  if (!source.toLowerCase().includes('optional')) {
    errors.push('store-assets/permission-justifications.md must state identity is optional');
  }
  return errors;
}

export function validateCWSSubmissionGuide(text, currentReleaseZipSha256) {
  const source = String(text || '');
  const errors = [];

  if (currentReleaseZipSha256 && !source.includes(currentReleaseZipSha256)) {
    errors.push(`store-assets/cws-submission.md must include current release zip SHA-256: ${currentReleaseZipSha256}`);
  }

  for (const [label, required] of REQUIRED_CWS_SUBMISSION_ITEMS) {
    if (!source.includes(required)) {
      if (label === 'prod server smoke gate' || label === 'final launch audit gate') {
        errors.push(`store-assets/cws-submission.md must require ${required}`);
      } else {
        errors.push(`store-assets/cws-submission.md must include ${label}: ${required}`);
      }
    }
  }
  for (const permission of [...EXPECTED_PERMISSIONS, 'identity']) {
    if (!source.includes(`\`${permission}\``)) {
      errors.push(`store-assets/cws-submission.md must include ${permission} permission`);
    }
  }
  for (const required of REQUIRED_CWS_PRIVACY_PRACTICES) {
    if (!source.includes(required)) {
      errors.push(`store-assets/cws-submission.md must include Privacy Practices disclosure: ${required}`);
    }
  }
  if (!source.toLowerCase().includes('explicit approval') || !source.toLowerCase().includes('headed chromium')) {
    errors.push('store-assets/cws-submission.md must state pnpm e2e:real needs explicit approval because it opens headed Chromium');
  }
  if (!source.includes(REQUIRED_REAL_E2E_COMMAND)) {
    errors.push(`store-assets/cws-submission.md must require ${REQUIRED_REAL_E2E_COMMAND}`);
  }

  return errors;
}

export function validateProductionLaunchRunbook(text) {
  const source = String(text || '');
  const lower = source.toLowerCase();
  const errors = [];

  if (!source.includes('deploy/server-dev') || !source.includes('deploy/server-prod')) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must include dev and prod deploy branches');
  }
  if (!source.includes('feature_access') || !source.includes('rate_limit')) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must include feature_access and rate_limit dconf steps');
  }
  if (!source.includes('pnpm smoke:server -- --base-url https://api.anycap.ai')) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must include browser-free production smoke');
  }
  if (!source.includes(`${CURRENT_UNIT_TEST_COUNT} unit tests`)) {
    errors.push(`docs/PRODUCTION-LAUNCH-RUNBOOK.md must document current Vitest unit test count: ${CURRENT_UNIT_TEST_COUNT}`);
  }
  if (
    !source.includes('pnpm e2e:real') ||
    !lower.includes('explicit approval') ||
    !lower.includes('headed chromium')
  ) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must gate real E2E behind explicit headed Chromium approval');
  }
  if (!source.includes(REQUIRED_REAL_E2E_COMMAND)) {
    errors.push(`docs/PRODUCTION-LAUNCH-RUNBOOK.md must require ${REQUIRED_REAL_E2E_COMMAND}`);
  }
  if (!source.includes(REQUIRED_FINAL_LAUNCH_AUDIT_COMMAND)) {
    errors.push(`docs/PRODUCTION-LAUNCH-RUNBOOK.md must include the final ${REQUIRED_FINAL_LAUNCH_AUDIT_COMMAND} launch audit gate`);
  }
  if (!source.includes('Chrome Web Store') || !source.includes('releases/anycap-extension-0.2.0-chrome.zip')) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must include Chrome Web Store package submission steps');
  }
  if (!lower.includes('rollback')) {
    errors.push('docs/PRODUCTION-LAUNCH-RUNBOOK.md must include rollback steps');
  }

  return errors;
}

export function validateChromeExtensionLaunchDconf(featureAccess, rateLimit) {
  const errors = [];
  const features = featureAccess?.features && typeof featureAccess.features === 'object' ? featureAccess.features : {};
  const capabilities = rateLimit?.capabilities && typeof rateLimit.capabilities === 'object' ? rateLimit.capabilities : {};

  for (const operation of REQUIRED_ANONYMOUS_EXTENSION_OPERATIONS) {
    const feature = features[operation];
    if (!feature || typeof feature !== 'object' || feature.enabled !== true || feature.rollout !== 'all') {
      errors.push(`chrome extension launch feature_access must set ${operation} enabled=true and rollout=all`);
    }

    const rpm = Number(capabilities[operation]);
    if (!Number.isFinite(rpm) || rpm <= 0) {
      errors.push(`chrome extension launch rate_limit must set positive RPM for ${operation}`);
    }
  }

  return errors;
}

export function validateChromeExtensionLaunchDconfFiles(rootDir = process.cwd()) {
  const repoRoot = fs.existsSync(path.join(rootDir, 'configs/server/dconf')) ? rootDir : path.resolve(rootDir, '..');
  const featureAccessPath = path.join(repoRoot, 'configs/server/dconf/chrome_extension_launch.feature_access.example.json');
  const rateLimitPath = path.join(repoRoot, 'configs/server/dconf/chrome_extension_launch.rate_limit.example.json');
  const errors = [];
  let featureAccess = {};
  let rateLimit = {};

  try {
    featureAccess = JSON.parse(fs.readFileSync(featureAccessPath, 'utf8'));
  } catch (err) {
    errors.push(`configs/server/dconf/chrome_extension_launch.feature_access.example.json must be valid JSON: ${err.message}`);
  }

  try {
    rateLimit = JSON.parse(fs.readFileSync(rateLimitPath, 'utf8'));
  } catch (err) {
    errors.push(`configs/server/dconf/chrome_extension_launch.rate_limit.example.json must be valid JSON: ${err.message}`);
  }

  if (errors.length === 0) {
    errors.push(...validateChromeExtensionLaunchDconf(featureAccess, rateLimit));
  }
  return errors;
}

export function validateZipIcons(manifest, readEntry) {
  const errors = [];
  const icons = manifest?.icons && typeof manifest.icons === 'object' ? manifest.icons : {};

  for (const [sizeKey, expectedWidth, expectedHeight] of EXPECTED_EXTENSION_ICONS) {
    const iconPath = icons[sizeKey];
    if (typeof iconPath !== 'string' || iconPath.trim() === '') {
      errors.push(`manifest.icons must include ${sizeKey}`);
      continue;
    }
    try {
      const { width, height } = readPNGDimensions(readEntry(iconPath));
      if (width !== expectedWidth || height !== expectedHeight) {
        errors.push(`manifest icon ${sizeKey} at ${iconPath} must be ${expectedWidth}x${expectedHeight}, got ${width}x${height}`);
      }
    } catch (err) {
      errors.push(`manifest icon ${sizeKey} at ${iconPath} is invalid: ${err.message}`);
    }
  }

  return errors;
}

export function validateZipEntries(entries, readEntryText) {
  const errors = [];
  for (const entry of entries) {
    if (entry.endsWith('/')) continue;
    if (entry.endsWith('.map')) {
      errors.push(`release zip must not include source map ${entry}`);
    }
    if (entry.includes('tests/') || entry.includes('/tests/') || entry.endsWith('.test.ts') || entry.endsWith('.spec.ts')) {
      errors.push(`release zip must not include test file ${entry}`);
    }
    if (!/\.(js|html|json|css)$/.test(entry)) {
      continue;
    }
    let text = '';
    try {
      text = String(readEntryText(entry));
    } catch (err) {
      errors.push(`release zip could not read ${entry}: ${err.message}`);
      continue;
    }
    for (const forbidden of FORBIDDEN_ZIP_TEXT) {
      if (text.includes(forbidden)) {
        errors.push(`release zip ${entry} must not contain ${forbidden.replace(/^https?:\/\//, '')}`);
      }
    }
    for (const [pattern, message] of FORBIDDEN_LAUNCH_COPY_PATTERNS) {
      if (pattern.test(text)) {
        errors.push(`release zip ${entry}: ${message}`);
      }
    }
  }
  return errors;
}

function isSidepanelJSChunk(entry) {
  return /^chunks\/sidepanel(?:-[^/]+)?\.js$/.test(entry);
}

export function validateZipPerformanceBudget(entries, readEntryBuffer, releaseZipBytes = 0) {
  const errors = [];
  if (Number.isFinite(releaseZipBytes) && releaseZipBytes > MAX_RELEASE_ZIP_COMPRESSED_BYTES) {
    errors.push(
      `release zip must be <= ${MAX_RELEASE_ZIP_COMPRESSED_BYTES} bytes compressed, got ${releaseZipBytes} bytes`,
    );
  }

  const sidepanelEntries = entries.filter(isSidepanelJSChunk);
  if (sidepanelEntries.length === 0) {
    errors.push('release zip must include chunks/sidepanel*.js for performance budget check');
  }

  for (const entry of sidepanelEntries) {
    try {
      const gzipBytes = zlib.gzipSync(readEntryBuffer(entry)).length;
      if (gzipBytes > MAX_SIDEPANEL_JS_GZIP_BYTES) {
        errors.push(`release zip ${entry} must be <= ${MAX_SIDEPANEL_JS_GZIP_BYTES} bytes gzip, got ${gzipBytes} bytes`);
      }
    } catch (err) {
      errors.push(`release zip ${entry} could not be read for performance budget: ${err.message}`);
    }
  }

  return errors;
}

function listZipEntries(zipPath) {
  const output = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function validateZipRequiredEntries(entries) {
  const entrySet = new Set(entries);
  return REQUIRED_ZIP_RUNTIME_ENTRIES
    .filter((entry) => !entrySet.has(entry))
    .map((entry) => `release zip must include ${entry}`);
}

export function validateSyncedReleaseZip(rootDir = process.cwd()) {
  const outputZipPath = path.join(rootDir, '.output/anycap-extension-0.2.0-chrome.zip');
  const releaseZipPath = path.join(rootDir, 'releases/anycap-extension-0.2.0-chrome.zip');
  if (!fs.existsSync(outputZipPath) || !fs.existsSync(releaseZipPath)) {
    return [];
  }
  const outputZip = fs.readFileSync(outputZipPath);
  const releaseZip = fs.readFileSync(releaseZipPath);
  if (outputZip.equals(releaseZip)) {
    return [];
  }
  return [
    'releases/anycap-extension-0.2.0-chrome.zip must match .output/anycap-extension-0.2.0-chrome.zip; run pnpm release',
  ];
}

export function validateReleaseArtifacts(rootDir = process.cwd()) {
  const errors = [];
  const packagePath = path.join(rootDir, 'package.json');
  const repoRoot = fs.existsSync(path.join(rootDir, '.gitlab-ci.yml')) ? rootDir : path.resolve(rootDir, '..');
  const gitlabCIPath = path.join(repoRoot, '.gitlab-ci.yml');
  const zipPath = path.join(rootDir, 'releases/anycap-extension-0.2.0-chrome.zip');

  if (!fs.existsSync(packagePath)) {
    errors.push('package.json is missing');
  } else {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    errors.push(...validatePackageScripts(pkg));
  }

  if (!fs.existsSync(gitlabCIPath)) {
    errors.push('.gitlab-ci.yml is missing');
  } else {
    errors.push(...validateGitLabCIExtensionJob(fs.readFileSync(gitlabCIPath, 'utf8')));
  }

  if (!fs.existsSync(zipPath)) {
    errors.push('releases/anycap-extension-0.2.0-chrome.zip is missing');
  } else {
    try {
      const manifestRaw = execFileSync('unzip', ['-p', zipPath, 'manifest.json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const manifest = JSON.parse(manifestRaw);
      const entries = listZipEntries(zipPath);
      errors.push(...validateManifest(manifest));
      errors.push(...validateZipIcons(manifest, (entry) => execFileSync('unzip', ['-p', zipPath, entry])));
      errors.push(...validateZipRequiredEntries(entries));
      errors.push(...validateZipEntries(entries, (entry) => execFileSync('unzip', ['-p', zipPath, entry], { encoding: 'utf8' })));
      errors.push(
        ...validateZipPerformanceBudget(
          entries,
          (entry) => execFileSync('unzip', ['-p', zipPath, entry]),
          fs.statSync(zipPath).size,
        ),
      );
    } catch (err) {
      errors.push(`failed to read manifest from release zip: ${err.message}`);
    }
  }

  errors.push(...validateCWSAssets(rootDir));
  errors.push(...validateDemoVideoAsset(rootDir));
  errors.push(...validateSupportScripts(rootDir));
  errors.push(...validateVisibleChromeDocs(rootDir));
  errors.push(...validateReleaseDocs(rootDir));
  errors.push(...validateLaunchCopy(rootDir));
  errors.push(...validateAccessibilitySource(rootDir));
  errors.push(...validateSyncedReleaseZip(rootDir));
  errors.push(...validateChromeExtensionLaunchDconfFiles(rootDir));

  return { ok: errors.length === 0, errors };
}

function main() {
  const result = validateReleaseArtifacts(process.cwd());
  if (!result.ok) {
    for (const err of result.errors) {
      console.error(`release verify: ${err}`);
    }
    process.exit(1);
  }
  console.log('release verify: ok');
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main();
}
