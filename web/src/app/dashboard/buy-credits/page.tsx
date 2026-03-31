"use client";

export const runtime = "edge";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBillingCheckout, useBalance, useCreditPacks } from "@/lib/api/hooks";
import type { CreditPack } from "@/lib/api/types";
import { formatCredit } from "@/lib/credit";

function formatMoney(priceCent: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(priceCent / 100);
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#d0d4c8]/40 animate-pulse rounded ${className}`} />;
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

function BalanceCard() {
  const { data: balance, isLoading } = useBalance();

  return (
    <div className="border border-[#d8dcd0] bg-white rounded-2xl px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[13.5px] font-medium text-[#7a7e71] mb-4">
        Current balance
      </p>
      {isLoading || !balance ? (
        <>
          <Skeleton className="h-9 w-28 mb-2.5" />
          <Skeleton className="h-4 w-36" />
        </>
      ) : (
        <>
          <p className="text-[36px] text-[#1c1f17] font-bold leading-none tracking-tight">
            {formatCredit(balance.available)}
          </p>
          <p className="text-[14px] text-[#4d5145] mt-2">
            credits available now
          </p>
        </>
      )}
    </div>
  );
}

function PackCard({
  pack,
  loading,
  onBuy,
}: {
  pack: CreditPack;
  loading: boolean;
  onBuy: (pack: CreditPack) => void;
}) {
  const featured = !!pack.featured;
  const pricePer100 = (pack.price_cent / pack.credits) * 100;

  return (
    <div
      className={`rounded-2xl border px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] ${
        featured
          ? "border-[#bfcaa2] bg-[linear-gradient(180deg,rgba(107,125,58,0.09),rgba(255,255,255,0.98)_26%)]"
          : "border-[#d8dcd0] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[#7a7e71]">
            Credit pack
          </p>
          <h2 className="mt-2 text-[26px] font-semibold tracking-tight text-[#1c1f17]">
            {formatCredit(pack.credits)}
          </h2>
        </div>
        {pack.badge ? (
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${
              featured
                ? "bg-[rgba(107,125,58,0.12)] text-[#55672c]"
                : "bg-[#f4f5f1] text-[#6b7068]"
            }`}
          >
            {pack.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-6 text-[34px] font-bold leading-none tracking-tight text-[#1c1f17]">
        {formatMoney(pack.price_cent, pack.currency)}
      </p>
      <p className="mt-2 text-[14px] text-[#4d5145]">
        {(pricePer100 / 100).toLocaleString("en-US", {
          style: "currency",
          currency: pack.currency || "USD",
          maximumFractionDigits: 2,
        })}{" "}
        per 100 credits
      </p>

      <p className="mt-6 min-h-[48px] text-[14px] leading-[1.7] text-[#4d5145]">
        {pack.description || "One-time credit purchase for capability usage."}
      </p>

      <button
        type="button"
        onClick={() => onBuy(pack)}
        disabled={loading}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-[13px] font-medium transition-all ${
          featured
            ? "border-[#6b7d3a] bg-[#6b7d3a] text-[#f4f5f0] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#627235]"
            : "border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:border-[#b8bdaf] hover:bg-[#f0f2eb]"
        } disabled:cursor-wait disabled:opacity-70`}
      >
        {loading ? "Redirecting to checkout..." : "Buy credits"}
      </button>
    </div>
  );
}

export default function BuyCreditsPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useCreditPacks();
  const [submittingPackID, setSubmittingPackID] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkoutState = searchParams.get("checkout");
  const packs = data?.packs ?? [];
  const pricingStatus = typeof (error as { status?: unknown } | undefined)?.status === "number"
    ? Number((error as { status?: unknown }).status)
    : null;
  const pricingErrorMessage = error instanceof Error ? error.message : "Unable to load credit packs";

  async function handleBuy(pack: CreditPack) {
    setErrorMessage(null);
    setSubmittingPackID(pack.id);
    try {
      const origin = window.location.origin;
      const result = await createBillingCheckout({
        pack_id: pack.id,
        quantity: 1,
        success_url: `${origin}/dashboard/billing?checkout=success`,
        cancel_url: `${origin}/dashboard/buy-credits?checkout=cancel`,
      });
      window.location.assign(result.checkout_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checkout";
      setErrorMessage(message);
      setSubmittingPackID(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[720px]">
          <h1 className="text-[28px] font-semibold text-[#1c1f17] tracking-tight">
            Buy credits
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[#4d5145]">
            Add credits as you need them. Purchases are one-time only, with no automatic renewal.
          </p>
        </div>
        <div className="w-full max-w-[320px]">
          <BalanceCard />
        </div>
      </div>

      {checkoutState === "cancel" ? (
        <div className="mt-8">
          <Banner
            tone="red"
            title="Checkout was cancelled"
            body="No payment was captured. You can review the packs below and try again whenever you&apos;re ready."
          />
        </div>
      ) : null}

      {errorMessage ? (
        <Banner
          tone="red"
          title="Unable to start checkout"
          body={errorMessage}
        />
      ) : null}

      <section className="mt-10">
        <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
          Credit packs
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#d8dcd0] bg-white px-6 py-6"
              >
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-8 w-28 mb-6" />
                <Skeleton className="h-10 w-24 mb-3" />
                <Skeleton className="h-4 w-32 mb-8" />
                <Skeleton className="h-16 w-full mb-8" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#e4c8c2] bg-[#fbf2ef] px-6 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[14px] font-medium text-[#8d3425]">
              Credit packs are unavailable
            </p>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6a3a31]">
              {pricingStatus === 404
                ? "The current server does not expose /v1/pricing/credit-packs yet, so the page has no pack cards to render."
                : pricingErrorMessage}
            </p>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6a3a31]">
              To make purchasing work, make sure the updated anycap-server is running and `ANYCAP_CREDIT_PACKS_JSON` is configured.
            </p>
          </div>
        ) : packs.length ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2">
            {packs.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                loading={submittingPackID === pack.id}
                onBuy={handleBuy}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d8dcd0] bg-white px-6 py-10 text-center text-[14px] text-[#7a7e71] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            No credit packs are available yet. Ask an admin to configure payment products.
          </div>
        )}
      </section>

      <section className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-2xl border border-[#d8dcd0] bg-white px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
            How credits work
          </p>
          <div className="space-y-4 text-[14px] leading-[1.7] text-[#4d5145]">
            <p>Credits are consumed as you use AnyCap capabilities such as image, video, and music generation.</p>
            <p>Purchases are one-time top-ups. There is no subscription or automatic renewal in this flow.</p>
            <p>After payment completes, your balance may take a moment to refresh while the payment event is processed.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#d8dcd0] bg-white px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] font-medium text-[#7a7e71] mb-4">
            Need receipts later?
          </p>
          <p className="text-[14px] leading-[1.7] text-[#4d5145]">
            Use the billing page to review your balance and recent transactions after checkout.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-[#ccd1c3] bg-[#fafbf8] px-4 py-3 text-[13px] font-medium text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:border-[#b8bdaf] hover:bg-[#f0f2eb]"
          >
            Go to billing
          </Link>
        </div>
      </section>
    </div>
  );
}
