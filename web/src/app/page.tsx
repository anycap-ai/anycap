import type { Metadata } from "next";
import { HumanHomePage } from "@/components/landing/HumanHomePage";
import { createRootMetadata } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return createRootMetadata(defaultLocale);
}

export default function HomePage() {
  return <HumanHomePage />;
}
