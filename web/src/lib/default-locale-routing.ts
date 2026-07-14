type InternalDefaultLocaleRewriteInput = {
  locale: string | null;
  defaultLocale: string;
  forwardedLocale: string | null;
  forwardedPathname: string | null;
  pathname: string;
};

export function isInternalDefaultLocaleRewrite({
  locale,
  defaultLocale,
  forwardedLocale,
  forwardedPathname,
  pathname,
}: InternalDefaultLocaleRewriteInput): boolean {
  return (
    locale === defaultLocale &&
    forwardedLocale === defaultLocale &&
    forwardedPathname === pathname
  );
}
