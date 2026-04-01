"use client";

export const runtime = "edge";

import Link from "next/link";
import { usePageSites } from "@/lib/api/hooks";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatTime } from "@/lib/date";

export default function PagesPage() {
  const { data, isLoading } = usePageSites();

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1c1f17] mb-9 tracking-tight">
        Pages
      </h1>

      <div className="overflow-x-auto border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Name</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">URL</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Status</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Updated</th>
              <th className="text-right py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eceee7]">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <td key={j} className="py-[15px] px-5">
                      <div className="h-5 w-full bg-[#d0d4c8]/40 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (data?.items?.length ?? 0) > 0 ? (
              data!.items.map((site) => (
                <tr key={site.id} className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
                  <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
                    <Link href={`/dashboard/pages/${site.id}`} className="hover:text-[#6b7d3a]">
                      {site.name}
                    </Link>
                  </td>
                  <td className="py-[15px] px-5 text-[14px]">
                    {site.current_version_id && site.page_url ? (
                      <a
                        href={site.page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4d5145] hover:text-[#6b7d3a] underline underline-offset-2 decoration-[#dce0d2] hover:decoration-[#6b7d3a] transition-colors"
                      >
                        {site.page_url}
                      </a>
                    ) : (
                      <span className="text-[#b0b4a8]">—</span>
                    )}
                  </td>
                  <td className="py-[15px] px-5 text-[14px]">
                    <StatusBadge status={site.current_version_id ? "live" : "unpublished"} />
                  </td>
                  <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">
                    {formatTime(site.updated_at)}
                  </td>
                  <td className="py-[15px] px-5 text-right">
                    {site.current_version_id && site.page_url ? (
                      <a
                        href={site.page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 text-[13px] rounded-lg text-[#7a7e71] hover:bg-[#eceee7] hover:text-[#1c1f17] transition-colors"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-[#b0b4a8] text-[13px]">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[14px] text-[#7a7e71]">
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
