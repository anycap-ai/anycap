"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const panelShadow = "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)";

type HoverDropdownProps = {
  trigger: (open: boolean, close: () => void, toggle: () => void) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  /** Override default panel positioning (defaults to below trigger) */
  positionClass?: string;
  className?: string;
};

export function HoverDropdown({ trigger, children, align = "right", positionClass, className }: HoverDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);
  const pos = positionClass ?? `absolute ${align === "right" ? "right-0" : "left-0"} top-full z-30 pt-2 origin-top`;

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {trigger(open, close, toggle)}
      <div
        className={`${pos} transition-all duration-150 ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          className="bg-white border border-[#d8dcd0] rounded-xl py-1.5 min-w-[160px]"
          style={{ boxShadow: panelShadow }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export const dropdownItemClass =
  "block px-4 py-2.5 text-[14px] text-[#6b7068] hover:text-[#1c1f17] hover:bg-[#f0f2eb] rounded-lg transition-colors duration-150 whitespace-nowrap";

export const dropdownDisabledClass =
  "flex items-center justify-between px-4 py-2.5 text-[14px] text-[#b0b4a8] cursor-not-allowed";

export const dropdownDividerClass = "my-1.5 border-[#eceee7] mx-3";
