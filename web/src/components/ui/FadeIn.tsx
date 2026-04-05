import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Direction to slide from */
  from?: "bottom" | "left" | "right";
  /** Delay in ms */
  delay?: number;
}

const directionClassMap = {
  bottom: "fade-in-up",
  left: "fade-in-left",
  right: "fade-in-right",
} as const;

export function FadeIn({
  children,
  className = "",
  from = "bottom",
  delay = 0,
}: FadeInProps) {
  return (
    <div
      className={`${directionClassMap[from]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
