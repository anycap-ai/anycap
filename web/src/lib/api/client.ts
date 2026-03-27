type APIEnvelope<T> = {
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

type RequestOptions = {
  apiKey?: string;
};

function baseURL(): string {
  return process.env.NEXT_PUBLIC_ANYCAP_API_URL || "http://127.0.0.1:8080";
}

function withPath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${baseURL().replace(/\/+$/, "")}${path}`;
}

function authHeaders(apiKey?: string): Record<string, string> {
  const h: Record<string, string> = {};
  if (apiKey) h.Authorization = `Bearer ${apiKey}`;
  return h;
}

async function unwrap<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as APIEnvelope<T>;
  if (!response.ok || !json.data) {
    const code = json.error?.code || "";
    const message = json.error?.message || `request failed (${response.status})`;
    const err = new Error(message);
    (err as any).status = response.status;
    (err as any).code = code;
    throw err;
  }
  return json.data;
}

export async function anycapGet<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(withPath(path), {
    method: "GET",
    headers: authHeaders(options.apiKey),
    cache: "no-store",
  });
  return unwrap<T>(response);
}

export async function anycapPost<T>(
  path: string,
  body: Record<string, unknown>,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(withPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(options.apiKey) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return unwrap<T>(response);
}

/** SWR fetcher factory — pass apiKey, get a fetcher for GET requests */
export function createFetcher(apiKey: string) {
  return <T>(path: string) => anycapGet<T>(path, { apiKey });
}
