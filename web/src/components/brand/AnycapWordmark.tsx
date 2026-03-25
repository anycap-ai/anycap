interface AnycapWordmarkProps {
  variant?: "primary" | "alternate";
  className?: string;
  style?: React.CSSProperties;
}

const variants = {
  primary: { any: "#1c1f17", cap: "#6b7d3a" },
  alternate: { any: "#6b7d3a", cap: "#8fa34e" },
} as const;

export function AnycapWordmark({
  variant = "primary",
  className,
  style,
}: AnycapWordmarkProps) {
  const colors = variants[variant];

  return (
    <span className={className} style={style}>
      <span style={{ color: colors.any }}>any</span>
      <span style={{ color: colors.cap }}>cap</span>
    </span>
  );
}
