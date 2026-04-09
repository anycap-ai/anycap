import { landingMarkdown } from "@/lib/landing-content";

export const runtime = "edge";

function buildHeaders() {
  return new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=3600",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  });
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
