import { appendAgentNegotiationVary } from "@/lib/agent-request";
import { landingMarkdown } from "@/lib/landing-content";

export const runtime = "edge";

function buildHeaders() {
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });

  appendAgentNegotiationVary(headers);

  return headers;
}

export function GET() {
  return new Response(landingMarkdown, {
    headers: buildHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: buildHeaders(),
  });
}
