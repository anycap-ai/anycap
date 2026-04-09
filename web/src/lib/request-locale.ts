import { headers } from "next/headers";
import {
  defaultLocale,
  getLocaleFromHeader,
  localeHeaderName,
  getLocaleConfig,
  requestPathnameHeaderName,
  type SiteLocale,
} from "@/lib/site";

export async function getRequestLocale(): Promise<SiteLocale> {
  const headerStore = await headers();
  return getLocaleFromHeader(headerStore.get(localeHeaderName));
}

export async function getRequestHtmlLang(): Promise<string> {
  const locale = await getRequestLocale();
  return getLocaleConfig(locale).htmlLang;
}

export async function getRequestPathname(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get(requestPathnameHeaderName) ?? "/";
}
