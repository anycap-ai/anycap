const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function ArticleByline({
  author = "By AnyCap Team",
  updatedLabel,
  className,
}: {
  author?: string;
  updatedLabel?: string;
  className?: string;
}) {
  return (
    <p className={`text-[11px] tracking-[0.5px] text-[#5a5e52] ${className ?? ""}`} style={mono}>
      {author}
      {updatedLabel ? ` · ${updatedLabel}` : ""}
    </p>
  );
}
