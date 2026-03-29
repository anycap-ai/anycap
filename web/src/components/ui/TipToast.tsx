"use client";

import { useEffect, useState } from "react";

type TipToastProps = {
  message?: string;
  durationMs?: number;
};

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function TipToast({ message, durationMs = 4200 }: TipToastProps) {
  const [open, setOpen] = useState(Boolean(message));
  const [text, setText] = useState(message || "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      return;
    }
    setText(message);
    setOpen(true);
    setVisible(false);

    const raf = window.requestAnimationFrame(() => {
      setVisible(true);
    });

    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setOpen(false), 220);
    }, durationMs);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [message, durationMs]);

  if (!open || !text) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-[120] pointer-events-none">
      <div
        className={`pointer-events-auto w-[min(560px,calc(100vw-2rem))] border border-[#d6dcc0] bg-white/96 text-[#1c1f17] shadow-[0_14px_40px_rgba(28,31,23,0.16)] transition-all duration-200 ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={mono}
      >
        <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4">
          <p className="text-[12px] md:text-[13px] leading-6 tracking-[0.3px]">{text}</p>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              window.setTimeout(() => setOpen(false), 200);
            }}
            aria-label="Close tip"
            className="ml-auto shrink-0 w-8 h-8 inline-flex items-center justify-center text-[18px] leading-none text-[#6f7467] hover:text-[#1c1f17] transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
