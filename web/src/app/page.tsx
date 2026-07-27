import type { Metadata } from "next";
import {
  HumanHomePage,
  type HomeHeroVariant,
} from "@/components/landing/HumanHomePage";
import { createRootMetadata } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  return createRootMetadata(defaultLocale);
}

type HomePageProps = {
  searchParams: Promise<{ hero?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { hero } = await searchParams;
  const heroVariant: HomeHeroVariant = hero === "terminal" ? "terminal" : "robot";

  return <HumanHomePage heroVariant={heroVariant} />;
}
