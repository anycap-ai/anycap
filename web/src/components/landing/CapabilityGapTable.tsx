import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;

export type CapabilityGapColumn = {
  label: string;
  accent?: boolean;
};

export type CapabilityGapCell =
  | string
  | {
      label: string;
      tone?: "default" | "muted" | "accent";
      mono?: boolean;
      href?: string;
    };

export type CapabilityGapRow = {
  capability: string;
  cells: CapabilityGapCell[];
};

type CapabilityGapTableProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  columns: CapabilityGapColumn[];
  rows: CapabilityGapRow[];
  footnote?: string;
};

function normalizeCell(cell: CapabilityGapCell) {
  if (typeof cell === "string") {
    return { label: cell, tone: "default" as const, mono: false, href: undefined };
  }

  return {
    label: cell.label,
    tone: cell.tone ?? "default",
    mono: cell.mono ?? false,
    href: cell.href,
  };
}

function getToneClass(tone: "default" | "muted" | "accent") {
  switch (tone) {
    case "muted":
      return "text-[#5a5e52]";
    case "accent":
      return "text-[#6b7d3a]";
    default:
      return "text-[#1c1f17]";
  }
}

export function CapabilityGapTable({
  eyebrow,
  title,
  description,
  columns,
  rows,
  footnote,
}: CapabilityGapTableProps) {
  return (
    <section>
      {eyebrow ? (
        <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
        style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">{description}</p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
        <table className="min-w-[820px] w-full text-left">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
              <th
                className="bg-[#f4f5f0] px-5 py-4 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                style={mono}
              >
                Capability
              </th>
              {columns.map((column) => (
                <th
                  key={column.label}
                  className={`px-5 py-4 text-[11px] tracking-[0.5px] ${
                    column.accent ? "bg-[#6b7d3a]/[0.08] text-[#6b7d3a]" : "bg-[#f4f5f0] text-[#5a5e52]"
                  }`}
                  style={mono}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.capability} className="border-b border-[#d4dbb8]/60 last:border-b-0">
                <th className="bg-[#f9faf5] px-5 py-4 align-top text-sm font-medium text-[#1c1f17]">
                  {row.capability}
                </th>
                {row.cells.map((cell, index) => {
                  const normalizedCell = normalizeCell(cell);
                  const column = columns[index];

                  return (
                    <td
                      key={`${row.capability}-${column?.label ?? index}`}
                      className={`px-5 py-4 align-top text-sm leading-6 ${
                        column?.accent ? "bg-[#6b7d3a]/[0.05]" : "bg-[#fffffc]/70"
                      } ${getToneClass(normalizedCell.tone)}`}
                      style={normalizedCell.mono ? mono : undefined}
                    >
                      {normalizedCell.href ? (
                        <Link
                          href={normalizedCell.href}
                          className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                        >
                          {normalizedCell.label}
                        </Link>
                      ) : (
                        normalizedCell.label
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footnote ? (
        <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#5a5e52]">{footnote}</p>
      ) : null}
    </section>
  );
}
