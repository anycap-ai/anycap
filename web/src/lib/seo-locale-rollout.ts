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
  "about": ptBrAndIdRolloutSeoLocales,
  "cli": ptBrAndIdRolloutSeoLocales,
  "capabilities": ptBrAndIdRolloutSeoLocales,
  "capabilities-audio-understanding": ptBrAndIdRolloutSeoLocales,
  "capabilities-drive": ptBrAndIdRolloutSeoLocales,
  "capabilities-grounded-web-search": ptBrAndIdRolloutSeoLocales,
  "capabilities-image-generation": ptBrAndIdRolloutSeoLocales,
  "capabilities-image-understanding": ptBrAndIdRolloutSeoLocales,
  "capabilities-music-generation": ptBrAndIdRolloutSeoLocales,
  "capabilities-video-generation": ptBrAndIdRolloutSeoLocales,
  "capabilities-web-search": ptBrAndIdRolloutSeoLocales,
  "capabilities-web-crawl": ptBrAndIdRolloutSeoLocales,
  "compare-anycap-vs-composio": ptBrAndIdRolloutSeoLocales,
  "compare-anycap-vs-openai-agent-builder": ptBrAndIdRolloutSeoLocales,
  "compare-anycap-vs-openclaw-image-generation": ptBrRolloutSeoLocales,
  "compare-anycap-vs-openclaw-video-generation": ptBrRolloutSeoLocales,
  "compare-anycap-vs-fal-ai": ptBrAndIdRolloutSeoLocales,
  "compare-anycap-vs-replicate": ptBrAndIdRolloutSeoLocales,
  "compare-fal-ai-alternatives-for-agents": ptBrAndIdRolloutSeoLocales,
  "compare-replicate-alternatives-for-agents": ptBrAndIdRolloutSeoLocales,
  "compare": ptBrAndIdRolloutSeoLocales,
  "contact": ptBrAndIdRolloutSeoLocales,
  "for-claude-code": ptBrAndIdRolloutSeoLocales,
  "for-codex": ptBrAndIdRolloutSeoLocales,
  "for-cursor": ptBrAndIdRolloutSeoLocales,
  "for": ptBrAndIdRolloutSeoLocales,
  "for-claude-code-image-generation": ptBrAndIdRolloutSeoLocales,
  "for-claude-code-video-generation": ptBrAndIdRolloutSeoLocales,
  "for-manus": ptBrAndIdRolloutSeoLocales,
  "glossary": ptBrAndIdRolloutSeoLocales,
  "glossary-agent-capability-runtime": ptBrAndIdRolloutSeoLocales,
  "glossary-agent-harness": ptBrAndIdRolloutSeoLocales,
  "glossary-context-engineering": ptBrAndIdRolloutSeoLocales,
  "guides": ptBrAndIdRolloutSeoLocales,
  "guides-agent-skills-for-developer-tools": ptBrAndIdRolloutSeoLocales,
  "pricing": ptBrAndIdRolloutSeoLocales,
  "privacy": ptBrAndIdRolloutSeoLocales,
  "skills": ptBrAndIdRolloutSeoLocales,
  "start": ptBrAndIdRolloutSeoLocales,
  "terms": ptBrAndIdRolloutSeoLocales,
  "guides-install-anycap": ptBrAndIdRolloutSeoLocales,
  "guides-add-tools-to-claude-code": ptBrAndIdRolloutSeoLocales,
  "guides-context-engineering-for-agents": ptBrAndIdRolloutSeoLocales,
  "guides-how-to-add-image-generation-to-ai-agent": ptBrAndIdRolloutSeoLocales,
  "guides-how-to-add-video-generation-to-ai-agent": ptBrAndIdRolloutSeoLocales,
  "guides-how-to-add-vision-to-ai-agent": ptBrAndIdRolloutSeoLocales,
  "guides-mcp-vs-skills": ptBrAndIdRolloutSeoLocales,
  "guides-what-is-agent-harness": ptBrAndIdRolloutSeoLocales,
  "guides-workspace-context-engineering": ptBrAndIdRolloutSeoLocales,
  "learn": ptBrAndIdRolloutSeoLocales,
  "learn-add-multimodal-capabilities-to-saas-chatbot": ptBrAndIdRolloutSeoLocales,
  "learn-ai-chatbot-vs-ai-agent-for-saas": ptBrAndIdRolloutSeoLocales,
  "learn-what-is-an-ai-influencer": ptBrAndIdRolloutSeoLocales,
  "learn-ai-video-generator-from-image": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-claude-code": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-coding-agents": ptBrAndIdRolloutSeoLocales,
  "learn-best-ai-for-cursor": ptBrAndIdRolloutSeoLocales,
  "learn-create-ai-influencer-for-free": ptBrAndIdRolloutSeoLocales,
  "learn-easy-memes-to-draw": ptBrRolloutSeoLocales,
  "learn-funny-meme-drawings": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencers": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-make-ai-influencer-videos": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-make-image-transparent": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-make-memes-online": ptBrRolloutSeoLocales,
  "learn-how-to-make-bad-drawing-memes": ptBrRolloutSeoLocales,
  "learn-how-to-change-photo-background": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-make-background-white-for-product-photos": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-remove-people-from-photos": ptBrAndIdRolloutSeoLocales,
  "learn-smart-goal-generator": ptBrAndIdRolloutSeoLocales,
  "learn-what-agents-cant-do": ptBrAndIdRolloutSeoLocales,
  "learn-what-is-the-most-advanced-ai": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-brighten-a-photo-online": ptBrAndIdRolloutSeoLocales,
  "learn-how-to-make-a-photo-into-a-drawing": ptBrAndIdRolloutSeoLocales,
  "models": ptBrAndIdRolloutSeoLocales,
  "models-seedream-5": ptBrAndIdRolloutSeoLocales,
  "models-nano-banana-pro": ptBrAndIdRolloutSeoLocales,
  "models-nano-banana-2": ptBrAndIdRolloutSeoLocales,
  "models-veo-3-1": ptBrAndIdRolloutSeoLocales,
  "models-kling-3-0": ptBrAndIdRolloutSeoLocales,
  "models-seedance-1-5-pro": ptBrAndIdRolloutSeoLocales,
  "models-elevenlabs-music": ptBrAndIdRolloutSeoLocales,
  "capabilities-video-analysis": ptBrAndIdRolloutSeoLocales,
} as const satisfies SeoLocaleRolloutConfig;
