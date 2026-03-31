"use client";

import { useState } from "react";
import { useUser } from "@/lib/api/hooks";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HoverDropdown, dropdownItemClass } from "@/components/HoverDropdown";

export function UserProfileHeader() {
  const { data: user } = useUser();

  const displayName = user?.name || user?.email || user?.id || "";
  const avatarUrl = user?.avatar_url;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";

  const [imgError, setImgError] = useState(false);

  return (
    <HoverDropdown
      className="ml-auto"
      trigger={() => (
        <div className="flex items-center gap-3 cursor-default">
          <span className="text-[12px] text-[#5f6358] tracking-[0.2px]">
            {displayName}
          </span>
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="w-8 h-8 object-cover shrink-0 rounded-full"
              onError={() => setImgError(true)}
            />
          ) : initial ? (
            <div className="w-8 h-8 bg-[#6b7d3a] flex items-center justify-center shrink-0 rounded-full">
              <span className="text-[13px] font-bold text-[#f4f5f0] leading-none">
                {initial}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#6b7d3a] shrink-0 rounded-full" />
          )}
        </div>
      )}
    >
      <LogoutButton className={`w-full text-left ${dropdownItemClass}`}>
        Log out
      </LogoutButton>
    </HoverDropdown>
  );
}
