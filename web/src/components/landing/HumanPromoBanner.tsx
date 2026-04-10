"use client";

import { useEffect, useRef, useState } from "react";
import { LoginButton } from "@/components/auth/LoginButton";
import { ParticleAgent } from "./ParticleAgent";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const storageKey = "anycap_human_promo_dismissed";

export function HumanPromoBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dismissed) {
      root.style.setProperty("--human-promo-offset", "0px");
      return;
    }

    const node = ref.current;
    if (!node) {
      root.style.setProperty("--human-promo-offset", "0px");
      return;
    }

    const updateOffset = () => {
      root.style.setProperty("--human-promo-offset", `${node.offsetHeight}px`);
    };

    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(node);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffset);
      root.style.setProperty("--human-promo-offset", "0px");
    };
  }, [dismissed]);

  function handleDismiss() {
    window.localStorage.setItem(storageKey, "1");
    setDismissed(true);
  }

  if (dismissed) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(255,255,255,0.18)] bg-[linear-gradient(90deg,#7fa235_0%,#5d8e3f_45%,#2a8f80_100%)] text-[#f7faef] shadow-[0_6px_24px_rgba(28,31,23,0.14)]"
    >
      <div className="flex min-h-[56px] items-center gap-3 px-4 py-2 md:min-h-[60px] md:px-6">
        <div className="hidden shrink-0 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(24,29,20,0.2)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:block">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[rgba(244,245,240,0.12)]">
            <ParticleAgent scale={0.12} className="-translate-y-[2px]" />
          </div>
        </div>
        <p
          className="min-w-0 flex-1 text-left text-[13px] font-medium leading-[1.45] md:text-[14px]"
          style={mono}
        >
          Your agent here. Start me with 250 bonus credits before Apr 10, and I&apos;ll show you what I can do.
        </p>
        <LoginButton
          className="hidden shrink-0 rounded-full bg-[#1c1f17] px-4 py-2 text-[12px] text-[#f4f5f0] transition-all hover:bg-[#11140e] md:inline-flex"
          style={mono}
        >
          Get started
        </LoginButton>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close announcement"
          className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-[22px] leading-none text-[#f7faef]/90 transition-colors hover:bg-[rgba(255,255,255,0.12)] hover:text-[#ffffff]"
        >
          ×
        </button>
      </div>
    </section>
  );
}
