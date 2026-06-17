"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { LoginButton } from "@/components/auth/LoginButton";
import { UserAvatarMenu, UserAvatar } from "@/components/ui/UserAvatarMenu";
import { defaultAgentEntryPath } from "@/lib/site";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const primaryActionClass =
  "px-3.5 py-2 text-[14px] text-[#f4f5f0] bg-[#1c1f17] border border-[#1c1f17] hover:bg-[#3a3e32] hover:border-[#3a3e32] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out sm:px-5 sm:text-[15px]";

const secondaryActionClass =
  "hidden wide:inline-block px-5 py-2 text-[15px] text-[#3f4437] bg-[#fffffc] border border-[#d4dbb8] hover:bg-white hover:border-[#b8c09a] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out";

export function AuthNav({ variant = "human" }: { variant?: "human" | "seo" }) {
  const { user } = useUser();

  if (user) {
    const displayName = user.name || user.email || "";
    return (
      <>
        <Link
          href="/dashboard"
          prefetch={false}
          className={primaryActionClass}
          style={mono}
        >
          Dashboard
        </Link>
        <UserAvatarMenu
          trigger={
            <button className="p-0.5 rounded-full hover:ring-2 hover:ring-[#6b7d3a]/30 transition-all duration-200 ease-out cursor-pointer">
              <UserAvatar picture={user.picture} name={displayName} size={28} />
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <LoginButton
        className={primaryActionClass}
        style={mono}
      >
        <span className="sm:hidden">Try</span>
        <span className="hidden sm:inline">Try AnyCap</span>
      </LoginButton>
      {variant === "human" ? (
        <Link
          href={defaultAgentEntryPath}
          prefetch={false}
          className={secondaryActionClass}
          style={mono}
        >
          I&apos;m Agent
        </Link>
      ) : (
        <Link
          href={defaultAgentEntryPath}
          prefetch={false}
          className="px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
          style={mono}
        >
          I&apos;m Agent →
        </Link>
      )}
    </>
  );
}
