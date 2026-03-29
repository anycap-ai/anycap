import { AnycapMark } from "@/components/brand/AnycapMark";
import { AnycapWordmark } from "@/components/brand/AnycapWordmark";

interface AnycapLogoProps {
  /** Mark icon size in px — text and gap scale proportionally. */
  size?: number;
  variant?: "primary" | "alternate";
  className?: string;
}

export function AnycapLogo({ size = 28, variant = "primary", className }: AnycapLogoProps) {
  const fontSize = size * 0.71;
  const gap = size * 0.43;

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap }}
    >
      <AnycapMark size={size} className="shrink-0" />
      <AnycapWordmark
        variant={variant}
        style={{
          fontFamily: "var(--font-logo), monospace",
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}
      />
    </span>
  );
}
