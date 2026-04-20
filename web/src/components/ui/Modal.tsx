"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";


export function Modal({
  open,
  onClose,
  onOpen,
  title,
  children,
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title: string;
  children: React.ReactNode;
  panelClassName?: string;
}) {
	const [visible, setVisible] = useState(false);
	const [animate, setAnimate] = useState(false);
	const backdropRef = useRef<HTMLDivElement>(null);
	const wasOpenRef = useRef(false);

	useEffect(() => {
		if (open && !wasOpenRef.current) {
			onOpen?.();
			setVisible(true);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setAnimate(true));
			});
		}
		if (!open && wasOpenRef.current) {
			setAnimate(false);
			const timer = setTimeout(() => setVisible(false), 250);
			wasOpenRef.current = open;
			return () => clearTimeout(timer);
		}
		wasOpenRef.current = open;
	}, [open, onOpen]);

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-[250ms] ease-out ${
        animate ? "bg-[#1c1f17]/20 backdrop-blur-sm" : "bg-transparent backdrop-blur-0"
      }`}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className={`w-full max-w-[420px] mx-4 max-h-[85vh] overflow-y-auto ${panelClassName || "bg-white"} border border-[#d8dcd0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-[250ms] ease-out ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-3"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8dcd0]">
          <p className="text-[15px] font-semibold text-[#1c1f17]">
            {title}
          </p>
          <button
            className="p-1 rounded-lg text-[#9a9e90] hover:text-[#1c1f17] hover:bg-[#eceee7] transition-colors"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 mt-5">
      {children}
    </div>
  );
}

export function ModalButton({
  onClick,
  disabled,
  busy,
  variant = "default",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "default" | "primary" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    default:
      "border border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] hover:bg-[#f0f2eb] hover:border-[#b8bdaf] shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
    primary:
      "bg-[#6b7d3a] text-white hover:bg-[#5c6c31] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)]",
    danger:
      "bg-[#c4442d] text-white hover:bg-[#a83a26] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled || busy}
    >
      {busy && <Spinner size={14} />}
      {children}
    </button>
  );
}
