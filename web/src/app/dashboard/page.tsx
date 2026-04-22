"use client";

export const runtime = "edge";

import { useState } from "react";
import Link from "next/link";
import { CreditBalanceCard } from "@/components/dashboard/CreditBalanceCard";
import { useDashboardSummary } from "@/lib/api/hooks";
import { getInstallPrompt, agents } from "@/lib/agents";
import type { TimelineItem, Balance } from "@/lib/api/types";
import { CapabilityActivityList } from "@/components/dashboard/CapabilityActivityList";
import { formatCredit } from "@/lib/credit";
import StatusBadge from "@/components/ui/StatusBadge";
import { timeAgo } from "@/lib/date";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function ActivityCardsSkeleton({ count = 4 }: { count?: number }) {
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
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[152px] rounded-2xl border border-[#d8dcd0] bg-white px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] sm:px-8 sm:py-7">
      <p className="text-[14px] font-medium text-[#7a7e71] mb-5">
        {label}
      </p>
      {children}
    </div>
  );
}

function BalanceCard({ balance }: { balance: Balance }) {
  return (
    <CreditBalanceCard
      balance={balance}
      action={
        <div className="sm:shrink-0">
          <Link
            href="/dashboard/billing?buy=1"
            className="inline-flex w-full items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-5 py-3 text-[14px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235] sm:w-auto"
          >
            Buy credits
          </Link>
        </div>
      }
    />
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
          <p className="text-[17px] text-[#1c1f17] leading-snug font-medium">
            {summary.last_capability}
            <span className="text-[#7a7e71] mx-1.5">·</span>
            <span className="text-[#4d5145] font-normal">{summary.last_model}</span>
          </p>
          <p className="text-[15px] text-[#4d5145] mt-2.5">
            {timeAgo(summary.last_occurred_at)}
          </p>
        </>
      ) : (
        <p className="text-[14px] text-[#7a7e71]">
          No activity yet
        </p>
      )}
    </StatCard>
  );
}


function GetStartedCard() {
  const [copied, setCopied] = useState(false);
  const prompt = getInstallPrompt(agents[0]);

  return (
    <div className="mb-10">
      <div className="border border-[#d8dcd0] bg-white rounded-2xl px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-[#7a7e71] mb-2">
              Get started
            </p>
            <p className="text-[14px] text-[#1c1f17] leading-relaxed">
              {prompt}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="w-full rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-2 text-[12px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235] sm:mt-5 sm:w-auto sm:shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-3">
          <Link
            href="/dashboard/get-started"
            className="text-[13px] font-medium text-[#6b7d3a] hover:text-[#4d5f28] transition-colors"
          >
            Pick your agent &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: TimelineItem }) {
  return (
    <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
      <td className="py-4 px-6 text-[15px] text-[#4d5145]">
        {timeAgo(item.occurred_at)}
      </td>
      <td className="py-4 px-6 text-[15px] text-[#1c1f17] font-medium">
        {item.capability || "—"}
      </td>
      <td className="py-4 px-6 text-[15px] text-[#4d5145] truncate">
        {item.model || "—"}
      </td>
      <td className="py-4 px-6">
        {item.status ? <StatusBadge status={item.status} /> : <span className="text-[15px] text-[#4d5145]">—</span>}
      </td>
      <td className="py-4 px-6 text-[15px] text-[#4d5145] text-right tabular-nums">
        {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  const recentUsage = data?.recent_activity?.filter(
    (item) => item.type === "capability_call",
  );
  const isNewUser = !!data && !data.usage_summary;

  return (
    <div>
      <h1 className="mb-7 text-[28px] font-semibold tracking-tight text-[#1c1f17] md:mb-9">
        Overview
      </h1>

      {isNewUser && <GetStartedCard />}

      {/* Stats cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-[#d8dcd0] bg-white px-5 py-5 sm:px-8 sm:py-7">
              <Skeleton className="h-4 w-16 mb-6" />
              <Skeleton className="h-10 w-24 mb-3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <BalanceCard balance={data.balance} />
          <LastActivityCard summary={data.usage_summary} />
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-14">
        <p className="text-[15px] font-medium text-[#7a7e71] mb-5">
          Recent Activity
        </p>

        {isLoading ? (
          <>
            <ActivityCardsSkeleton count={4} />
            <div className="hidden space-y-3 rounded-2xl border border-[#d8dcd0] bg-white px-6 py-4 md:block">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </>
        ) : recentUsage?.length ? (
          <>
            <CapabilityActivityList items={recentUsage} className="md:hidden" />
            <div className="hidden overflow-hidden rounded-2xl border border-[#d8dcd0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] md:block">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                    <th className="text-left py-4 px-6 text-[13.5px] font-medium text-[#7a7e71]">Time</th>
                    <th className="text-left py-4 px-6 text-[13.5px] font-medium text-[#7a7e71]">Capability</th>
                    <th className="text-left py-4 px-6 text-[13.5px] font-medium text-[#7a7e71]">Model</th>
                    <th className="text-left py-4 px-6 text-[13.5px] font-medium text-[#7a7e71]">Status</th>
                    <th className="text-right py-4 px-6 text-[13.5px] font-medium text-[#7a7e71]">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsage.map((item, i) => (
                    <ActivityRow
                      key={item.request_id || i}
                      item={item}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-[15px] text-[#7a7e71] py-10">
            No activity yet. Ask your agent to use anycap.
          </p>
        )}
      </div>
    </div>
  );
}
