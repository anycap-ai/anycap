"use client";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function ProcessingOverlay({ message = "Processing" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f5f0]/95 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="#d4dbb8" strokeWidth="2.5" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#6b7d3a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="text-[11px] tracking-[0.5px] text-[#4d5145]"
          style={mono}
        >
          {message}
        </span>
      </div>
    </div>
  );
}
