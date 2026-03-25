import Link from "next/link";
import { content, type Block } from "@/lib/landing-content";
import { HumanRedirectDialog } from "@/components/HumanRedirectDialog";

export default function AgentLanding() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
      <HumanRedirectDialog />

      <div className="mb-10 flex justify-end">
        <Link
          href="/for-human"
          className="inline-block px-5 py-2.5 bg-[#e0e0e0] text-[#0a0a0a] text-sm font-bold rounded hover:bg-white transition-colors"
        >
          {"I'm Human →"}
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-2xl font-bold mb-1">{content.title}</h1>
        <p className="text-lg mb-2">{content.tagline}</p>
        <p className="text-[#888]">{content.description}</p>
      </header>

      <hr className="border-[#222] mb-10" />

      {content.sections.map((section) => (
        <section key={section.title} className="mb-10">
          <h2 className="text-sm font-bold uppercase text-[#888] mb-3">
            {section.title}
          </h2>
          {section.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </section>
      ))}

      <footer className="mt-10 pt-6 border-t border-[#222] text-sm text-[#666]">
        <p>MIT License</p>
      </footer>
    </main>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return <p className="text-sm text-[#888] mb-3">{block.content}</p>;
    case "h3":
      return (
        <h3 className="text-xs text-[#666] uppercase tracking-wider mt-5 mb-2">
          {block.content}
        </h3>
      );
    case "code":
      return (
        <pre className="bg-[#111] rounded px-4 py-3 overflow-x-auto text-sm leading-relaxed mb-3">
          <code>{block.content}</code>
        </pre>
      );
    case "table":
      return (
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="text-left text-[#666] border-b border-[#222]">
              {block.headers.map((h) => (
                <th key={h} className="py-2 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-b border-[#111]">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-2 pr-4 ${j > 0 ? "text-[#888]" : ""}`}
                  >
                    {cell.startsWith("`") && cell.endsWith("`") ? (
                      <code>{cell.slice(1, -1)}</code>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "links":
      return (
        <ul className="space-y-1 text-sm mb-3">
          {block.items.map((item) => (
            <li key={item.url}>
              <a href={item.url} className="underline">
                {item.label}
              </a>
              {item.note && (
                <span className="text-[#666]"> — {item.note}</span>
              )}
            </li>
          ))}
        </ul>
      );
  }
}
