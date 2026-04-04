"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { UserAvatarMenu, UserAvatar } from "@/components/ui/UserAvatarMenu";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export function AuthNav({ variant = "human" }: { variant?: "human" | "seo" }) {
  const { user } = useUser();

  if (user) {
    const displayName = user.name || user.email || "";
    return (
      <>
        <Link
          href="/dashboard"
          prefetch={false}
          className="px-5 py-2 text-[15px] text-[#f4f5f0] bg-[#1c1f17] border border-[#1c1f17] hover:bg-[#3a3e32] hover:border-[#3a3e32] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
          style={mono}
        >
          Dashboard
        </Link>
        <UserAvatarMenu
          trigger={
            <button className="p-0.5 rounded-full hover:ring-2 hover:ring-[#6b7d3a]/30 transition-all duration-200 ease-out cursor-pointer">
              <UserAvatar picture={user.picture} name={displayName} size={30} />
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        prefetch={false}
        className="px-5 py-2 text-[15px] text-[#f4f5f0] bg-[#1c1f17] border border-[#1c1f17] hover:bg-[#3a3e32] hover:border-[#3a3e32] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
        style={mono}
      >
        Try AnyCap
      </Link>
      {variant === "human" ? (
        <Link href="/" prefetch={false} className="hidden lg:inline-block px-5 py-2 text-[15px] text-[#3f4437] bg-[#fffffc] border border-[#d4dbb8] hover:bg-white hover:border-[#b8c09a] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out" style={mono}>
          I&apos;m Agent
        </Link>
      ) : (
        <Link href="/" prefetch={false} className="px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out" style={mono}>
          I&apos;m Agent →
        </Link>
      )}
    </>
  );
}
