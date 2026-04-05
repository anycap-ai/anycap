"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HoverDropdown, dropdownItemClass, dropdownDividerClass } from "@/components/ui/HoverDropdown";
import { useBalance } from "@/lib/api/hooks";
import { formatCredit } from "@/lib/credit";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

type UserAvatarMenuProps = {
  /** Avatar element rendered as the trigger */
  trigger: ReactNode;
  /** Position override for the dropdown panel */
  positionClass?: string;
  /** Container className */
  className?: string;
};

export function UserAvatarMenu({ trigger, positionClass, className }: UserAvatarMenuProps) {
  const { data: balance } = useBalance();

  return (
    <HoverDropdown
      positionClass={positionClass}
      className={className}
      trigger={() => trigger}
    >
      <Link
        href="/dashboard/billing"
        className={`${dropdownItemClass} flex items-center justify-between gap-6`}
        style={mono}
      >
        <span>Credits</span>
        <span className="text-[13px] text-[#6b7d3a] font-semibold tabular-nums">
          {balance ? formatCredit(balance.available) : "..."}
        </span>
      </Link>
      <hr className={dropdownDividerClass} />
      <LogoutButton className={`w-full text-left ${dropdownItemClass}`} style={mono}>
        Log out
      </LogoutButton>
    </HoverDropdown>
  );
}

/* ── Shared avatar renderer ── */

type AvatarProps = {
  picture?: string | null;
  name: string;
  size?: number;
};

export function UserAvatar({ picture, name, size = 32 }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "";
  const [imgError, setImgError] = useState(false);

  if (picture && !imgError) {
    return (
      <img
        src={picture}
        alt={name}
        width={size}
        height={size}
        className="object-cover shrink-0 rounded-full"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="bg-[#6b7d3a] flex items-center justify-center shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      <span className="text-[12px] font-semibold text-[#f4f5f0] leading-none">{initial}</span>
    </div>
  );
}
