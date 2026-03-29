"use client";

export const runtime = "edge";

import Link from "next/link";
import { createPageSite, usePageSites } from "@/lib/api/hooks";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function PagesPage() {
  const { data, isLoading, mutate } = usePageSites();

  async function onCreate() {
    const name = window.prompt("Page name");
    if (name === null) return;

    await createPageSite({ name });
    await mutate();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-[12px] tracking-[0.3px] text-[#5f6358]" style={mono}>
          Pages
        </p>
        <button
          className="px-3 py-2 text-[12px] border border-[#d4dbb8] bg-[#f9faf5] text-[#1c1f17] hover:text-[#6b7d3a] rounded"
          style={mono}
          onClick={onCreate}
        >
          Create Page
        </button>
      </div>

      <div className="overflow-x-auto border border-[#d4dbb8] bg-[#f9faf5]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Name</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>URL</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Status</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-[13px] text-[#707468]" style={mono}>
                  Loading...
                </td>
              </tr>
            ) : (data?.items?.length ?? 0) > 0 ? (
              data!.items.map((site) => (
                <tr key={site.id} className="border-b border-[#d4dbb8]/60">
                  <td className="py-3 px-3.5 text-[13px] text-[#1c1f17]">
                    <Link href={`/dashboard/pages/${site.id}`} className="hover:text-[#6b7d3a]">
                      {site.name}
                    </Link>
                  </td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]" style={mono}>
                    https://{site.page_name}.page.anycap.cloud
                  </td>
                  <td className="py-3 px-3.5 text-[13px]" style={mono}>
                    <span className={site.current_version_id ? "text-[#6b7d3a]" : "text-[#707468]"}>
                      {site.current_version_id ? "live" : "unpublished"}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]" style={mono}>
                    {formatTime(site.updated_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-10 text-center text-[13px] text-[#707468]" style={mono}>
                  No pages yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
