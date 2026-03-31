"use client";

export const runtime = "edge";

import { useBalance, useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";
import { formatCredit, formatCreditCent } from "@/lib/credit";


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
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function TransactionRow({ item }: { item: TimelineItem }) {
  const isCredit = item.type === "credit_transaction";
  const creditCentAmount = item.credit_cent_amount ?? 0;
  const positive = isCredit ? creditCentAmount >= 0 : false;

  return (
    <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
      <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">
        {timeAgo(item.occurred_at)}
      </td>
      <td className="py-[15px] px-5 text-[14px]">
        {isCredit ? (
          <span className="text-[13px] text-[#7a7e71]">
            {item.transaction_type || "credit"}
          </span>
        ) : (
          <span className="text-[13px] text-[#7a7e71]">
            usage
          </span>
        )}
      </td>
      <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
        {isCredit
          ? item.description || "—"
          : `${item.capability || "—"} / ${item.model || "—"}`}
      </td>
      <td
        className={`py-[15px] px-5 text-[14px] text-right font-bold tabular-nums ${
          isCredit
            ? positive
              ? "text-[#6b7d3a]"
              : "text-[#1c1f17]"
            : "text-[#4d5145]"
        }`}
      >
        {isCredit
          ? `${positive ? "+" : ""}${formatCreditCent(creditCentAmount)}`
          : item.credit_cost != null
            ? `-${formatCredit(item.credit_cost)}`
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
      <h1 className="text-[28px] font-semibold text-[#1c1f17] mb-9 tracking-tight">
        Billing
      </h1>

      {/* Balance card */}
      {balanceLoading || !balance ? (
        <div className="border border-[#d8dcd0] bg-white px-7 py-6 max-w-md rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <Skeleton className="h-3.5 w-24 mb-5" />
          <Skeleton className="h-9 w-32 mb-2.5" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <div className="border border-[#d8dcd0] bg-white px-7 py-6 max-w-md rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
            Credit Balance
          </p>
          <p className="text-4xl text-[#1c1f17] font-bold leading-none tracking-tight">
            {formatCredit(balance.available)}
          </p>
          <p className="text-[14px] text-[#4d5145] mt-2">
            credits remaining
          </p>
        </div>
      )}

      {/* Transactions */}
      <div className="mt-12">
        <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
          Transactions
        </p>

        <div className="overflow-x-auto border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                <th className="text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Time
                </th>
                <th className="text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Type
                </th>
                <th className="text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Description
                </th>
                <th className="text-right text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eceee7]">
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="py-[15px] px-5">
                        <Skeleton className="h-5 w-full" />
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
                  <td colSpan={4} className="py-12 text-center">
                    <p className="text-[14px] text-[#7a7e71]">
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
