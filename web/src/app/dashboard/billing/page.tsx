"use client";

export const runtime = "edge";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { createBillingCheckout, useBalance, useCreditPacks, useLogs } from "@/lib/api/hooks";
import { Pagination } from "@/components/ui/Pagination";
import type { CreditPack, TimelineItem } from "@/lib/api/types";
import { formatCredit, formatCreditCent } from "@/lib/credit";
import { timeAgo } from "@/lib/date";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
}

function TransactionCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#d8dcd0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
            <div className="w-16 shrink-0">
              <Skeleton className="ml-auto h-4 w-14" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMoney(priceCent: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(priceCent / 100);
}

function normalizePackQuery(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || null;
}

function parseQueryInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

type RequestedPackCriteria = {
  key: string | null;
  credits: number | null;
  priceCent: number | null;
};

const billingTrustPoints = [
  "One-time credit packs",
  "Purchased credits do not expire",
  "One balance across generation, actions, Drive, and Page",
] as const;

function matchPackByQuery(
  packs: CreditPack[],
  requestedPack: RequestedPackCriteria,
): CreditPack | null {
  if (requestedPack.credits != null) {
    const creditsMatch = packs.find((pack) => pack.credits === requestedPack.credits);
    if (creditsMatch) {
      return creditsMatch;
    }
  }

  if (requestedPack.priceCent != null) {
    const priceMatch = packs.find((pack) => pack.price_cent === requestedPack.priceCent);
    if (priceMatch) {
      return priceMatch;
    }
  }

  if (requestedPack.key) {
    const exactMatch = packs.find((pack) =>
      [pack.name, pack.id, pack.badge ?? null].some(
        (value) => normalizePackQuery(value) === requestedPack.key,
      ),
    );
    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = packs.find((pack) =>
      [pack.name, pack.id, pack.badge ?? null].some((value) =>
        normalizePackQuery(value)?.includes(requestedPack.key as string),
      ),
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  return packs.find((pack) => pack.featured) ?? packs[0] ?? null;
}

function createCheckoutAttemptBase(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function hasRequestedPackSelection(criteria: RequestedPackCriteria): boolean {
  return criteria.key != null || criteria.credits != null || criteria.priceCent != null;
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
  disabled = false,
}: {
  pack: CreditPack;
  selected: boolean;
  onSelect: (pack: CreditPack) => void;
  disabled?: boolean;
}) {
  const featured = !!pack.featured;

  return (
    <button
      type="button"
      onClick={() => onSelect(pack)}
      disabled={disabled}
      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
        selected
          ? "border-[#6b7d3a] bg-[rgba(107,125,58,0.09)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          : featured
            ? "border-[#bfcaa2] bg-[rgba(107,125,58,0.05)]"
            : "border-[#d8dcd0] bg-[#fafbf8] hover:bg-[#f4f6f0]"
      } ${disabled ? "cursor-wait opacity-75" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="shrink-0 text-left sm:text-right">
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

function TransactionCards({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-3 md:hidden">
      {items.map((item, index) => {
        const label = activityLabel(item);
        const amount =
          label === "Top-up"
            ? `+${formatCreditCent(item.credit_cent_amount ?? 0)}`
            : item.credit_cost != null
              ? `-${formatCredit(item.credit_cost)}`
              : "—";

        return (
          <article
            key={item.request_id || item.transaction_id || `${item.occurred_at}-${index}`}
            className="rounded-2xl border border-[#d8dcd0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#1c1f17]">{label}</p>
                <p className="mt-1 break-words text-[13px] leading-5 text-[#4d5145]">
                  {activityDescription(item)}
                </p>
              </div>
              <p
                className={`shrink-0 text-[14px] font-semibold tabular-nums ${
                  label === "Top-up" ? "text-[#6b7d3a]" : "text-[#1c1f17]"
                }`}
              >
                {amount}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#7a7e71]">
              <span>{timeAgo(item.occurred_at)}</span>
              <span>{item.transaction_id ? item.transaction_id.slice(0, 8) : "—"}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const LOGS_PAGE_SIZE = 20;
  const [logsPage, setLogsPage] = useState(1);
  const logsOffset = (logsPage - 1) * LOGS_PAGE_SIZE;
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useBalance();
  const { data: logs, isLoading: logsLoading, error: logsError } = useLogs(LOGS_PAGE_SIZE, logsOffset);
  const { data: packData, isLoading: packsLoading, error: packsError } = useCreditPacks();
  const logsTotalPages = Math.ceil((logs?.total ?? 0) / LOGS_PAGE_SIZE);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [submittingPackID, setSubmittingPackID] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedPackID, setSelectedPackID] = useState<string | null>(null);
  const [checkoutAttemptBase, setCheckoutAttemptBase] = useState<string | null>(null);
  const [pendingRequestedPack, setPendingRequestedPack] = useState<RequestedPackCriteria | null>(null);

  const checkoutState = searchParams.get("checkout");
  const buyIntent = searchParams.get("buy");
  const requestedPack = useMemo<RequestedPackCriteria>(() => {
    const requestedPrice = parseQueryInteger(searchParams.get("price"));
    return {
      key: normalizePackQuery(searchParams.get("pack")),
      credits: parseQueryInteger(searchParams.get("credits")),
      priceCent: requestedPrice != null ? requestedPrice * 100 : null,
    };
  }, [searchParams]);
  const activeRequestedPack = pendingRequestedPack ?? requestedPack;
  const packs = useMemo(() => packData?.packs ?? [], [packData?.packs]);
  const packStatus = typeof (packsError as { status?: unknown } | undefined)?.status === "number"
    ? Number((packsError as { status?: unknown }).status)
    : null;
  const packErrorMessage = packsError instanceof Error ? packsError.message : "Unable to load credit packs";
  const balanceErrorMessage = balanceError instanceof Error ? balanceError.message : "Unable to load credit balance";
  const logsErrorMessage = logsError instanceof Error ? logsError.message : "Unable to load transactions";
  const selectedPack = packs.find((pack) => pack.id === selectedPackID) ?? null;
  const hasRequestedPack = hasRequestedPackSelection(activeRequestedPack);

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
    const recommended = matchPackByQuery(packs, activeRequestedPack);
    setSelectedPackID(recommended?.id ?? null);
  }, [activeRequestedPack, buyModalOpen, packs, selectedPackID]);

  useEffect(() => {
    if (!buyModalOpen) {
      setCheckoutAttemptBase(null);
      return;
    }
    setCheckoutAttemptBase((current) => current ?? createCheckoutAttemptBase());
  }, [buyModalOpen]);

  useEffect(() => {
    if (buyIntent !== "1") {
      return;
    }

    setCheckoutError(null);
    setPendingRequestedPack(requestedPack);
    const recommended = matchPackByQuery(packs, requestedPack);
    setSelectedPackID(recommended?.id ?? null);
    setCheckoutAttemptBase(createCheckoutAttemptBase());
    setBuyModalOpen(true);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("buy");
    nextParams.delete("pack");
    nextParams.delete("credits");
    nextParams.delete("price");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [buyIntent, packs, pathname, requestedPack, router, searchParams]);

  async function handleBuy(pack: CreditPack) {
    setCheckoutError(null);
    setSubmittingPackID(pack.id);
    try {
      const origin = window.location.origin;
      const attemptBase = checkoutAttemptBase ?? createCheckoutAttemptBase();
      if (!checkoutAttemptBase) {
        setCheckoutAttemptBase(attemptBase);
      }
      const result = await createBillingCheckout({
        pack_id: pack.id,
        quantity: 1,
        success_url: `${origin}/dashboard/billing?checkout=success`,
        cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
        idempotency_key: `${attemptBase}:${pack.id}`,
      });
      window.location.assign(result.checkout_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checkout";
      setCheckoutError(message);
      setSubmittingPackID(null);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-7 md:mb-9">
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

      {balanceError ? (
        <Banner
          tone="red"
          title="Unable to load balance"
          body={balanceErrorMessage}
        />
      ) : null}

      {logsError ? (
        <Banner
          tone="red"
          title="Unable to load transactions"
          body={logsErrorMessage}
        />
      ) : null}

      <section className="max-w-[760px]">
        <div className="rounded-2xl border border-[#d8dcd0] bg-white px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] sm:px-7 sm:py-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
                Credit Balance
              </p>
              {balanceLoading && !balance && !balanceError ? (
                <>
                  <Skeleton className="h-10 w-32 mb-3" />
                  <Skeleton className="h-4 w-36" />
                </>
              ) : balance ? (
                <>
                  <p className="text-[36px] font-bold leading-none tracking-tight text-[#1c1f17] sm:text-4xl">
                    {formatCredit(balance.available)}
                  </p>
                  <p className="text-[14px] text-[#4d5145] mt-3">
                    credits remaining
                  </p>
                  <p className="mt-4 max-w-[440px] text-[13px] leading-[1.7] text-[#6b7068]">
                    Buy one-time credit packs whenever you need more balance. Purchased credits do
                    not expire, and the same balance works across AnyCap generation, analysis,
                    search, Drive, and Page workflows.
                  </p>
                </>
              ) : (
                <p className="text-[14px] leading-[1.6] text-[#8d3425]">
                  Balance is temporarily unavailable.
                </p>
              )}
            </div>

            <div className="sm:shrink-0">
              {balanceLoading && !balance && !balanceError ? (
                <Skeleton className="h-11 w-32" />
              ) : balance ? (
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutError(null);
                    setPendingRequestedPack(null);
                    const recommended = matchPackByQuery(packs, {
                      key: null,
                      credits: null,
                      priceCent: null,
                    });
                    setSelectedPackID(recommended?.id ?? null);
                    setCheckoutAttemptBase(createCheckoutAttemptBase());
                    setBuyModalOpen(true);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-3 text-[13px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235] sm:w-auto"
                >
                  Buy credits
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
          Transactions
        </p>

        {logsLoading && !logsError ? (
          <>
            <TransactionCardsSkeleton count={5} />
            <div className="hidden overflow-x-auto rounded-2xl border border-[#d8dcd0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] md:block">
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#eceee7]">
                      {[0, 1, 2, 3].map((j) => (
                        <td key={j} className="py-[15px] px-5">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : logsError ? (
          <p className="py-10 text-[14px] text-[#8d3425]">
            Transactions are temporarily unavailable.
          </p>
        ) : transactionItems.length ? (
          <>
            <TransactionCards items={transactionItems} />
            <div className="hidden overflow-x-auto rounded-2xl border border-[#d8dcd0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] md:block">
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
                  {transactionItems.map((item, i) => (
                    <TransactionRow
                      key={item.request_id || item.transaction_id || i}
                      item={item}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="py-10 text-[14px] text-[#7a7e71]">
            No transactions yet
          </p>
        )}
        <Pagination page={logsPage} totalPages={logsTotalPages} onPageChange={setLogsPage} />
      </section>

      <Modal
        open={buyModalOpen}
        onClose={() => {
          if (!submittingPackID) {
            setBuyModalOpen(false);
            setCheckoutAttemptBase(null);
            setPendingRequestedPack(null);
          }
        }}
        title="Buy credits"
      >
        <p className="mb-4 text-[13px] leading-[1.6] text-[#6b7068]">
          Choose a one-time credit pack. The recommended pack is selected by default, and your
          balance stays available across the rest of the AnyCap runtime.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {billingTrustPoints.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#d8dcd0] bg-[#fafbf8] px-3 py-1 text-[12px] text-[#4d5145]"
            >
              {item}
            </span>
          ))}
        </div>
        {hasRequestedPack ? (
          <p className="mb-4 text-[13px] leading-[1.6] text-[#4d5145]">
            We preselected the closest pack based on the option you chose on the pricing page.
          </p>
        ) : null}
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
                  disabled={submittingPackID != null}
                  onSelect={(nextPack) => setSelectedPackID(nextPack.id)}
                />
              ))}
            </div>
            {selectedPack ? (
              <>
                <div className="mt-5 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => void handleBuy(selectedPack)}
                    disabled={submittingPackID != null}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-[#6b7d3a] bg-[#6b7d3a] px-4 py-3 text-[13px] font-medium text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:bg-[#627235] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                  >
                    {submittingPackID === selectedPack.id ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner size={14} />
                        Redirecting to secure checkout...
                      </span>
                    ) : (
                      `Buy ${formatCredit(selectedPack.credits)} for ${formatMoney(selectedPack.price_cent, selectedPack.currency)}`
                    )}
                  </button>
                </div>
              </>
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
