import type { Metadata } from "next";
import { createForHumanMetadata } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { ForHumanShell } from "@/components/layout/ForHumanShell";

export const runtime = "edge";

export const metadata: Metadata = createForHumanMetadata(defaultLocale);

export default function ForHumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ForHumanShell>{children}</ForHumanShell>;
}
