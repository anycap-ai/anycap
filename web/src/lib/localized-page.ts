import type { Metadata } from "next";
import {
  createLocalizedMetadata,
  createLocalizedMetadataForPath,
} from "@/lib/localized-metadata";
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

export async function generateLocalizedPageMetadataForPath(
  paramsPromise: Promise<{ locale: string }>,
  pathname: string,
  metadata: Metadata
): Promise<Metadata> {
  const locale = await getValidatedLocale(paramsPromise);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(locale, pathname, metadata);
}
