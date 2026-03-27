"use client";

export const runtime = "edge";

import { useBalance, useLogs } from "@/lib/api/hooks";
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

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d4dbb8]/30 animate-pulse ${className}`} />;
}

function TransactionRow({ item }: { item: TimelineItem }) {
  const isCredit = item.type === "credit_transaction";
  const positive = isCredit ? (item.credit_cent_amount ?? 0) >= 0 : false;

  return (
    <tr className="border-b border-[#d4dbb8]/60">
      <td className="py-2.5 px-3 text-[13px] text-[#4d5145]" style={mono}>
        {timeAgo(item.occurred_at)}
      </td>
      <td className="py-2.5 px-3 text-[13px]">
        {isCredit ? (
          <span
            className="text-[11px] uppercase tracking-[1.5px] text-[#707468]"
            style={mono}
          >
            {item.transaction_type || "credit"}
          </span>
        ) : (
          <span
            className="text-[11px] uppercase tracking-[1.5px] text-[#707468]"
            style={mono}
          >
            usage
          </span>
        )}
      </td>
      <td className="py-2.5 px-3 text-[13px] text-[#1c1f17]">
        {isCredit
          ? item.description || "—"
          : `${item.capability || "—"} / ${item.model || "—"}`}
      </td>
      <td
        className={`py-2.5 px-3 text-[13px] text-right font-bold ${
          isCredit
            ? positive
              ? "text-[#6b7d3a]"
              : "text-[#1c1f17]"
            : "text-[#4d5145]"
        }`}
        style={mono}
      >
        {isCredit
          ? `${positive ? "+" : ""}${item.credit_cent_amount}`
          : item.credit_cost != null
            ? `-${item.credit_cost}`
            : "—"}
      </td>
    </tr>
  );
}

export default function BillingPage() {
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: logs, isLoading: logsLoading } = useLogs(50);

  const transactions = logs?.items ?? [];

  return (
    <div>
      <p
        className="text-[11px] uppercase tracking-[2px] text-[#707468] mb-6"
        style={mono}
      >
        Billing
      </p>

      {/* Balance card */}
      {balanceLoading || !balance ? (
        <div className="border border-[#d4dbb8] px-6 py-6 max-w-md">
          <Skeleton className="h-3 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <div className="border border-[#d4dbb8] px-6 py-6 max-w-md">
          <p
            className="text-[11px] uppercase tracking-[2px] text-[#707468] mb-3"
            style={mono}
          >
            Credit Balance
          </p>
          <p className="text-3xl text-[#1c1f17] font-bold leading-none">
            {balance.available.toLocaleString()}
          </p>
          <p className="text-[13px] text-[#4d5145] mt-2" style={mono}>
            credits remaining
          </p>
        </div>
      )}

      {/* Transactions */}
      <div className="mt-10">
        <p
          className="text-[11px] uppercase tracking-[2px] text-[#707468] mb-4"
          style={mono}
        >
          Transactions
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#d4dbb8]">
                <th
                  className="text-left text-[11px] uppercase tracking-[2px] text-[#707468] py-2.5 px-3 font-normal"
                  style={mono}
                >
                  Time
                </th>
                <th
                  className="text-left text-[11px] uppercase tracking-[2px] text-[#707468] py-2.5 px-3 font-normal"
                  style={mono}
                >
                  Type
                </th>
                <th
                  className="text-left text-[11px] uppercase tracking-[2px] text-[#707468] py-2.5 px-3 font-normal"
                  style={mono}
                >
                  Description
                </th>
                <th
                  className="text-right text-[11px] uppercase tracking-[2px] text-[#707468] py-2.5 px-3 font-normal"
                  style={mono}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#d4dbb8]/60">
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="py-2.5 px-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length ? (
                transactions.map((item, i) => (
                  <TransactionRow
                    key={item.request_id || item.transaction_id || i}
                    item={item}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <p className="text-[13px] text-[#707468]" style={mono}>
                      No transactions yet
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
