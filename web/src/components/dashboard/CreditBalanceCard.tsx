"use client";

import type { ReactNode } from "react";
import type { Balance } from "@/lib/api/types";
import { formatCredit } from "@/lib/credit";
import { CreditInfoHint } from "@/components/dashboard/CreditInfoHint";

export function CreditBalanceCard({
  balance,
  action,
}: {
  balance: Balance;
  action: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#d8dcd0] bg-[linear-gradient(180deg,#ffffff_0%,#fafbf8_100%)] px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] sm:px-7 sm:py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[520px]">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-[14px] font-medium text-[#7a7e71]">Balance</p>
            <CreditInfoHint label="Balance details" />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <p className="text-[44px] font-bold leading-none tracking-[-0.05em] text-[#1c1f17] sm:text-[52px]">
              {formatCredit(balance.available)}
            </p>
            <div className="text-[15px] text-[#5f6459]">credits remaining</div>
          </div>
          <p className="mt-3 max-w-[460px] text-[14px] leading-[1.7] text-[#6a6f65]">
            Available across generation, search, Drive, and Page.
          </p>
        </div>

        <div className="sm:shrink-0">{action}</div>
      </div>
    </div>
  );
}
