"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

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
      <div className={`absolute inset-0 bg-black/70 transition-opacity duration-250 ease-out ${visible ? "opacity-100" : "opacity-0"}`} />
      <div className={`relative bg-[#1a1a1a] border border-[#333] rounded-lg px-8 py-8 max-w-md mx-4 text-center transition-all duration-250 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}`}>
        <p className="text-lg mb-2">This page is built for AI agents.</p>
        <p className="text-sm text-[#888] mb-6">
          You seem to be a human. Want the human-readable version?
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={href}
            prefetch={true}
            onClick={handleNavigate}
            className="px-6 py-2.5 bg-[#e0e0e0] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-white transition-colors"
          >
            {navigating ? "Loading…" : "Take me to the human page"}
          </Link>
          <button
            onClick={dismiss}
            className="px-6 py-2.5 text-sm text-[#666] hover:text-[#888] transition-colors"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
