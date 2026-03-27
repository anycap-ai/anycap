"use client";

export const runtime = "edge";

import { useState } from "react";
import { useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

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

type Filter = "all" | "image" | "video" | "understand";
type StatusFilter = "all" | "success" | "error";

function matches(
  item: TimelineItem,
  cap: Filter,
  status: StatusFilter,
): boolean {
  if (cap !== "all") {
    if (item.type !== "capability_call") return false;
    if (item.capability !== cap) return false;
  }
  if (status !== "all") {
    if (item.type !== "capability_call") return false;
    if (status === "success")
      return item.status === "ok" || item.status === "success";
    if (status === "error")
      return item.status !== "ok" && item.status !== "success";
  }
  return true;
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] uppercase tracking-[2px] pb-1 transition-colors cursor-pointer ${
        active
          ? "text-[#6b7d3a] border-b-2 border-[#6b7d3a]"
          : "text-[#707468] hover:text-[#6b7d3a] border-b-2 border-transparent"
      }`}
      style={mono}
    >
      {children}
    </button>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d4dbb8]/30 animate-pulse ${className}`} />;
}

const thClass =
  "text-left text-[11px] uppercase tracking-[2px] text-[#707468] py-2.5 px-3 font-normal";
const tdClass = "py-2.5 px-3 text-[13px]";

function LogRow({ item }: { item: TimelineItem }) {
  const isCall = item.type === "capability_call";
  return (
    <tr className="border-b border-[#d4dbb8]/60">
      <td className={`${tdClass} text-[#4d5145]`} style={mono}>
        {timeAgo(item.occurred_at)}
      </td>
      <td className={tdClass}>
        <span
          className="text-[11px] uppercase tracking-[1.5px] text-[#707468]"
          style={mono}
        >
          {isCall ? "call" : "credit"}
        </span>
      </td>
      <td className={`${tdClass} text-[#1c1f17]`}>
        {isCall ? item.capability : "—"}
      </td>
      <td className={`${tdClass} text-[#4d5145]`} style={mono}>
        {isCall ? item.model || "—" : "—"}
      </td>
      <td className={tdClass}>
        {isCall ? (
          <span
            className={
              item.status === "ok" || item.status === "success"
                ? "text-[#6b7d3a]"
                : "text-[#a83f32]"
            }
            style={mono}
          >
            {item.status}
          </span>
        ) : (
          <span className="text-[#707468]">—</span>
        )}
      </td>
      <td className={`${tdClass} text-right`} style={mono}>
        {isCall ? (
          <span className="text-[#4d5145]">
            {item.credit_cost != null ? `-${item.credit_cost}` : "—"}
          </span>
        ) : (
          <span
            className={
              (item.credit_cent_amount ?? 0) >= 0
                ? "text-[#6b7d3a] font-bold"
                : "text-[#1c1f17]"
            }
          >
            {(item.credit_cent_amount ?? 0) >= 0 ? "+" : ""}
            {item.credit_cent_amount}
          </span>
        )}
      </td>
      <td
        className={`${tdClass} text-[#707468] text-right hidden md:table-cell`}
        style={mono}
      >
        {isCall
          ? item.request_id
            ? item.request_id.slice(0, 8)
            : "—"
          : item.transaction_id
            ? item.transaction_id.slice(0, 8)
            : "—"}
      </td>
    </tr>
  );
}

export default function LogsPage() {
  const { data, isLoading } = useLogs(100);
  const [capFilter, setCapFilter] = useState<Filter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const items = data?.items?.filter((item) =>
    matches(item, capFilter, statusFilter),
  );

  return (
    <div>
      <p
        className="text-[11px] uppercase tracking-[2px] text-[#707468] mb-6"
        style={mono}
      >
        Logs
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        <div className="flex gap-4">
          {(["all", "image", "video", "understand"] as Filter[]).map((f) => (
            <FilterButton
              key={f}
              active={capFilter === f}
              onClick={() => setCapFilter(f)}
            >
              {f}
            </FilterButton>
          ))}
        </div>
        <div className="w-px bg-[#d4dbb8] mx-1 hidden sm:block" />
        <div className="flex gap-4">
          {(["all", "success", "error"] as StatusFilter[]).map((f) => (
            <FilterButton
              key={f}
              active={statusFilter === f}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
              <th className={thClass} style={mono}>Time</th>
              <th className={thClass} style={mono}>Type</th>
              <th className={thClass} style={mono}>Capability</th>
              <th className={thClass} style={mono}>Model</th>
              <th className={thClass} style={mono}>Status</th>
              <th className={`${thClass} text-right`} style={mono}>Cost</th>
              <th
                className={`${thClass} text-right hidden md:table-cell`}
                style={mono}
              >
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#d4dbb8]/60">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className={tdClass}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items?.length ? (
              items.map((item, i) => (
                <LogRow
                  key={item.request_id || item.transaction_id || i}
                  item={item}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <p className="text-[13px] text-[#707468]" style={mono}>
                    No logs found
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
