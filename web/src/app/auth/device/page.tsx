"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";
import { normalizeUserCode } from "@/lib/auth/session";
import { DeviceCodeForm } from "./DeviceCodeForm";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

function DevicePageInner() {
  const searchParams = useSearchParams();
  const initialCode = normalizeUserCode(searchParams.get("code"));
  const urlError =
    searchParams.get("error") === "verify_failed"
      ? "Authorization failed. Please retry."
      : "";

  return (
    <main className="min-h-screen px-6 py-6 md:px-10 md:py-8 lg:px-16 flex items-center justify-center">
      <div className="w-full max-w-[980px]">
        <header className="flex items-center gap-3 mb-8 md:mb-10">
          <AnycapMark size={28} className="shrink-0" />
          <AnycapWordmark
            className="text-xl font-bold leading-none"
            style={{ ...mono, letterSpacing: "-0.5px" }}
          />
          <Link
            href="/for-human"
            className="ml-auto text-[11px] text-[#8f9487] hover:text-[#6b7d3a] tracking-[2.5px] uppercase transition-colors"
            style={mono}
          >
            Back →
          </Link>
        </header>

        <section className="relative border border-[#d1d8b7] bg-[#fbfcf7]/95 px-6 py-10 md:px-12 md:py-14 shadow-[0_18px_50px_rgba(28,31,23,0.06)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />

          <div className="relative text-center mx-auto max-w-[720px]">
            <h1
              className="leading-[0.95] tracking-[-0.03em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(36px, 6vw, 74px)" }}
            >
              Enter the code shown
              <br />
              in your terminal.
            </h1>

            {urlError ? (
              <p className="mt-4 text-sm text-[#a83f32]" style={mono}>
                {urlError}
              </p>
            ) : null}

            <div className="mt-10">
              <DeviceCodeForm initialCode={initialCode} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DevicePage() {
  return (
    <Suspense fallback={null}>
      <DevicePageInner />
    </Suspense>
  );
}
