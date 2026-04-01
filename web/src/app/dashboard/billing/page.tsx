"use client";

export const runtime = "edge";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { createBillingCheckout, useBalance, useCreditPacks, useLogs } from "@/lib/api/hooks";
import type { CreditPack, TimelineItem } from "@/lib/api/types";
import { formatCredit, formatCreditCent } from "@/lib/credit";
import { timeAgo } from "@/lib/date";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function formatMoney(priceCent: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(priceCent / 100);
}

function activityLabel(item: TimelineItem): "Top-up" | "Usage" {
  if (item.type === "credit_transaction" && (item.credit_cent_amount ?? 0) > 0) {
    return "Top-up";
  }
  return "Usage";
}

function activityDescription(item: TimelineItem): string {
  if (item.type === "capability_call") {
    const capability = item.capability || "Capability";
    const model = item.model || "default model";
    return `${capability} / ${model}`;
  }
  return item.description || "—";
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

function PackOption({
  pack,
  selected,
  onSelect,
}: {
  pack: CreditPack;
  selected: boolean;
  onSelect: (pack: CreditPack) => void;
}) {
  const featured = !!pack.featured;

  return (
    <button
      type="button"
      onClick={() => onSelect(pack)}
      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
        selected
          ? "border-[#6b7d3a] bg-[rgba(107,125,58,0.09)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          : featured
            ? "border-[#bfcaa2] bg-[rgba(107,125,58,0.05)]"
            : "border-[#d8dcd0] bg-[#fafbf8] hover:bg-[#f4f6f0]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold text-[#1c1f17]">
              {pack.name || formatCredit(pack.credits)}
            </p>
            {featured ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  featured
                    ? "bg-[rgba(107,125,58,0.12)] text-[#55672c]"
                    : "bg-[#f1f2ed] text-[#6b7068]"
                }`}
              >
                Recommend
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-[#4d5145]">
            {formatCredit(pack.credits)}
          </p>
          {pack.description ? (
            <p className="mt-1 text-[13px] leading-[1.6] text-[#6b7068]">
              {pack.description}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[18px] font-semibold text-[#1c1f17]">
            {formatMoney(pack.price_cent, pack.currency)}
          </p>
        </div>
      </div>
    </button>
  );
}

function TransactionRow({ item }: { item: TimelineItem }) {
  const label = activityLabel(item);
  const amount =
    label === "Top-up"
      ? `+${formatCreditCent(item.credit_cent_amount ?? 0)}`
      : item.credit_cost != null
        ? `-${formatCredit(item.credit_cost)}`
        : "—";

  return (
    <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
      <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">
        {timeAgo(item.occurred_at)}
      </td>
      <td className="py-[15px] px-5 text-[14px] text-[#6b7068]">
        {label}
      </td>
      <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
        {activityDescription(item)}
      </td>
      <td className={`py-[15px] px-5 text-[14px] text-right font-bold tabular-nums ${
        label === "Top-up" ? "text-[#6b7d3a]" : "text-[#1c1f17]"
      }`}>
        {amount}
      </td>
    </tr>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: logs, isLoading: logsLoading } = useLogs(50);
  const { data: packData, isLoading: packsLoading, error: packsError } = useCreditPacks();

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [submittingPackID, setSubmittingPackID] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedPackID, setSelectedPackID] = useState<string | null>(null);

  const checkoutState = searchParams.get("checkout");
  const packs = useMemo(() => packData?.packs ?? [], [packData?.packs]);
  const packStatus = typeof (packsError as { status?: unknown } | undefined)?.status === "number"
    ? Number((packsError as { status?: unknown }).status)
    : null;
  const packErrorMessage = packsError instanceof Error ? packsError.message : "Unable to load credit packs";
  const selectedPack = packs.find((pack) => pack.id === selectedPackID) ?? null;

  const transactionItems = useMemo(
    () =>
      (logs?.items ?? []).filter(
        (item) =>
          item.type === "capability_call" ||
          (item.type === "credit_transaction" && (item.credit_cent_amount ?? 0) > 0),
      ),
    [logs?.items],
  );

  useEffect(() => {
    if (!buyModalOpen || !packs.length) {
      return;
    }
    if (selectedPackID && packs.some((pack) => pack.id === selectedPackID)) {
      return;
    }
    const recommended = packs.find((pack) => pack.featured) ?? packs[0];
    setSelectedPackID(recommended.id);
  }, [buyModalOpen, packs, selectedPackID]);

  async function handleBuy(pack: CreditPack) {
    setCheckoutError(null);
    setSubmittingPackID(pack.id);
    try {
      const origin = window.location.origin;
      const result = await createBillingCheckout({
        pack_id: pack.id,
        quantity: 1,
        success_url: `${origin}/dashboard/billing?checkout=success`,
        cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
      });
      window.location.assign(result.checkout_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checkout";
      setCheckoutError(message);
      setSubmittingPackID(null);
      setBuyModalOpen(false);
    }
  }

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-[28px] font-semibold text-[#1c1f17] tracking-tight">
          Billing
        </h1>
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
          body="No payment was captured. You can try again whenever you are ready."
        />
      ) : null}

      {checkoutError ? (
        <Banner
          tone="red"
          title="Unable to start checkout"
          body={checkoutError}
        />
      ) : null}

      <section className="max-w-[760px]">
        <div className="border border-[#d8dcd0] bg-white px-7 py-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
                Credit Balance
              </p>
              {balanceLoading || !balance ? (
                <>
                  <Skeleton className="h-10 w-32 mb-3" />
                  <Skeleton className="h-4 w-36" />
                </>
              ) : (
                <>
                  <p className="text-4xl text-[#1c1f17] font-bold leading-none tracking-tight">
                    {formatCredit(balance.available)}
                  </p>
                  <p className="text-[14px] text-[#4d5145] mt-3">
                    credits remaining
                  </p>
                </>
              )}
            </div>

            <div className="sm:shrink-0">
              {balanceLoading || !balance ? (
                <Skeleton className="h-11 w-32" />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutError(null);
                    const recommended = packs.find((pack) => pack.featured) ?? packs[0] ?? null;
                    setSelectedPackID(recommended?.id ?? null);
                    setBuyModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-3 text-[13px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235]"
                >
                  Buy credits
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
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
              ) : transactionItems.length ? (
                transactionItems.map((item, i) => (
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
      </section>

      <Modal
        open={buyModalOpen}
        onClose={() => {
          if (!submittingPackID) {
            setBuyModalOpen(false);
          }
        }}
        title="Buy credits"
      >
        <p className="mb-4 text-[13px] leading-[1.6] text-[#6b7068]">
          Choose a one-time credit pack. The recommended pack is selected by default.
        </p>
        {packsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-[#d8dcd0] bg-[#fafbf8] px-4 py-4">
                <Skeleton className="h-5 w-28 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : packsError ? (
          <div className="rounded-2xl border border-[#e4c8c2] bg-[#fbf2ef] px-4 py-4">
            <p className="text-[14px] font-medium text-[#8d3425]">
              Credit packs are unavailable
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#6a3a31]">
              {packStatus === 404
                ? "The current server does not expose /v1/pricing/credit-packs yet."
                : packErrorMessage}
            </p>
          </div>
        ) : packs.length ? (
          <>
            <div className="space-y-3">
              {packs.map((pack) => (
                <PackOption
                  key={pack.id}
                  pack={pack}
                  selected={selectedPack?.id === pack.id}
                  onSelect={(nextPack) => setSelectedPackID(nextPack.id)}
                />
              ))}
            </div>
            {selectedPack ? (
              <div className="mt-5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => void handleBuy(selectedPack)}
                  disabled={submittingPackID != null}
                  className="inline-flex items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-3 text-[13px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235] disabled:cursor-wait disabled:opacity-70"
                >
                  {submittingPackID === selectedPack.id
                    ? "Redirecting..."
                    : `Buy ${formatCredit(selectedPack.credits)} for ${formatMoney(selectedPack.price_cent, selectedPack.currency)}`}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-[#d8dcd0] bg-[#fafbf8] px-4 py-4 text-[14px] text-[#7a7e71]">
            No credit packs are available yet.
          </div>
        )}
      </Modal>
    </div>
  );
}
