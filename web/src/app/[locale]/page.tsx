import {
  HumanHomePage,
  type HomeHeroVariant,
} from "@/components/landing/HumanHomePage";
import { createRootMetadata } from "@/lib/localized-metadata";
import { isSupportedLocale } from "@/lib/site";
import { notFound } from "next/navigation";

export const runtime = "edge";

type LocalizedHomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hero?: string }>;
};

export async function generateMetadata({ params }: LocalizedHomePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  return createRootMetadata(locale);
}

export default async function LocalizedHomePage({
  params,
  searchParams,
}: LocalizedHomePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const { hero } = await searchParams;
  const heroVariant: HomeHeroVariant = hero === "terminal" ? "terminal" : "robot";

  return <HumanHomePage heroVariant={heroVariant} />;
}
