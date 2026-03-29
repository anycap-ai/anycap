"use client";

export const runtime = "edge";

import { useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";
import { formatCredit } from "@/lib/credit";


function timeAgo(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d4dbb8]/30 animate-pulse rounded ${className}`} />;
}

const thClass =
  "text-left text-[12px] tracking-[0.3px] text-[#626658] py-3 px-3.5 font-normal";
const tdClass = "py-3 px-3.5 text-[13px]";

function LogRow({ item }: { item: TimelineItem }) {
  return (
    <tr className="border-b border-[#d4dbb8]/60">
      <td className={`${tdClass} text-[#4d5145]`}>
        {timeAgo(item.occurred_at)}
      </td>
      <td className={`${tdClass} text-[#1c1f17]`}>
        {item.capability || "—"}
      </td>
      <td className={`${tdClass} text-[#4d5145]`}>
        {item.model || "—"}
      </td>
      <td className={tdClass}>
        <span
          className={
            item.status === "ok" || item.status === "success"
              ? "text-[#6b7d3a]"
              : "text-[#a83f32]"
          }
         
        >
          {item.status || "—"}
        </span>
      </td>
      <td className={`${tdClass} text-right`}>
        <span className="text-[#4d5145]">
          {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
        </span>
      </td>
      <td
        className={`${tdClass} text-[#707468] text-right hidden md:table-cell`}
       
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
      <p
        className="text-[16px] font-medium text-[#1c1f17] mb-6"
       
      >
        Logs
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-[#d4dbb8]/70 bg-[#f9faf5] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
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
                <tr key={i} className="border-b border-[#d4dbb8]/60">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className={tdClass}>
                      <Skeleton className="h-4 w-full" />
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
                <td colSpan={6} className="py-10 text-center">
                  <p className="text-[13px] text-[#707468]">
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
