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

const ptBrRolloutSeoLocales = ["en", "pt-br"] as const satisfies readonly SiteLocale[];

export const seoIndexedLocaleCodesByRouteKey = {
  "about": ptBrRolloutSeoLocales,
  "capabilities": ptBrRolloutSeoLocales,
  "capabilities-image-generation": ptBrRolloutSeoLocales,
  "capabilities-image-understanding": ptBrRolloutSeoLocales,
  "capabilities-video-generation": ptBrRolloutSeoLocales,
  "capabilities-web-search": ptBrRolloutSeoLocales,
  "cli": ptBrRolloutSeoLocales,
  "compare-anycap-vs-openai-agent-builder": ptBrRolloutSeoLocales,
  "compare-anycap-vs-fal-ai": ptBrRolloutSeoLocales,
  "compare-anycap-vs-replicate": ptBrRolloutSeoLocales,
  "compare": ptBrRolloutSeoLocales,
  "contact": ptBrRolloutSeoLocales,
  "for-claude-code": ptBrRolloutSeoLocales,
  "for-codex": ptBrRolloutSeoLocales,
  "for-cursor": ptBrRolloutSeoLocales,
  "for": ptBrRolloutSeoLocales,
  "glossary": ptBrRolloutSeoLocales,
  "glossary-agent-capability-runtime": ptBrRolloutSeoLocales,
  "guides": ptBrRolloutSeoLocales,
  "pricing": ptBrRolloutSeoLocales,
  "privacy": ptBrRolloutSeoLocales,
  "skills": ptBrRolloutSeoLocales,
  "start": ptBrRolloutSeoLocales,
  "terms": ptBrRolloutSeoLocales,
  "guides-install-anycap": ptBrRolloutSeoLocales,
  "guides-mcp-vs-skills": ptBrRolloutSeoLocales,
  "learn": ptBrRolloutSeoLocales,
  "learn-ai-chatbot-vs-ai-agent-for-saas": ptBrRolloutSeoLocales,
  "learn-what-is-an-ai-influencer": ptBrRolloutSeoLocales,
  "learn-ai-video-generator-from-image": ptBrRolloutSeoLocales,
  "learn-best-ai-for-claude-code": ptBrRolloutSeoLocales,
  "learn-best-ai-for-coding-agents": ptBrRolloutSeoLocales,
  "learn-best-ai-for-cursor": ptBrRolloutSeoLocales,
  "learn-create-ai-influencer-for-free": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencers": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencer-videos": ptBrRolloutSeoLocales,
  "learn-how-to-make-image-transparent": ptBrRolloutSeoLocales,
  "learn-how-to-change-photo-background": ptBrRolloutSeoLocales,
  "learn-how-to-make-background-white-for-product-photos": ptBrRolloutSeoLocales,
  "learn-how-to-remove-people-from-photos": ptBrRolloutSeoLocales,
  "learn-what-agents-cant-do": ptBrRolloutSeoLocales,
  "learn-what-is-the-most-advanced-ai": ptBrRolloutSeoLocales,
  "learn-how-to-brighten-a-photo-online": ptBrRolloutSeoLocales,
  "learn-how-to-make-a-photo-into-a-drawing": ptBrRolloutSeoLocales,
  "models-seedream-5": ptBrRolloutSeoLocales,
  "models-nano-banana-pro": ptBrRolloutSeoLocales,
  "models-nano-banana-2": ptBrRolloutSeoLocales,
  "models-veo-3-1": ptBrRolloutSeoLocales,
  "models-kling-3-0": ptBrRolloutSeoLocales,
  "models-seedance-1-5-pro": ptBrRolloutSeoLocales,
  "models-elevenlabs-music": ptBrRolloutSeoLocales,
} as const satisfies SeoLocaleRolloutConfig;
