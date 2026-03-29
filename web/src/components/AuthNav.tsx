"use client";

import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const linkClass =
  "px-3 py-2 text-[15px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out";

export function AuthNav() {
  const { user } = useAuth0User();
  const isLoggedIn = Boolean(user);

  return (
    <>
      {user?.email ? (
        <span className="px-3 py-2 text-[15px] text-[#5a5e52] tracking-[0.3px]" style={mono}>
          {user.email}
        </span>
      ) : null}
      {isLoggedIn ? (
        <>
          <Link href="/dashboard" prefetch={false} className={linkClass} style={mono}>
            Dashboard
          </Link>
          <Link href="/auth/logout" prefetch={false} className={linkClass} style={mono}>
            Logout
          </Link>
        </>
      ) : (
        <Link
          href="/auth/login"
          prefetch={false}
          className="px-5 py-2 text-[15px] text-[#f4f5f0] bg-[#1c1f17] border border-[#1c1f17] hover:bg-[#3a3e32] hover:border-[#3a3e32] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out"
          style={mono}
        >
          Login
        </Link>
      )}
      <Link href="/" prefetch={false} className="hidden sm:inline-block px-5 py-2 text-[15px] text-[#3f4437] bg-[#fffffc] border border-[#d4dbb8] hover:bg-white hover:border-[#b8c09a] active:scale-[0.97] tracking-[0.3px] rounded-lg transition-all duration-200 ease-out" style={mono}>
        I&apos;m Agent
      </Link>
    </>
  );
}
