"use client";

import { useEffect, useRef, useState } from "react";


export function Modal({
  open,
  onClose,
  onOpen,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      onOpen?.();
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        animate ? "bg-[#1c1f17]/20 backdrop-blur-sm" : "bg-transparent backdrop-blur-0"
      }`}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className={`w-full max-w-[420px] mx-4 max-h-[85vh] overflow-y-auto bg-[#f4f5f0] border border-[#c8cebb] rounded-xl shadow-xl transition-all duration-200 ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c8cebb]">
          <p className="text-[12px] tracking-[0.3px] text-[#5f6358]">
            {title}
          </p>
          <button
            className="text-[#9a9e90] hover:text-[#1c1f17] transition-colors"
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
  variant = "default",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    default:
      "border border-[#d4dbb8]/70 text-[#707468] hover:text-[#3a3e32] hover:bg-[#edeee7]",
    primary:
      "border border-[#6b7d3a] bg-[#6b7d3a] text-white hover:bg-[#5a6c30]",
    danger:
      "border border-[#a83f32]/30 bg-[#a83f32] text-white hover:bg-[#932f23]",
  };

  return (
    <button
      className={`px-4 py-2 text-[12px] tracking-[0.2px] rounded-lg transition-colors disabled:opacity-40 ${styles[variant]}`}
     
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
