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
const ptBrAndIdRolloutSeoLocales = ["en", "pt-br", "id"] as const satisfies readonly SiteLocale[];

export const seoIndexedLocaleCodesByRouteKey = {
  "about": ptBrRolloutSeoLocales,
  "cli": ptBrAndIdRolloutSeoLocales,
  "capabilities": ptBrAndIdRolloutSeoLocales,
  "capabilities-audio-understanding": ptBrRolloutSeoLocales,
  "capabilities-drive": ptBrRolloutSeoLocales,
  "capabilities-grounded-web-search": ptBrRolloutSeoLocales,
  "capabilities-image-generation": ptBrRolloutSeoLocales,
  "capabilities-image-understanding": ptBrRolloutSeoLocales,
  "capabilities-music-generation": ptBrRolloutSeoLocales,
  "capabilities-video-generation": ptBrRolloutSeoLocales,
  "capabilities-web-search": ptBrRolloutSeoLocales,
  "capabilities-web-crawl": ptBrRolloutSeoLocales,
  "compare-anycap-vs-composio": ptBrRolloutSeoLocales,
  "compare-anycap-vs-openai-agent-builder": ptBrRolloutSeoLocales,
  "compare-anycap-vs-openclaw-image-generation": ptBrRolloutSeoLocales,
  "compare-anycap-vs-openclaw-video-generation": ptBrRolloutSeoLocales,
  "compare-anycap-vs-fal-ai": ptBrRolloutSeoLocales,
  "compare-anycap-vs-replicate": ptBrRolloutSeoLocales,
  "compare-fal-ai-alternatives-for-agents": ptBrRolloutSeoLocales,
  "compare-replicate-alternatives-for-agents": ptBrRolloutSeoLocales,
  "compare": ptBrAndIdRolloutSeoLocales,
  "contact": ptBrAndIdRolloutSeoLocales,
  "for-claude-code": ptBrRolloutSeoLocales,
  "for-codex": ptBrRolloutSeoLocales,
  "for-cursor": ptBrRolloutSeoLocales,
  "for": ptBrAndIdRolloutSeoLocales,
  "for-claude-code-image-generation": ptBrAndIdRolloutSeoLocales,
  "for-claude-code-video-generation": ptBrAndIdRolloutSeoLocales,
  "for-manus": ptBrAndIdRolloutSeoLocales,
  "glossary": ptBrRolloutSeoLocales,
  "glossary-agent-capability-runtime": ptBrRolloutSeoLocales,
  "glossary-agent-harness": ptBrRolloutSeoLocales,
  "glossary-context-engineering": ptBrRolloutSeoLocales,
  "guides": ptBrAndIdRolloutSeoLocales,
  "guides-agent-skills-for-developer-tools": ptBrRolloutSeoLocales,
  "pricing": ptBrAndIdRolloutSeoLocales,
  "privacy": ptBrAndIdRolloutSeoLocales,
  "skills": ptBrAndIdRolloutSeoLocales,
  "start": ptBrAndIdRolloutSeoLocales,
  "terms": ptBrAndIdRolloutSeoLocales,
  "guides-install-anycap": ptBrRolloutSeoLocales,
  "guides-add-tools-to-claude-code": ptBrRolloutSeoLocales,
  "guides-context-engineering-for-agents": ptBrRolloutSeoLocales,
  "guides-how-to-add-image-generation-to-ai-agent": ptBrRolloutSeoLocales,
  "guides-how-to-add-video-generation-to-ai-agent": ptBrRolloutSeoLocales,
  "guides-how-to-add-vision-to-ai-agent": ptBrRolloutSeoLocales,
  "guides-mcp-vs-skills": ptBrRolloutSeoLocales,
  "guides-what-is-agent-harness": ptBrRolloutSeoLocales,
  "guides-workspace-context-engineering": ptBrRolloutSeoLocales,
  "learn": ptBrAndIdRolloutSeoLocales,
  "learn-add-multimodal-capabilities-to-saas-chatbot": ptBrRolloutSeoLocales,
  "learn-ai-chatbot-vs-ai-agent-for-saas": ptBrRolloutSeoLocales,
  "learn-what-is-an-ai-influencer": ptBrRolloutSeoLocales,
  "learn-ai-video-generator-from-image": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-claude-code": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-coding-agents": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-cursor": ptBrAndIdRolloutSeoLocales,
  "learn-create-ai-influencer-for-free": ptBrRolloutSeoLocales,
  "learn-easy-memes-to-draw": ptBrRolloutSeoLocales,
  "learn-funny-meme-drawings": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencers": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencer-videos": ptBrRolloutSeoLocales,
  "learn-how-to-make-image-transparent": ptBrRolloutSeoLocales,
  "learn-how-to-make-memes-online": ptBrRolloutSeoLocales,
  "learn-how-to-make-bad-drawing-memes": ptBrRolloutSeoLocales,
  "learn-how-to-change-photo-background": ptBrRolloutSeoLocales,
  "learn-how-to-make-background-white-for-product-photos": ptBrRolloutSeoLocales,
  "learn-how-to-remove-people-from-photos": ptBrRolloutSeoLocales,
  "learn-smart-goal-generator": ptBrRolloutSeoLocales,
  "learn-what-agents-cant-do": ptBrAndIdRolloutSeoLocales,
  "learn-what-is-the-most-advanced-ai": ptBrRolloutSeoLocales,
  "learn-how-to-brighten-a-photo-online": ptBrRolloutSeoLocales,
  "learn-how-to-make-a-photo-into-a-drawing": ptBrRolloutSeoLocales,
  "models": ptBrAndIdRolloutSeoLocales,
  "models-seedream-5": ptBrRolloutSeoLocales,
  "models-nano-banana-pro": ptBrRolloutSeoLocales,
  "models-nano-banana-2": ptBrRolloutSeoLocales,
  "models-veo-3-1": ptBrRolloutSeoLocales,
  "models-kling-3-0": ptBrRolloutSeoLocales,
  "models-seedance-1-5-pro": ptBrRolloutSeoLocales,
  "models-elevenlabs-music": ptBrRolloutSeoLocales,
  "capabilities-video-analysis": ptBrRolloutSeoLocales,
} as const satisfies SeoLocaleRolloutConfig;
