#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateReleaseArtifacts } from './verify-release.mjs';
import { runServerSmoke } from './smoke-server.mjs';

const DEFAULT_BASE_URL = 'https://api.anycap.ai';
const DEFAULT_INSTALL_ID = `launch-audit-${Date.now()}`;
const PRIVACY_POLICY_URL = 'https://anycap.ai/privacy/extension';
const PRIVACY_NOT_FOUND_MARKERS = ['NEXT_HTTP_ERROR_FALLBACK;404', '404 — Not Found', '404 - Not Found'];
const PRIVACY_REQUIRED_MARKERS = ['AnyCap Chrome Extension', 'Data we collect'];

function resultDetail(result) {
  const parts = [String(result.status || 'network')];
  if (result.code) parts.push(result.code);
  if (result.message) parts.push(result.message);
  return parts.join(' - ');
}

function unique(items) {
  return [...new Set(items)];
}

function blockersFromSmokeResult(smokeResult) {
  if (!smokeResult) {
    return ['Run browser-free production smoke with pnpm smoke:server -- --base-url https://api.anycap.ai.'];
  }

  const blockers = [];
  const byName = new Map(smokeResult.results.map((item) => [item.name, item]));
  const requiredFeatures = byName.get('required features');
  const extensionConfig = byName.get('extension config');
  const webSearch = byName.get('web search');
  const webCrawl = byName.get('web crawl');

  if (requiredFeatures && !requiredFeatures.ok) {
    blockers.push(
      `Configure production feature_access dconf for Chrome required features: ${requiredFeatures.message || resultDetail(requiredFeatures)}`,
    );
  }
  if (extensionConfig?.status === 404) {
    blockers.push('Deploy current server changes to production so /v1/extension/config exists.');
  } else if (extensionConfig && !extensionConfig.ok) {
    blockers.push(`Fix /v1/extension/config production smoke: ${resultDetail(extensionConfig)}`);
  }

  const anonymousWebAuthFailed =
    (webSearch?.status === 401 && webSearch?.code === 'AUTH_INVALID') ||
    (webCrawl?.status === 401 && webCrawl?.code === 'AUTH_INVALID');
  if (anonymousWebAuthFailed) {
    blockers.push('Deploy anonymous Chrome extension auth for /v1/web/search and /v1/web/crawl.');
  } else {
    for (const item of [webSearch, webCrawl]) {
      if (item && !item.ok) {
        blockers.push(`Fix ${item.name} production smoke: ${resultDetail(item)}`);
      }
    }
  }

  return unique(blockers);
}

function validatePrivacyPolicyBody(body) {
  if (PRIVACY_NOT_FOUND_MARKERS.some((marker) => body.includes(marker))) {
    return {
      ok: false,
      code: 'PRIVACY_NOT_FOUND',
      message: 'privacy policy page returned a Next.js 404 fallback',
    };
  }

  const missingMarkers = PRIVACY_REQUIRED_MARKERS.filter((marker) => !body.includes(marker));
  if (missingMarkers.length > 0) {
    return {
      ok: false,
      code: 'PRIVACY_CONTENT_MISSING',
      message: `privacy policy page missing expected content: ${missingMarkers.join(', ')}`,
    };
  }

  return { ok: true };
}

export async function checkPrivacyPolicy(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') {
    return { ok: false, status: 0, code: 'FETCH_MISSING', message: 'fetch is not available' };
  }

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchImpl(PRIVACY_POLICY_URL, { method: 'GET' });
      if (!response.ok) {
        return { ok: false, status: response.status };
      }

      const body = await response.text();
      const bodyResult = validatePrivacyPolicyBody(body);
      if (!bodyResult.ok) {
        return { ok: false, status: response.status, code: bodyResult.code, message: bodyResult.message };
      }

      return { ok: true, status: response.status };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    ok: false,
    status: 0,
    code: 'NETWORK_ERROR',
    message: lastError instanceof Error ? lastError.message : String(lastError),
  };
}

export function buildLaunchAudit({
  baseUrl,
  installId,
  releaseErrors = [],
  smokeResult,
  privacyResult,
  realE2EPassed = false,
  abuseControlPassed = false,
} = {}) {
  const checks = [];
  const blockers = [];

  if (baseUrl || installId) {
    checks.push({
      name: 'target',
      ok: true,
      detail: `base-url=${baseUrl || 'unknown'} install-id=${installId || 'unknown'}`,
    });
  }

  if (releaseErrors.length === 0) {
    checks.push({ name: 'release artifacts', ok: true, detail: 'pnpm verify:release passed' });
  } else {
    checks.push({ name: 'release artifacts', ok: false, detail: releaseErrors.join('; ') });
    blockers.push(...releaseErrors.map((error) => `Fix release artifact verification: ${error}`));
  }

  if (smokeResult) {
    for (const result of smokeResult.results) {
      checks.push({
        name: `prod smoke: ${result.name}`,
        ok: result.ok,
        detail: resultDetail(result),
      });
    }
  } else {
    checks.push({ name: 'prod smoke', ok: false, detail: 'not run' });
  }

  blockers.push(...blockersFromSmokeResult(smokeResult));

  if (privacyResult) {
    checks.push({
      name: 'privacy policy',
      ok: privacyResult.ok,
      detail: resultDetail(privacyResult),
    });
    if (!privacyResult.ok) {
      blockers.push(`Fix Chrome Web Store privacy policy URL ${PRIVACY_POLICY_URL}: ${resultDetail(privacyResult)}`);
    }
  }

  checks.push({
    name: 'anonymous abuse-control',
    ok: abuseControlPassed,
    detail: abuseControlPassed ? 'acknowledged' : 'not acknowledged',
  });
  if (!abuseControlPassed) {
    blockers.push(
      'Confirm anonymous public-trial abuse control is deployed before CWS upload; pass --abuse-control-passed only after the dual-bucket server middleware or equivalent gateway controls limit install-ID rotation.',
    );
  }

  if (!realE2EPassed) {
    blockers.push(
      'Run approved real-mode E2E with ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real after production smoke passes; it opens headed Chromium.',
    );
  }

  return {
    ok: blockers.length === 0 && checks.every((check) => check.ok),
    checks,
    blockers: unique(blockers),
  };
}

function parseArgs(argv) {
  const parsed = {
    baseUrl: process.env.ANYCAP_API_BASE || process.env.WXT_API_BASE || DEFAULT_BASE_URL,
    installId: process.env.ANYCAP_INSTALL_ID || DEFAULT_INSTALL_ID,
    realE2EPassed: false,
    abuseControlPassed: false,
    skipSmoke: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base-url') {
      parsed.baseUrl = argv[++i] || parsed.baseUrl;
    } else if (arg === '--install-id') {
      parsed.installId = argv[++i] || parsed.installId;
    } else if (arg === '--real-e2e-passed') {
      parsed.realE2EPassed = true;
    } else if (arg === '--abuse-control-passed') {
      parsed.abuseControlPassed = true;
    } else if (arg === '--skip-smoke') {
      parsed.skipSmoke = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    }
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: pnpm launch:audit [--base-url URL] [--install-id ID] [--abuse-control-passed] [--real-e2e-passed] [--skip-smoke]

Runs browser-free Chrome extension launch gates:
  - release artifact verifier
  - production anonymous extension smoke, unless --skip-smoke is set
  - Chrome Web Store privacy policy URL GET and body validation, unless --skip-smoke is set
  - anonymous public-trial abuse-control acknowledgement
  - blocker summary for deploy/dconf/CWS gates

Pass --abuse-control-passed only after the dual-bucket server middleware or equivalent gateway controls limit install-ID rotation for anonymous public trials.
Pass --real-e2e-passed only after an approved ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real run has completed green.
This command never runs Playwright and never opens Chrome.`);
}

function printAudit(audit) {
  for (const check of audit.checks) {
    const status = check.ok ? 'ok' : 'fail';
    console.log(`launch audit: ${status} ${check.name} - ${check.detail}`);
  }
  if (audit.blockers.length > 0) {
    for (const blocker of audit.blockers) {
      console.error(`launch audit: blocker ${blocker}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const releaseResult = validateReleaseArtifacts(process.cwd());
  const smokeResult = args.skipSmoke
    ? undefined
    : await runServerSmoke({
        baseUrl: args.baseUrl,
        installId: args.installId,
      });
  const privacyResult = args.skipSmoke ? undefined : await checkPrivacyPolicy();

  const audit = buildLaunchAudit({
    baseUrl: args.baseUrl,
    installId: args.installId,
    releaseErrors: releaseResult.errors,
    smokeResult,
    privacyResult,
    realE2EPassed: args.realE2EPassed,
    abuseControlPassed: args.abuseControlPassed,
  });
  printAudit(audit);
  if (!audit.ok) {
    process.exit(1);
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((err) => {
    console.error(`launch audit: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
