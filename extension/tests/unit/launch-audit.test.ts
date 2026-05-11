/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

type LaunchAuditModule = {
  checkPrivacyPolicy: (fetchImpl: typeof fetch) => Promise<{ ok: boolean; status: number; code?: string; message?: string }>;
  buildLaunchAudit: (opts: {
    baseUrl?: string;
    installId?: string;
    releaseErrors?: string[];
    realE2EPassed?: boolean;
    abuseControlPassed?: boolean;
    smokeResult?: {
      ok: boolean;
      results: Array<{ name: string; ok: boolean; status: number; code?: string; message?: string }>;
    };
    privacyResult?: { ok: boolean; status: number; code?: string; message?: string };
    youtubeDemoUrl?: string;
    dogfoodPassed?: boolean;
    latencyPassed?: boolean;
    launchEvidenceText?: string;
  }) => {
    ok: boolean;
    checks: Array<{ name: string; ok: boolean; detail: string }>;
    blockers: string[];
  };
  printAudit: (audit: {
    checks: Array<{ name: string; ok: boolean; detail: string }>;
    blockers: string[];
  }) => void;
};

async function loadAudit(): Promise<LaunchAuditModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/launch-audit.mjs');
}

const validLaunchEvidence = [
  'Dogfood status: passed',
  'Dogfood participants: 5',
  'Dogfood working days: 2',
  'P0 bugs: 0',
  'P90 generation latency seconds: 14.2',
].join('\n');

describe('launch audit', () => {
  it('includes the audited base URL and install ID for traceability', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      baseUrl: 'https://api.anycap.ai',
      installId: 'codex-audit-trace',
      releaseErrors: [],
      realE2EPassed: true,
      abuseControlPassed: true,
      smokeResult: { ok: true, results: [] },
      privacyResult: { ok: true, status: 200 },
    });

    expect(audit.checks[0]).toEqual({
      name: 'target',
      ok: true,
      detail: 'base-url=https://api.anycap.ai install-id=codex-audit-trace',
    });
  });

  it('retries transient privacy policy network failures', async () => {
    const { checkPrivacyPolicy } = await loadAudit();
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('fetch failed');
      return new Response('AnyCap Chrome Extension — Privacy\nData we collect', { status: 200 });
    }) as typeof fetch;

    const result = await checkPrivacyPolicy(fetchImpl);

    expect(calls).toBe(2);
    expect(result).toEqual({ ok: true, status: 200 });
  });

  it('rejects a Next not-found fallback even when the privacy URL returns HTTP 200', async () => {
    const { checkPrivacyPolicy } = await loadAudit();
    let method = '';
    const fetchImpl = (async (_input, init) => {
      method = init?.method || 'GET';
      return new Response(
        '<meta name="robots" content="noindex"/><template data-dgst="NEXT_HTTP_ERROR_FALLBACK;404"></template><h1>404 — Not Found</h1>',
        { status: 200 },
      );
    }) as typeof fetch;

    const result = await checkPrivacyPolicy(fetchImpl);

    expect(method).toBe('GET');
    expect(result).toEqual({
      ok: false,
      status: 200,
      code: 'PRIVACY_NOT_FOUND',
      message: 'privacy policy page returned a Next.js 404 fallback',
    });
  });

  it('reports production deploy blockers from browser-free smoke results', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      smokeResult: {
        ok: false,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: false, status: 404 },
          { name: 'web search', ok: false, status: 401, code: 'AUTH_INVALID', message: 'missing bearer' },
          { name: 'web crawl', ok: false, status: 401, code: 'AUTH_INVALID', message: 'missing bearer' },
        ],
      },
    });

    expect(audit.ok).toBe(false);
    expect(audit.checks).toContainEqual({
      name: 'release artifacts',
      ok: true,
      detail: 'pnpm verify:release passed',
    });
    expect(audit.checks).toContainEqual({
      name: 'prod smoke: required features',
      ok: true,
      detail: '200',
    });
    expect(audit.blockers.slice(0, 2)).toEqual([
      'Deploy current server changes to production so /v1/extension/config exists.',
      'Deploy anonymous Chrome extension auth for /v1/web/search and /v1/web/crawl.',
    ]);
  });

  it('reports dconf blockers when required feature flags are missing', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      smokeResult: {
        ok: false,
        results: [
          {
            name: 'required features',
            ok: false,
            status: 200,
            code: 'FEATURES_MISSING',
            message: 'disabled or missing features: web.crawl',
          },
        ],
      },
    });

    expect(audit.blockers).toContain(
      'Configure production feature_access dconf for Chrome required features: disabled or missing features: web.crawl',
    );
  });

  it('reports local release blockers before external gates', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: ['release zip is missing'],
      smokeResult: { ok: true, results: [] },
    });

    expect(audit.ok).toBe(false);
    expect(audit.blockers[0]).toBe('Fix release artifact verification: release zip is missing');
  });

  it('reports the guarded real E2E command before CWS upload', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: false,
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
      youtubeDemoUrl: 'https://www.youtube.com/watch?v=abc123XYZ_-',
      dogfoodPassed: true,
      latencyPassed: true,
    });

    expect(audit.blockers).toContain(
      'Run approved real-mode E2E with ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real after production smoke passes; it opens headed Chromium.',
    );
  });

  it('reports an anonymous abuse-control blocker before CWS upload', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
      youtubeDemoUrl: 'https://www.youtube.com/watch?v=abc123XYZ_-',
    });

    expect(audit.ok).toBe(false);
    expect(audit.checks).toContainEqual({
      name: 'anonymous abuse-control',
      ok: false,
      detail: 'not acknowledged',
    });
    expect(audit.blockers).toContain(
      'Confirm anonymous public-trial abuse control is deployed before CWS upload; pass --abuse-control-passed only after the dual-bucket server middleware or equivalent gateway controls limit install-ID rotation.',
    );
  });

  it('reports a YouTube demo video URL blocker before CWS upload', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      abuseControlPassed: true,
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
    });

    expect(audit.ok).toBe(false);
    expect(audit.checks).toContainEqual({
      name: 'YouTube demo video',
      ok: false,
      detail: 'missing',
    });
    expect(audit.blockers).toContain(
      'Upload store-assets/demo.mp4 to YouTube and add the YouTube URL to store-assets/cws-submission.md before CWS upload.',
    );
  });

  it('reports dogfood and latency blockers before CWS upload', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      abuseControlPassed: true,
      youtubeDemoUrl: 'https://www.youtube.com/watch?v=abc123XYZ_-',
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
    });

    expect(audit.ok).toBe(false);
    expect(audit.checks).toContainEqual({
      name: 'internal dogfood',
      ok: false,
      detail: 'not acknowledged',
    });
    expect(audit.checks).toContainEqual({
      name: 'P90 generation latency',
      ok: false,
      detail: 'not acknowledged',
    });
    expect(audit.blockers).toContain(
      'Complete internal dogfood with 5 people for 2 working days and zero P0 bugs before CWS upload; pass --dogfood-passed only after it is recorded.',
    );
    expect(audit.blockers).toContain(
      'Confirm P90 generation latency is under 15s on the deployed server before CWS upload; pass --latency-passed only after metrics confirm it.',
    );
  });

  it('requires recorded dogfood and latency evidence even when manual flags are passed', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      abuseControlPassed: true,
      dogfoodPassed: true,
      latencyPassed: true,
      youtubeDemoUrl: 'https://www.youtube.com/watch?v=abc123XYZ_-',
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
    });

    expect(audit.ok).toBe(false);
    expect(audit.checks).toContainEqual({
      name: 'internal dogfood',
      ok: false,
      detail: 'acknowledged; evidence missing or invalid',
    });
    expect(audit.checks).toContainEqual({
      name: 'P90 generation latency',
      ok: false,
      detail: 'acknowledged; evidence missing or invalid',
    });
    expect(audit.blockers).toContain(
      'Record dogfood evidence in store-assets/launch-evidence.md before CWS upload: status passed, participants >= 5, working days >= 2, P0 bugs 0.',
    );
    expect(audit.blockers).toContain(
      'Record P90 generation latency evidence under 15s in store-assets/launch-evidence.md before CWS upload.',
    );
  });

  it('prints checks and blockers on stdout in deterministic order', async () => {
    const { printAudit } = await loadAudit();
    const originalLog = console.log;
    const originalError = console.error;
    const logs: string[] = [];
    const errors: string[] = [];
    console.log = (...args: unknown[]) => logs.push(args.join(' '));
    console.error = (...args: unknown[]) => errors.push(args.join(' '));
    try {
      printAudit({
        checks: [
          { name: 'release artifacts', ok: true, detail: 'pnpm verify:release passed' },
          { name: 'internal dogfood', ok: false, detail: 'not acknowledged' },
        ],
        blockers: ['Complete internal dogfood before CWS upload.'],
      });
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }

    expect(errors).toEqual([]);
    expect(logs).toEqual([
      'launch audit: ok release artifacts - pnpm verify:release passed',
      'launch audit: fail internal dogfood - not acknowledged',
      'launch audit: blocker Complete internal dogfood before CWS upload.',
    ]);
  });

  it('reports a CWS privacy policy blocker when the public URL is not live', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      smokeResult: { ok: true, results: [] },
      privacyResult: { ok: false, status: 404 },
    });

    expect(audit.checks).toContainEqual({
      name: 'privacy policy',
      ok: false,
      detail: '404',
    });
    expect(audit.blockers).toContain(
      'Fix Chrome Web Store privacy policy URL https://anycap.ai/privacy/extension: 404',
    );
  });

  it('can pass as a pre-CWS upload gate after real E2E is acknowledged', async () => {
    const { buildLaunchAudit } = await loadAudit();

    const audit = buildLaunchAudit({
      releaseErrors: [],
      realE2EPassed: true,
      abuseControlPassed: true,
      smokeResult: {
        ok: true,
        results: [
          { name: 'required features', ok: true, status: 200 },
          { name: 'extension config', ok: true, status: 200 },
          { name: 'web search', ok: true, status: 200 },
          { name: 'web crawl', ok: true, status: 200 },
        ],
      },
      privacyResult: { ok: true, status: 200 },
      youtubeDemoUrl: 'https://www.youtube.com/watch?v=abc123XYZ_-',
      dogfoodPassed: true,
      latencyPassed: true,
      launchEvidenceText: validLaunchEvidence,
    });

    expect(audit.ok).toBe(true);
    expect(audit.blockers).toEqual([]);
  });
});
