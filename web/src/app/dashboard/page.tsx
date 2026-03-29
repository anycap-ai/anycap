"use client";

export const runtime = "edge";

import { useDashboardSummary } from "@/lib/api/hooks";
import type { TimelineItem, Balance } from "@/lib/api/types";
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

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#d4dbb8]/70 bg-[#f9faf5] px-6 py-5 min-h-[122px] rounded-xl">
      <p
        className="text-[12px] tracking-[0.3px] text-[#626658] mb-3"
       
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function BalanceCard({ balance }: { balance: Balance }) {
  return (
    <StatCard label="Balance">
      <p className="text-2xl text-[#1c1f17] font-bold leading-none">
        {formatCredit(balance.available)}
      </p>
      <p className="text-[13px] text-[#4d5145] mt-1.5">
        credits
      </p>
    </StatCard>
  );
}

function LastActivityCard({
  summary,
}: {
  summary?: {
    last_capability: string;
    last_model: string;
    last_occurred_at: string;
  };
}) {
  return (
    <StatCard label="Last Activity">
      {summary ? (
        <>
          <p className="text-base text-[#1c1f17] leading-none">
            {summary.last_capability}
            <span className="text-[#9a9e90] mx-1.5">·</span>
            <span className="text-[#3a3e32]">{summary.last_model}</span>
          </p>
          <p className="text-[13px] text-[#4d5145] mt-1.5">
            {timeAgo(summary.last_occurred_at)}
          </p>
        </>
      ) : (
        <p className="text-[13px] text-[#7a7e71]">
          No activity yet
        </p>
      )}
    </StatCard>
  );
}

function ErrorCard({
  summary,
}: {
  summary?: {
    last_error_capability: string;
    last_error_code: string;
    last_error_occurred_at: string;
  };
}) {
  return (
    <StatCard label="Last Error">
      {summary ? (
        <>
          <p className="text-base text-[#a83f32] leading-none">
            {summary.last_error_code || summary.last_error_capability}
            {summary.last_error_code && summary.last_error_capability && (
              <>
                <span className="text-[#9a9e90] mx-1.5">·</span>
                <span className="text-[#3a3e32]">{summary.last_error_capability}</span>
              </>
            )}
          </p>
          <p className="text-[13px] text-[#4d5145] mt-1.5">
            {timeAgo(summary.last_error_occurred_at)}
          </p>
        </>
      ) : (
        <p className="text-[13px] text-[#6b7d3a]">
          No errors
        </p>
      )}
    </StatCard>
  );
}

function ActivityRow({ item }: { item: TimelineItem }) {
  return (
    <div className="flex items-center gap-4 px-3 py-3.5 border-b border-[#d4dbb8]/60 text-[13px]">
      <span className="text-[#4d5145] w-24 shrink-0">
        {timeAgo(item.occurred_at)}
      </span>
      <span className="text-[#1c1f17] w-36 shrink-0">{item.capability || "—"}</span>
      <span className="text-[#4d5145] flex-1 truncate">
        {item.model || "—"}
      </span>
      <span
        className={`w-16 shrink-0 text-right ${item.status === "ok" || item.status === "success"
            ? "text-[#6b7d3a]"
            : "text-[#a83f32]"
          }`}
       
      >
        {item.status || "—"}
      </span>
      <span className="text-[#4d5145] w-16 shrink-0 text-right">
        {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  const recentUsage = data?.recent_activity?.filter(
    (item) => item.type === "capability_call",
  );

  return (
    <div>
      <p
        className="text-[16px] font-medium text-[#1c1f17] mb-6"
       
      >
        Overview
      </p>

      {/* Stats cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#d4dbb8]/70 bg-[#f9faf5] px-6 py-5 rounded-xl">
              <Skeleton className="h-3 w-16 mb-4" />
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <BalanceCard balance={data.balance} />
          <LastActivityCard summary={data.usage_summary} />
          <ErrorCard summary={data.error_summary} />
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-11">
        <p
          className="text-[12px] tracking-[0.3px] text-[#5f6358] mb-4"
         
        >
          Recent Activity
        </p>

        {isLoading ? (
          <div className="space-y-3 border border-[#d4dbb8]/70 bg-[#f9faf5] px-3 py-2 rounded-xl">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentUsage?.length ? (
          <div className="border border-[#d4dbb8]/70 bg-[#f9faf5] rounded-xl overflow-hidden">
            {recentUsage.map((item, i) => (
              <ActivityRow
                key={item.request_id || i}
                item={item}
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#7a7e71] py-6">
            No activity yet. Ask your agent to use anycap.
          </p>
        )}
      </div>
    </div>
  );
}
