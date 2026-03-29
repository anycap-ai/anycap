"use client";

import { useState } from "react";
import { useUser } from "@/lib/api/hooks";
import { LogoutButton } from "@/components/auth/LogoutButton";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export function UserProfileHeader() {
  const { data: user } = useUser();

  const displayName = user?.name || user?.email || user?.id || "";
  const avatarUrl = user?.avatar_url;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";

  const [imgError, setImgError] = useState(false);

  return (
    <div className="ml-auto relative group">
      <div className="flex items-center gap-3 cursor-default">
        <span
          className="text-[12px] text-[#5f6358] tracking-[0.2px]"
          style={mono}
        >
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
          <div
            className="w-8 h-8 bg-[#6b7d3a] flex items-center justify-center shrink-0 rounded-full"
            style={mono}
          >
            <span className="text-[13px] font-bold text-[#f4f5f0] leading-none">
              {initial}
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-[#6b7d3a] shrink-0 rounded-full" />
        )}
      </div>

      {/* Hover dropdown */}
      <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-30">
        <LogoutButton
          className="block px-5 py-2.5 text-[12px] tracking-[0.3px] text-[#4d5145] hover:text-[#6b7d3a] bg-[#f9faf5] border border-[#d4dbb8]/70 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          style={mono}
        />
      </div>
    </div>
  );
}
