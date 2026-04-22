"use client";

import { HoverDropdown } from "@/components/ui/HoverDropdown";

export const creditInfoItems = [
  "One-time credit packs",
  "Purchased credits do not expire",
  "One balance across generation, actions, Drive, and Page",
] as const;

export function CreditInfoHint({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <HoverDropdown
      align="left"
      positionClass="absolute left-0 top-full z-30 pt-2 origin-top"
      className={className}
      trigger={(open, _close, toggle) => (
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={toggle}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-semibold transition-all ${
            open
              ? "border-[#b8beb0] bg-[#f0f2ec] text-[#4f564b]"
              : "border-[#d3d8cd] bg-white text-[#7b8176] hover:border-[#c3c8be] hover:bg-[#f6f7f3] hover:text-[#50564b]"
          }`}
        >
          ?
        </button>
      )}
    >
      <div className="w-[240px] px-3 py-3">
        <p className="text-[12.5px] font-medium text-[#676d62]">{label}</p>
        <div className="mt-2 space-y-2">
          {creditInfoItems.map((item) => (
            <div key={item} className="flex gap-2 text-[13px] leading-[1.55] text-[#4f554b]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b9bfb3]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </HoverDropdown>
  );
}
