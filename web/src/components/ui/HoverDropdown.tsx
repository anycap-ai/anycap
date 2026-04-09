"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const panelShadow = "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)";

type HoverDropdownProps = {
  trigger: (open: boolean, close: () => void, toggle: () => void) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  /** Override default panel positioning (defaults to below trigger) */
  positionClass?: string;
  className?: string;
};

export function HoverDropdown({ trigger, children, align = "right", positionClass, className }: HoverDropdownProps) {
  const [open, setOpen] = useState(false);
  const [panelOffsetX, setPanelOffsetX] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        clearCloseTimer();
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openNow() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 140);
  }

  function close() {
    clearCloseTimer();
    setOpen(false);
  }

  function toggle() {
    clearCloseTimer();
    setOpen((prev) => !prev);
  }

  const pos = positionClass ?? `absolute ${align === "right" ? "right-0" : "left-0"} top-full z-30 pt-2 origin-top`;

  useEffect(() => {
    if (!open || positionClass) {
      setPanelOffsetX(0);
      return undefined;
    }

    const viewportGutter = 16;
    let frameID = 0;

    const updatePosition = () => {
      const anchor = ref.current;
      const panel = panelRef.current;
      if (!anchor || !panel) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      let panelLeft = align === "left" ? anchorRect.left : anchorRect.right - panelWidth;
      let nextOffsetX = 0;

      if (panelLeft < viewportGutter) {
        nextOffsetX += viewportGutter - panelLeft;
        panelLeft = viewportGutter;
      }

      const panelRight = panelLeft + panelWidth;
      const maxRight = window.innerWidth - viewportGutter;
      if (panelRight > maxRight) {
        nextOffsetX -= panelRight - maxRight;
      }

      setPanelOffsetX((current) => (Math.abs(current - nextOffsetX) < 1 ? current : nextOffsetX));
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameID);
      frameID = window.requestAnimationFrame(updatePosition);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frameID);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [align, open, positionClass]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div onMouseEnter={openNow} onMouseLeave={scheduleClose}>
        {trigger(open, close, toggle)}
      </div>
      <div
        className={`${pos} ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
      >
        <div
          ref={panelRef}
          className="transition-transform duration-150"
          style={panelOffsetX === 0 ? undefined : { transform: `translateX(${panelOffsetX}px)` }}
        >
          <div
            className={`transition-all duration-150 ${
              open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div
              className="bg-white border border-[#d8dcd0] rounded-xl py-1.5 min-w-[160px]"
              style={{ boxShadow: panelShadow }}
            >
              {typeof children === "function" ? children(close) : children}
            </div>
          </div>
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
