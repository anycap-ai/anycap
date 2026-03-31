import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { getRequestLocale } from "@/lib/request-locale";
import { localizePublicPath } from "@/lib/site";

type LocalizedLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof LinkProps>;

export async function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = await getRequestLocale();
  const localizedHref =
    typeof href === "string" ? localizePublicPath(locale, href) : href;

  return <Link href={localizedHref} {...props} />;
}
