interface AnycapMarkProps {
  size?: number;
  className?: string;
}

export function AnycapMark({ size = 48, className }: AnycapMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="20 25 160 150"
      fill="none"
      aria-label="AnyCap"
      className={className}
    >
      <g transform="rotate(-5 100 100)">
        <rect x="15" y="15" width="170" height="170" rx="8" fill="#d4e0a4" opacity=".18" />
      </g>
      <g transform="rotate(-3 100 100)">
        <rect x="28" y="28" width="144" height="144" rx="5" fill="#8fa34e" opacity=".42" />
      </g>
      <rect x="49" y="49" width="102" height="102" rx="3" fill="#6b7d3a" />
      <rect x="83" y="83" width="34" height="34" rx="2" fill="#f4f5f0" />
    </svg>
  );
}
