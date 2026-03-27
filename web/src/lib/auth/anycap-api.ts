type APIEnvelope<T> = {
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

type PostOptions = {
  bearerToken?: string;
};

function anycapAPIBaseURL(): string {
  return (
    process.env.ANYCAP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:18080"
  );
}

function withAbsolutePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${anycapAPIBaseURL().replace(/\/+$/, "")}${path}`;
}

export async function anycapPost<T>(
  path: string,
  body: Record<string, unknown>,
  options: PostOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.bearerToken) {
    headers.Authorization = `Bearer ${options.bearerToken}`;
  }

  const response = await fetch(withAbsolutePath(path), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

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
