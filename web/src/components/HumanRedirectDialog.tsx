"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HumanRedirectDialog() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg px-8 py-8 max-w-md mx-4 text-center">
        <p className="text-lg mb-2">This page is built for AI agents.</p>
        <p className="text-sm text-[#888] mb-6">
          You seem to be a human. Want the human-readable version?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/for-human")}
            className="px-6 py-2.5 bg-[#e0e0e0] text-[#0a0a0a] text-sm font-bold rounded hover:bg-white transition-colors"
          >
            Take me to the human page
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-6 py-2.5 text-sm text-[#666] hover:text-[#888] transition-colors"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
