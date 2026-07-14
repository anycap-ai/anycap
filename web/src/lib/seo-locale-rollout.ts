import type { ManualPublicRouteKey, SiteLocale } from "@/lib/site";

/**
 * Centralized SEO locale rollout config.
 *
 * `defaultSeoIndexedLocaleCodes` applies to every public route unless a route
 * key opts into a broader rollout below. Route keys are type-checked against
 * the manually defined public route keys in `site.ts`. If an auto-discovered
 * route needs an explicit rollout override, add it to the manual route catalog
 * first so it has a stable key here.
 */
type SeoLocaleRolloutConfig = Partial<
  Record<ManualPublicRouteKey, readonly SiteLocale[]>
>;

export const defaultSeoIndexedLocaleCodes = ["en"] as const satisfies readonly SiteLocale[];

const ptBrIdAndDeRolloutSeoLocales = ["en", "pt-br", "id", "de"] as const satisfies readonly SiteLocale[];
const ptBrAndIdRolloutSeoLocales = ["en", "pt-br", "id"] as const satisfies readonly SiteLocale[];

// A route may only opt a locale into indexing if that locale renders real
// translated content. When a route has no translation for a locale the page
// falls back to English, which Google folds into the EN canonical
// (DUPLICATE_GOOGLE_CHOSE_DIFFERENT_CANONICAL). Keep this list aligned with the
// actual translation coverage, not aspirational rollout.
//   - `home` / `agent`: only the English surface is translated (landing copy and
//     the agent page are not localized) -> EN only.
//   - `for` / `guides` / `glossary` / `compare` hub *index* pages: German hub
//     copy is missing (see `hubBaseDefinitionsByLocale` in seo/hub-pages.ts), so
//     `/de/{hub}` renders English -> drop `de`. Their leaf pages are translated
//     and keep their own (broader) rollout keys below.
export const seoIndexedLocaleCodesByRouteKey = {
  "home": defaultSeoIndexedLocaleCodes,
  "about": ptBrIdAndDeRolloutSeoLocales,
  "cli": ptBrIdAndDeRolloutSeoLocales,
  "agent": defaultSeoIndexedLocaleCodes,
  "capabilities": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-audio-understanding": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-drive": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-grounded-web-search": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-image-generation": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-image-understanding": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-music-generation": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-video-generation": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-web-search": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-web-crawl": ptBrIdAndDeRolloutSeoLocales,
  "compare-anycap-vs-composio": ptBrIdAndDeRolloutSeoLocales,
  "compare-anycap-vs-openai-agent-builder": ptBrIdAndDeRolloutSeoLocales,
  "compare-anycap-vs-fal-ai": ptBrIdAndDeRolloutSeoLocales,
  "compare-anycap-vs-replicate": ptBrIdAndDeRolloutSeoLocales,
  "compare-fal-ai-alternatives-for-agents": ptBrIdAndDeRolloutSeoLocales,
  "compare-replicate-alternatives-for-agents": ptBrIdAndDeRolloutSeoLocales,
  "compare-claude-opus-4-7-vs-sonnet-4-6": ptBrIdAndDeRolloutSeoLocales,
  "compare": ptBrAndIdRolloutSeoLocales,
  "contact": ptBrIdAndDeRolloutSeoLocales,
  "for-claude-code": ptBrIdAndDeRolloutSeoLocales,
  "for-codex": ptBrIdAndDeRolloutSeoLocales,
  "for-cursor": ptBrIdAndDeRolloutSeoLocales,
  "for": ptBrAndIdRolloutSeoLocales,
  "for-claude-code-image-generation": ptBrIdAndDeRolloutSeoLocales,
  "for-claude-code-opus-4-7": ptBrIdAndDeRolloutSeoLocales,
  "for-claude-code-video-generation": ptBrIdAndDeRolloutSeoLocales,
  "for-manus": ptBrIdAndDeRolloutSeoLocales,
  "glossary": ptBrAndIdRolloutSeoLocales,
  "glossary-agent-harness": ptBrIdAndDeRolloutSeoLocales,
  "glossary-agentic-workflow": ptBrIdAndDeRolloutSeoLocales,
  "guides": ptBrAndIdRolloutSeoLocales,
  "guides-agent-skills-for-developer-tools": ptBrAndIdRolloutSeoLocales,
  "pricing": ptBrIdAndDeRolloutSeoLocales,
  "privacy": ptBrIdAndDeRolloutSeoLocales,
  "skills": ptBrIdAndDeRolloutSeoLocales,
  "start": ptBrIdAndDeRolloutSeoLocales,
  "terms": ptBrIdAndDeRolloutSeoLocales,
  "guides-claude-opus-4-7-image-video-workflow": ptBrIdAndDeRolloutSeoLocales,
  "guides-context-engineering-for-agents": ptBrIdAndDeRolloutSeoLocales,
  "guides-how-to-add-image-generation-to-ai-agent": ptBrIdAndDeRolloutSeoLocales,
  "guides-how-to-add-video-generation-to-ai-agent": ptBrIdAndDeRolloutSeoLocales,
  "guides-how-to-add-vision-to-ai-agent": ptBrIdAndDeRolloutSeoLocales,
  "guides-mcp-vs-skills": ptBrIdAndDeRolloutSeoLocales,
  "guides-what-is-agent-harness": ptBrIdAndDeRolloutSeoLocales,
  "guides-workspace-context-engineering": ptBrIdAndDeRolloutSeoLocales,
  "learn": ptBrIdAndDeRolloutSeoLocales,
  "learn-add-multimodal-capabilities-to-saas-chatbot": ptBrIdAndDeRolloutSeoLocales,
  "learn-claude-opus-4-7-capabilities": ptBrIdAndDeRolloutSeoLocales,
  "learn-best-ai-for-cursor": ptBrIdAndDeRolloutSeoLocales,
  "guides-install-anycap": ptBrIdAndDeRolloutSeoLocales,
  "learn-what-agents-cant-do": ptBrIdAndDeRolloutSeoLocales,
  "learn-what-is-the-most-advanced-ai": ptBrIdAndDeRolloutSeoLocales,
  "models": ptBrIdAndDeRolloutSeoLocales,
  "models-seedream-5": ptBrIdAndDeRolloutSeoLocales,
  "models-nano-banana-pro": ptBrIdAndDeRolloutSeoLocales,
  "models-nano-banana-2": ptBrIdAndDeRolloutSeoLocales,
  "models-veo-3-1": ptBrIdAndDeRolloutSeoLocales,
  "models-kling-3-0": ptBrIdAndDeRolloutSeoLocales,
  "models-seedance-1-5-pro": ptBrIdAndDeRolloutSeoLocales,
  "models-elevenlabs-music": ptBrIdAndDeRolloutSeoLocales,
  "models-gemini-omni-flash-preview": ptBrIdAndDeRolloutSeoLocales,
  "capabilities-video-analysis": ptBrIdAndDeRolloutSeoLocales,
  "for-gemini-cli": ptBrIdAndDeRolloutSeoLocales,
} as const satisfies SeoLocaleRolloutConfig;
