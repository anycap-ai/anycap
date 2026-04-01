import { landingMarkdown } from "@/lib/landing-content";

export const runtime = "edge";

export function GET() {
  return new Response(landingMarkdown, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
