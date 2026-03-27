import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/localized-metadata";
import { isSupportedLocale, type PublicRouteKey, type SiteLocale } from "@/lib/site";

export type LocalePageParams = {
  params: Promise<{ locale: string }>;
};

export async function getValidatedLocale(
  paramsPromise: Promise<{ locale: string }>
): Promise<SiteLocale | null> {
  const { locale } = await paramsPromise;
  if (!isSupportedLocale(locale)) {
    return null;
  }

  return locale;
}

export async function generateLocalizedPageMetadata(
  paramsPromise: Promise<{ locale: string }>,
  routeKey: PublicRouteKey,
  metadata: Metadata
): Promise<Metadata> {
  const locale = await getValidatedLocale(paramsPromise);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadata(locale, routeKey, metadata);
}
