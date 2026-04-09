"use client";

import type { TimelineItem } from "@/lib/api/types";
import { formatCredit } from "@/lib/credit";
import { timeAgo } from "@/lib/date";
import StatusBadge from "@/components/ui/StatusBadge";

type CapabilityActivityListProps = {
  items: TimelineItem[];
  className?: string;
  showRequestID?: boolean;
};

export function CapabilityActivityList({
  items,
  className = "",
  showRequestID = false,
}: CapabilityActivityListProps) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {items.map((item, index) => (
        <article
          key={item.request_id || `${item.occurred_at}-${index}`}
          className="rounded-2xl border border-[#d8dcd0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-[#1c1f17]">
                {item.capability || "—"}
              </p>
              <p className="mt-1 break-words text-[13px] leading-5 text-[#4d5145]">
                {item.model || "—"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[12px] text-[#7a7e71]">{timeAgo(item.occurred_at)}</p>
              <p className="mt-1 text-[13px] font-medium tabular-nums text-[#1c1f17]">
                {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              {item.status ? (
                <StatusBadge status={item.status} />
              ) : (
                <span className="text-[13px] text-[#4d5145]">—</span>
              )}
            </div>
            {showRequestID ? (
              <span className="text-[12px] tabular-nums text-[#7a7e71]">
                ID {item.request_id ? item.request_id.slice(0, 8) : "—"}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
