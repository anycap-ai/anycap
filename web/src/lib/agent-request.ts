const aiAgentUserAgentTokens = [
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "claudebot",
  "perplexitybot",
  "anthropic-ai",
] as const;

const searchEngineUserAgentTokens = [
  "googlebot",
  "bingbot",
  "applebot",
  "duckduckbot",
  "slurp",
  "baiduspider",
  "yandexbot",
] as const;

const programmaticClientTokens = [
  "curl/",
  "wget/",
  "go-http-client/",
  "python-requests/",
  "python-urllib/",
  "axios/",
  "undici",
  "node",
  "okhttp/",
  "java/",
] as const;

const browserUserAgentTokens = [
  "mozilla/",
  "chrome/",
  "safari/",
  "firefox/",
  "edg/",
  "opr/",
] as const;

const markdownAcceptTokens = [
  "text/markdown",
  "text/x-markdown",
  "text/plain",
] as const;

function normalizeHeaderValue(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function matchesAnyToken(value: string, tokens: readonly string[]) {
  return tokens.some((token) => value.includes(token));
}

function acceptsMarkdown(acceptHeader: string) {
  return matchesAnyToken(acceptHeader, markdownAcceptTokens);
}

function acceptsHtml(acceptHeader: string) {
  return acceptHeader.includes("text/html") || acceptHeader.includes("application/xhtml+xml");
}

export function isAgentNegotiationPath(pathname: string) {
  return pathname === "/" || pathname === "/agent";
}

function isKnownSearchEngineCrawler(userAgent: string | null | undefined) {
  const normalized = normalizeHeaderValue(userAgent);
  if (!normalized) {
    return false;
  }
  return matchesAnyToken(normalized, searchEngineUserAgentTokens);
}

function isKnownAiAgent(userAgent: string | null | undefined) {
  const normalized = normalizeHeaderValue(userAgent);
  if (!normalized) {
    return false;
  }
  return matchesAnyToken(normalized, aiAgentUserAgentTokens);
}

function isProgrammaticClient(userAgent: string | null | undefined) {
  const normalized = normalizeHeaderValue(userAgent);
  if (!normalized) {
    return false;
  }
  if (matchesAnyToken(normalized, browserUserAgentTokens)) {
    return false;
  }
  return matchesAnyToken(normalized, programmaticClientTokens);
}

export function shouldServeAgentMarkdown({
  pathname,
  searchParams,
  userAgent,
  accept,
}: {
  pathname: string;
  searchParams: URLSearchParams;
  userAgent: string | null | undefined;
  accept: string | null | undefined;
}) {
  if (!isAgentNegotiationPath(pathname)) {
    return false;
  }

  const view = normalizeHeaderValue(searchParams.get("view"));
  const format = normalizeHeaderValue(searchParams.get("format"));
  if (view === "human" || format === "html") {
    return false;
  }
  if (view === "agent" || format === "markdown" || format === "md") {
    return true;
  }

  const normalizedAccept = normalizeHeaderValue(accept);

  if (isKnownSearchEngineCrawler(userAgent)) {
    return acceptsMarkdown(normalizedAccept);
  }

  if (acceptsMarkdown(normalizedAccept)) {
    return true;
  }

  if (isKnownAiAgent(userAgent)) {
    return true;
  }

  // Generic programmatic clients such as curl or request libraries should not be
  // auto-rewritten to markdown unless they explicitly negotiate for markdown.
  // This keeps homepage audits and generic crawlers on the human HTML version
  // while preserving `/llms.txt`, `?view=agent`, and markdown Accept opt-ins.
  return false;
}

export function appendAgentNegotiationVary(headers: Headers) {
  const existing = headers.get("Vary");
  const values = new Set(
    (existing ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  values.add("Accept");
  values.add("User-Agent");

  headers.set("Vary", Array.from(values).join(", "));
}
