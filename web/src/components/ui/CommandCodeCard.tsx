interface CommandCodeCardProps {
  title: string;
  code: string;
}

const titleStyle = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const codeStyle = { fontFamily: "var(--font-mono), monospace" } as const;

export function CommandCodeCard({ title, code }: CommandCodeCardProps) {
  return (
    <div className="min-w-0 rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 md:p-6">
      <p
        className="mb-3 text-[11px] leading-5 tracking-[0.5px] text-[#6b7d3a]"
        style={titleStyle}
      >
        {title}
      </p>
      <pre className="min-w-0 overflow-hidden rounded-xl bg-[#1c1f17] px-4 py-4 text-[11px] leading-5 text-[#d4e0a4] sm:text-[12px] sm:leading-6">
        <code className="block whitespace-pre-wrap [overflow-wrap:anywhere]" style={codeStyle}>
          {code}
        </code>
      </pre>
    </div>
  );
}
