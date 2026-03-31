"use client";

import { useEffect, useRef, useState } from "react";
import { onToast, type ToastMessage } from "@/lib/toast";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const DURATION_MS = 5000;

export function DashboardToast() {
  const [current, setCurrent] = useState<ToastMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => onToast((msg) => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setCurrent(msg);
    setVisible(false);

    // Enter
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setCurrent(null), 220);
    }, DURATION_MS);
  }), []);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => setCurrent(null), 220);
  }

  if (!current) return null;

  const isError = current.variant === "error";

  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-[120] pointer-events-none">
      <div
        className={`pointer-events-auto w-[min(560px,calc(100vw-2rem))] border bg-white/96 shadow-[0_14px_40px_rgba(28,31,23,0.16)] transition-all duration-200 ${
          isError
            ? "border-[#e8b4ad] text-[#8b2e1e]"
            : "border-[#d6dcc0] text-[#1c1f17]"
        } ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={mono}
      >
        <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4">
          {isError && (
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4442d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <p className="text-[12px] md:text-[13px] leading-6 tracking-[0.3px]">
            {current.text}
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="ml-auto shrink-0 w-8 h-8 inline-flex items-center justify-center text-[18px] leading-none text-[#6f7467] hover:text-[#1c1f17] transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
