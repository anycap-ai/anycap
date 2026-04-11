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
  "capabilities": ptBrRolloutSeoLocales,
  "capabilities-image-generation": ptBrRolloutSeoLocales,
  "capabilities-image-understanding": ptBrRolloutSeoLocales,
  "capabilities-video-generation": ptBrRolloutSeoLocales,
  "compare": ptBrRolloutSeoLocales,
  "for-claude-code": ptBrRolloutSeoLocales,
  "for-codex": ptBrRolloutSeoLocales,
  "for-cursor": ptBrRolloutSeoLocales,
  "for": ptBrRolloutSeoLocales,
  "pricing": ptBrRolloutSeoLocales,
  "start": ptBrRolloutSeoLocales,
  "guides-install-anycap": ptBrRolloutSeoLocales,
  "learn-what-is-an-ai-influencer": ptBrRolloutSeoLocales,
  "learn-ai-video-generator-from-image": ptBrRolloutSeoLocales,
  "learn-create-ai-influencer-for-free": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencers": ptBrRolloutSeoLocales,
  "learn-how-to-make-ai-influencer-videos": ptBrRolloutSeoLocales,
  "learn-how-to-make-image-transparent": ptBrRolloutSeoLocales,
  "learn-how-to-change-photo-background": ptBrRolloutSeoLocales,
  "learn-how-to-make-background-white-for-product-photos": ptBrRolloutSeoLocales,
  "learn-how-to-remove-people-from-photos": ptBrRolloutSeoLocales,
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
