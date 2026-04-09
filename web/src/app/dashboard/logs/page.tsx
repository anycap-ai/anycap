"use client";

export const runtime = "edge";

import { useState } from "react";
import { useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";
import { CapabilityActivityList } from "@/components/dashboard/CapabilityActivityList";
import { formatCredit } from "@/lib/credit";
import StatusBadge from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { timeAgo } from "@/lib/date";

const PAGE_SIZE = 20;

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function LogCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#d8dcd0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
            <div className="w-16 shrink-0">
              <Skeleton className="ml-auto h-3 w-14" />
              <Skeleton className="mt-2 ml-auto h-4 w-12" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
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
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const { data, isLoading } = useLogs(PAGE_SIZE, offset);
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  const items = data?.items?.filter((item) => item.type === "capability_call");

  return (
    <div className="pb-24">
      <h1 className="mb-7 text-[28px] font-semibold tracking-tight text-[#1c1f17] md:mb-9">
        Logs
      </h1>

      {isLoading ? (
        <>
          <LogCardsSkeleton count={6} />
          <div className="hidden overflow-x-auto rounded-2xl border border-[#d8dcd0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                  <th className={thClass}>Time</th>
                  <th className={thClass}>Capability</th>
                  <th className={thClass}>Model</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Cost</th>
                  <th className={`${thClass} text-right hidden md:table-cell`}>
                    ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eceee7]">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className={tdClass}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : items?.length ? (
        <>
          <CapabilityActivityList items={items} className="md:hidden" showRequestID />
          <div className="hidden overflow-x-auto rounded-2xl border border-[#d8dcd0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                  <th className={thClass}>Time</th>
                  <th className={thClass}>Capability</th>
                  <th className={thClass}>Model</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Cost</th>
                  <th className={`${thClass} text-right hidden md:table-cell`}>
                    ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <LogRow
                    key={item.request_id || i}
                    item={item}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="py-10 text-[15px] text-[#7a7e71]">
          No usage logs yet
        </p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
