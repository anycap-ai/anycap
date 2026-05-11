import { API_BASE, MOCK_MODE } from './constants';
import { getStored } from './storage';
import { classifyError, classifyHttpError, AnyCapError, isOffline } from './errors';
import {
  generateVariationMock,
  fetchExtensionConfigMock,
  generateImageMock,
  generateVideoMock,
  generateMusicMock,
  searchWebMock,
  crawlPageMock,
} from './api-mock';

export type GenerateRequest = {
  prompt: string;
  model: string;
  images: string[];
  watermark?: boolean;
};

export type GenerateResult = {
  id: string;
  status: string;
  model: string;
  outputs: Array<{ type: string; url: string; mime_type: string }>;
  usage?: Record<string, unknown>;
  credit_cost?: number;
};

export type ExtensionConfig = {
  default_prompt: string;
  default_model: string;
  min_image_dim: number;
};

export type GenerateImageRequest = {
  prompt: string;
  model: string;
  aspectRatio?: string;
};

export type GenerateVideoRequest = {
  prompt: string;
  model: string;
  durationSeconds?: number;
  aspectRatio?: string;
};

export type GenerateVideoResult = {
  id: string;
  status: string;
  model: string;
  outputs: Array<{ type: string; url: string; mime_type: string; poster?: string }>;
};

export type GenerateMusicRequest = {
  prompt: string;
  model: string;
  durationSeconds?: number;
};

export type GenerateMusicResult = {
  id: string;
  status: string;
  model: string;
  outputs: Array<{ type: string; url: string; mime_type: string; duration_seconds?: number }>;
};

export type SearchWebRequest = {
  query: string;
  topK?: number;
};

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  description?: string;
  source?: string;
};

export type SearchWebResult = {
  query: string;
  results: SearchResult[];
};

export type CrawlPageRequest = {
  url: string;
};

export type CrawlPageResult = {
  url: string;
  title: string;
  summary: string;
  markdown: string;
  word_count: number;
  language: string;
};

async function getHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Anycap-Source': 'chrome-extension',
  };
  const token = await getStored('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const { getOrCreateInstallId } = await import('./install-id');
    headers['X-Anycap-Install-Id'] = await getOrCreateInstallId();
  }
  return headers;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (isOffline()) {
    throw classifyError(new Error('offline'));
  }
  const url = `${API_BASE}${path}`;
  const headers = await getHeaders();
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init?.headers || {}) },
    });
  } catch (err) {
    throw classifyError(err);
  }

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw classifyHttpError(res.status, body?.error);
  }

  if (body.status === 'error') {
    throw classifyHttpError(res.status, body.error);
  }

  return body.data as T;
}

export async function generateVariation(req: GenerateRequest): Promise<GenerateResult> {
  if (MOCK_MODE) return generateVariationMock(req);
  return fetchJson<GenerateResult>('/v1/image/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: req.prompt,
      model: req.model,
      images: req.images,
      watermark: req.watermark,
    }),
  });
}

export async function generateImage(req: GenerateImageRequest): Promise<GenerateResult> {
  if (MOCK_MODE) return generateImageMock(req);
  return fetchJson<GenerateResult>('/v1/image/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt: req.prompt, model: req.model, aspect_ratio: req.aspectRatio }),
  });
}

export async function generateVideo(req: GenerateVideoRequest): Promise<GenerateVideoResult> {
  if (MOCK_MODE) return generateVideoMock(req);
  return fetchJson<GenerateVideoResult>('/v1/video/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: req.prompt,
      model: req.model,
      duration_seconds: req.durationSeconds,
      aspect_ratio: req.aspectRatio,
    }),
  });
}

export async function generateMusic(req: GenerateMusicRequest): Promise<GenerateMusicResult> {
  if (MOCK_MODE) return generateMusicMock(req);
  return fetchJson<GenerateMusicResult>('/v1/music/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: req.prompt,
      model: req.model,
      duration_seconds: req.durationSeconds,
    }),
  });
}

export async function searchWeb(req: SearchWebRequest): Promise<SearchWebResult> {
  if (MOCK_MODE) return searchWebMock(req);
  const data = await fetchJson<SearchWebResult>('/v1/web/search', {
    method: 'POST',
    body: JSON.stringify({ query: req.query, max_results: req.topK ?? 8, crawl_results: 0 }),
  });
  return {
    ...data,
    results: data.results.map((result) => ({
      ...result,
      snippet: result.snippet ?? result.description ?? '',
    })),
  };
}

export async function crawlPage(req: CrawlPageRequest): Promise<CrawlPageResult> {
  if (MOCK_MODE) return crawlPageMock(req);
  return fetchJson<CrawlPageResult>('/v1/web/crawl', {
    method: 'POST',
    body: JSON.stringify({ url: req.url }),
  });
}

const EXTENSION_CONFIG_CACHE_KEY = 'extensionConfigCache';
const EXTENSION_CONFIG_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

type ConfigCache =
  | { status: 'ok'; data: ExtensionConfig; expiresAt: number }
  | { status: 'unavailable'; expiresAt: number };

async function readConfigCache(): Promise<ConfigCache | null> {
  try {
    const got = await chrome.storage.local?.get([EXTENSION_CONFIG_CACHE_KEY]);
    const entry = got?.[EXTENSION_CONFIG_CACHE_KEY] as ConfigCache | undefined;
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) return null;
    return entry;
  } catch {
    return null;
  }
}

async function writeConfigCache(entry: ConfigCache): Promise<void> {
  try {
    await chrome.storage.local?.set({ [EXTENSION_CONFIG_CACHE_KEY]: entry });
  } catch {
    // best-effort cache; ignore failures
  }
}

export async function fetchExtensionConfig(): Promise<ExtensionConfig | null> {
  if (MOCK_MODE) return fetchExtensionConfigMock();
  // Cache the result (success or 404) in chrome.storage.local with a 24h TTL.
  // Without this, every popup open hits /v1/extension/config — and if prod
  // hasn't deployed the route yet, every open logs a 404 in DevTools.
  const cached = await readConfigCache();
  if (cached?.status === 'ok') return cached.data;
  if (cached?.status === 'unavailable') return null;

  try {
    const data = await fetchJson<ExtensionConfig>('/v1/extension/config');
    await writeConfigCache({
      status: 'ok',
      data,
      expiresAt: Date.now() + EXTENSION_CONFIG_CACHE_TTL_MS,
    });
    return data;
  } catch (err) {
    const status = err instanceof AnyCapError ? err.status : undefined;
    // Treat 404 (endpoint not deployed) as "use defaults"; cache the negative
    // result so we don't retry every popup open for the next 24h.
    if (status === 404) {
      await writeConfigCache({
        status: 'unavailable',
        expiresAt: Date.now() + EXTENSION_CONFIG_CACHE_TTL_MS,
      });
      return null;
    }
    throw err;
  }
}
