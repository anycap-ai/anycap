"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function HumanRedirectDialog({ href }: { href: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleNavigate = useCallback(() => {
    setNavigating(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 250);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-250 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative mx-4 max-w-md rounded-lg border border-[#333] bg-[#1a1a1a] px-8 py-8 text-center transition-all duration-250 ease-out ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <p className="mb-2 text-lg">This page is built for AI agents.</p>
        <p className="mb-6 text-sm text-[#888]">
          You seem to be a human. Want the human-readable version?
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={href}
            prefetch={true}
            onClick={handleNavigate}
            className="rounded-lg bg-[#e0e0e0] px-6 py-2.5 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-white"
          >
            {navigating ? "Loading…" : "Take me to the human page"}
          </Link>
          <button
            onClick={dismiss}
            className="px-6 py-2.5 text-sm text-[#666] transition-colors hover:text-[#888]"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
