"use client";

export const runtime = "edge";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBalance, useLogs } from "@/lib/api/hooks";
import type { TimelineItem } from "@/lib/api/types";
import { formatCredit, formatCreditCent } from "@/lib/credit";
import { timeAgo } from "@/lib/date";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function formatTransactionType(item: TimelineItem): string {
  const raw = item.transaction_type || "credit";
  return raw
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUsageSummary(item: TimelineItem): string {
  const capability = item.capability || "Capability";
  const model = item.model || "default model";
  return `${capability} / ${model}`;
}

function Banner({
  tone,
  title,
  body,
}: {
  tone: "olive" | "red";
  title: string;
  body: string;
}) {
  const toneClass =
    tone === "olive"
      ? "border-[#d8dcd0] bg-[rgba(107,125,58,0.09)] text-[#3f4d1f]"
      : "border-[#e4c8c2] bg-[#fbf2ef] text-[#8d3425]";

  return (
    <div className={`mb-6 rounded-2xl border px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${toneClass}`}>
      <p className="text-[14px] font-medium">{title}</p>
      <p className="mt-1 text-[14px] leading-[1.6] opacity-90">{body}</p>
    </div>
  );
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
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
              positive
                ? "bg-[rgba(107,125,58,0.09)] text-[#55672c]"
                : "bg-[#f4f5f1] text-[#6b7068]"
            }`}
          >
            {formatTransactionType(item)}
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
          : formatUsageSummary(item)}
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

function UsageRow({ item }: { item: TimelineItem }) {
  const successful = item.status === "ok" || item.status === "success";

  return (
    <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
      <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">
        {timeAgo(item.occurred_at)}
      </td>
      <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
        {formatUsageSummary(item)}
      </td>
      <td className="py-[15px] px-5 text-[14px]">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
            successful
              ? "bg-[rgba(107,125,58,0.09)] text-[#55672c]"
              : "bg-[#fbf2ef] text-[#8d3425]"
          }`}
        >
          {item.status || "—"}
        </span>
      </td>
      <td className="py-[15px] px-5 text-[14px] text-right tabular-nums text-[#4d5145]">
        {item.credit_cost != null ? `-${formatCredit(item.credit_cost)}` : "—"}
      </td>
    </tr>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border border-[#d8dcd0] bg-white px-6 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
        {label}
      </p>
      <p className="text-[28px] font-semibold tracking-tight text-[#1c1f17]">
        {value}
      </p>
      <p className="mt-2 text-[14px] leading-[1.6] text-[#4d5145]">
        {hint}
      </p>
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: logs, isLoading: logsLoading } = useLogs(50);

  const checkoutState = searchParams.get("checkout");
  const transactions = (logs?.items ?? []).filter((item) => item.type === "credit_transaction");
  const latestPurchase = transactions.find((item) => (item.credit_cent_amount ?? 0) > 0);

  return (
    <div>
      <div className="mb-9">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1c1f17] tracking-tight">
            Billing
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#4d5145]">
            Review your balance and recent credit activity.
          </p>
        </div>
      </div>

      {checkoutState === "success" ? (
        <Banner
          tone="olive"
          title="Payment submitted"
          body="Your checkout completed successfully. Balance updates may take a moment while payment events are synchronized."
        />
      ) : null}

      {checkoutState === "cancel" ? (
        <Banner
          tone="red"
          title="Checkout was cancelled"
          body="No payment was captured. You can return to the buy credits page whenever you want to try again."
        />
      ) : null}

      {/* Balance card */}
      {balanceLoading || !balance ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="border border-[#d8dcd0] bg-white px-7 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            <Skeleton className="h-3.5 w-24 mb-5" />
            <Skeleton className="h-9 w-32 mb-2.5" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="border border-[#d8dcd0] bg-white px-7 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            <Skeleton className="h-3.5 w-20 mb-5" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-[80%] mb-6" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="border border-[#d8dcd0] bg-white px-7 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
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

          <div className="border border-[#d8dcd0] bg-white px-7 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
              Actions
            </p>
            <p className="text-[14px] leading-[1.7] text-[#4d5145]">
              Need more credits for upcoming runs? Purchase a one-time top-up and come back here to review the result.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/buy-credits"
                className="inline-flex items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-3 text-[13px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235]"
              >
                Buy more credits
              </Link>
              <Link
                href="/dashboard/logs"
                className="inline-flex items-center justify-center rounded-xl border border-[#ccd1c3] bg-[#fafbf8] px-4 py-3 text-[13px] font-medium text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:border-[#b8bdaf] hover:bg-[#f0f2eb]"
              >
                View usage logs
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {logsLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="border border-[#d8dcd0] bg-white px-6 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-20 mb-3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : (
          <>
            <SummaryCard
              label="Purchase events"
              value={String(transactions.length)}
              hint={latestPurchase
                ? `Latest top-up was ${timeAgo(latestPurchase.occurred_at)}.`
                : "No top-ups have been recorded yet."}
            />
            <SummaryCard
              label="Latest purchase"
              value={latestPurchase ? `${formatCreditCent(latestPurchase.credit_cent_amount ?? 0)}` : "—"}
              hint={latestPurchase
                ? latestPurchase.description || formatTransactionType(latestPurchase)
                : "Your next top-up will appear here once credits are granted."}
            />
          </>
        )}
      </div>

      {/* Transactions */}
      <div className="mt-12">
        <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
          Purchase history
        </p>

        <div className="overflow-x-auto border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                <th className="text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Time
                </th>
                <th className="text-left text-[13px] font-medium text-[#7a7e71] py-3.5 px-5">
                  Event
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
                      No purchase history yet
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
