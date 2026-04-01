"use client";

export const runtime = "edge";

import { useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";
import { formatCredit } from "@/lib/credit";
import StatusBadge from "@/components/ui/StatusBadge";
import { timeAgo } from "@/lib/date";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

const thClass =
  "text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5";
const tdClass = "py-[15px] px-5 text-[14px]";

function LogRow({ item }: { item: TimelineItem }) {
  return (
    <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
      <td className={`${tdClass} text-[#4d5145]`}>
        {timeAgo(item.occurred_at)}
      </td>
      <td className={`${tdClass} text-[#1c1f17] font-medium`}>
        {item.capability || "—"}
      </td>
      <td className={`${tdClass} text-[#4d5145]`}>
        {item.model || "—"}
      </td>
      <td className={tdClass}>
        {item.status ? <StatusBadge status={item.status} /> : <span className="text-[#4d5145]">—</span>}
      </td>
      <td className={`${tdClass} text-right tabular-nums`}>
        <span className="text-[#4d5145]">
          {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
        </span>
      </td>
      <td
        className={`${tdClass} text-[#7a7e71] text-right hidden md:table-cell`}
      >
        {item.request_id
          ? item.request_id.slice(0, 8)
          : "—"}
      </td>
    </tr>
  );
}

export default function LogsPage() {
  const { data, isLoading } = useLogs(100);
  const items = data?.items?.filter((item) => item.type === "capability_call");

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1c1f17] mb-9 tracking-tight">
        Logs
      </h1>

      {/* Table */}
      <div className="overflow-x-auto border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
              <th className={thClass}>Time</th>
              <th className={thClass}>Capability</th>
              <th className={thClass}>Model</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Cost</th>
              <th
                className={`${thClass} text-right hidden md:table-cell`}
              >
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eceee7]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className={tdClass}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items?.length ? (
              items.map((item, i) => (
                <LogRow
                  key={item.request_id || i}
                  item={item}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-[14px] text-[#7a7e71]">
                    No usage logs yet
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
