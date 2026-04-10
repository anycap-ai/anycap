import llmsContent from "@/content/llms";

export const runtime = "edge";

function buildHeaders() {
  return new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=3600",
    "X-Content-Type-Options": "nosniff",
  });
}

export function GET() {
  return new Response(llmsContent, {
    headers: buildHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: buildHeaders(),
  });
}
