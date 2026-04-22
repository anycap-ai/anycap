import { API_BASE } from './constants';
import { getStored } from './storage';
import { classifyError, classifyHttpError } from './errors';

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

async function getHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

export async function fetchExtensionConfig(): Promise<ExtensionConfig> {
  return fetchJson<ExtensionConfig>('/v1/extension/config');
}
