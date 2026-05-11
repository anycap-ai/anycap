#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_BASE_URL = 'https://api.anycap.ai';
const DEFAULT_INSTALL_ID = `smoke-${Date.now()}`;
const REQUIRED_FEATURES = ['image.generate', 'video.generate', 'music.generate', 'web.search', 'web.crawl'];

function normalizeBaseURL(baseUrl) {
  const trimmed = String(baseUrl || '').trim() || DEFAULT_BASE_URL;
  return trimmed.replace(/\/+$/, '');
}

function extensionHeaders(installId, hasBody) {
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    'X-Anycap-Source': 'chrome-extension',
    'X-Anycap-Install-Id': installId,
  };
}

function readError(body) {
  const err = body?.error;
  if (!err || typeof err !== 'object') return {};
  return {
    code: typeof err.code === 'string' ? err.code : undefined,
    message: typeof err.message === 'string' ? err.message : undefined,
    hint: typeof err.hint === 'string' ? err.hint : undefined,
  };
}

async function runCheck(fetchImpl, baseUrl, installId, check) {
  const hasBody = check.body !== undefined;
  let response;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetchImpl(`${baseUrl}${check.path}`, {
        method: check.method,
        headers: extensionHeaders(installId, hasBody),
        ...(hasBody ? { body: JSON.stringify(check.body) } : {}),
      });
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!response) {
    return {
      name: check.name,
      ok: false,
      status: 0,
      message: lastError instanceof Error ? lastError.message : String(lastError),
    };
  }

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  const serverError = readError(body);
  const validationError = response.ok && body?.status !== 'error' ? check.validateBody?.(body) : undefined;
  return {
    name: check.name,
    ok: response.ok && body?.status !== 'error' && !validationError,
    status: response.status,
    ...(validationError || serverError),
  };
}

function validateRequiredFeatures(body) {
  const features = body?.data?.features;
  if (!features || typeof features !== 'object') {
    return {
      code: 'FEATURES_MISSING',
      message: `disabled or missing features: ${REQUIRED_FEATURES.join(', ')}`,
    };
  }

  const missing = REQUIRED_FEATURES.filter((feature) => features[feature] !== true);
  if (missing.length === 0) return undefined;

  return {
    code: 'FEATURES_MISSING',
    message: `disabled or missing features: ${missing.join(', ')}`,
  };
}

function validateExtensionConfig(body) {
  const data = body?.data;
  if (
    !data ||
    typeof data.default_prompt !== 'string' ||
    typeof data.default_model !== 'string' ||
    typeof data.min_image_dim !== 'number'
  ) {
    return {
      code: 'EXTENSION_CONFIG_INVALID',
      message: 'extension config must include default_prompt, default_model, and min_image_dim',
    };
  }
  return undefined;
}

function validateWebSearch(body) {
  const data = body?.data;
  const first = Array.isArray(data?.results) ? data.results[0] : undefined;
  if (
    !data ||
    typeof data.query !== 'string' ||
    !Array.isArray(data.results) ||
    (first && (typeof first.title !== 'string' || typeof first.url !== 'string' || typeof first.description !== 'string'))
  ) {
    return {
      code: 'WEB_SEARCH_INVALID',
      message: 'web search must return query and results with title, url, and description',
    };
  }
  return undefined;
}

function validateWebCrawl(body) {
  const data = body?.data;
  if (!data || typeof data.url !== 'string' || typeof data.title !== 'string' || typeof data.markdown !== 'string') {
    return {
      code: 'WEB_CRAWL_INVALID',
      message: 'web crawl must return url, title, and markdown',
    };
  }
  return undefined;
}

export async function runServerSmoke({
  baseUrl = DEFAULT_BASE_URL,
  installId = DEFAULT_INSTALL_ID,
  includeImage = false,
  includeMedia = false,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is not available; use Node 18+ or pass fetchImpl');
  }

  const normalizedBase = normalizeBaseURL(baseUrl);
  const checks = [
    {
      name: 'required features',
      method: 'GET',
      path: '/v1/features',
      validateBody: validateRequiredFeatures,
    },
    { name: 'extension config', method: 'GET', path: '/v1/extension/config', validateBody: validateExtensionConfig },
  ];

  if (!includeMedia) {
    checks.push(
      {
        name: 'web search',
        method: 'POST',
        path: '/v1/web/search',
        body: { query: 'AnyCap', max_results: 4, crawl_results: 0 },
        validateBody: validateWebSearch,
      },
      {
        name: 'web crawl',
        method: 'POST',
        path: '/v1/web/crawl',
        body: { url: 'https://example.com/' },
        validateBody: validateWebCrawl,
      },
    );
  }

  if (includeImage || includeMedia) {
    checks.push({
      name: 'image generate',
      method: 'POST',
      path: '/v1/image/generate',
      body: {
        prompt: 'AnyCap Chrome extension server smoke test',
        model: 'nano-banana-2',
        images: ['https://placehold.co/512.png'],
        watermark: true,
      },
    });
  }
  if (includeMedia) {
    checks.push(
      {
        name: 'video generate',
        method: 'POST',
        path: '/v1/video/generate',
        body: {
          prompt: 'AnyCap Chrome extension server smoke test video',
          model: 'veo-3.1-fast',
          duration_seconds: 4,
          aspect_ratio: '16:9',
        },
      },
      {
        name: 'music generate',
        method: 'POST',
        path: '/v1/music/generate',
        body: {
          prompt: 'AnyCap Chrome extension server smoke test music',
          model: 'music-1.5',
          duration_seconds: 10,
        },
      },
    );
  }

  const results = [];
  for (const check of checks) {
    results.push(await runCheck(fetchImpl, normalizedBase, installId, check));
  }
  return { ok: results.every((result) => result.ok), target: { baseUrl: normalizedBase, installId }, results };
}

function parseArgs(argv) {
  const parsed = {
    baseUrl: process.env.ANYCAP_API_BASE || process.env.WXT_API_BASE || DEFAULT_BASE_URL,
    installId: process.env.ANYCAP_INSTALL_ID || DEFAULT_INSTALL_ID,
    includeImage: false,
    includeMedia: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base-url') {
      parsed.baseUrl = argv[++i] || parsed.baseUrl;
    } else if (arg === '--install-id') {
      parsed.installId = argv[++i] || parsed.installId;
    } else if (arg === '--include-image') {
      parsed.includeImage = true;
    } else if (arg === '--include-media') {
      parsed.includeMedia = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    }
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: pnpm smoke:server [--base-url URL] [--install-id ID] [--include-image] [--include-media]

Runs browser-free anonymous Chrome extension smoke checks against an AnyCap server.

Default checks:
  GET  /v1/features
  GET  /v1/extension/config
  POST /v1/web/search
  POST /v1/web/crawl

Optional:
  --include-image  also POST /v1/image/generate, which may consume provider quota
  --include-media  POST /v1/image/generate, /v1/video/generate, and /v1/music/generate
                   instead of web search/crawl, staying within the 3-run anonymous trial

Environment:
  ANYCAP_API_BASE   default server URL
  WXT_API_BASE      fallback server URL
  ANYCAP_INSTALL_ID anonymous install ID used for trial accounting`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const result = await runServerSmoke(args);
  console.log(`server smoke: ok target - base-url=${result.target.baseUrl} install-id=${result.target.installId}`);
  for (const item of result.results) {
    const status = item.status || 'network';
    if (item.ok) {
      console.log(`server smoke: ok ${item.name} (${status})`);
    } else {
      const detail = [item.code, item.message, item.hint].filter(Boolean).join(' - ');
      console.error(`server smoke: fail ${item.name} (${status})${detail ? ` ${detail}` : ''}`);
    }
  }
  if (!result.ok) {
    process.exit(1);
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((err) => {
    console.error(`server smoke: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
