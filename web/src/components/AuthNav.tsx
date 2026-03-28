"use client";

import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const linkClass =
  "px-2.5 py-1.5 text-[11px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[0.5px] rounded transition-all duration-200 ease-out";

export function AuthNav() {
  const { user } = useAuth0User();
  const isLoggedIn = Boolean(user);

  return (
    <>
      {user?.email ? (
        <span className="px-2.5 py-1.5 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
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
        <Link href="/auth/login" prefetch={false} className={linkClass} style={mono}>
          Login
        </Link>
      )}
      <Link href="/" prefetch={false} className={linkClass} style={mono}>
        I&apos;m Agent &rarr;
      </Link>
    </>
  );
}
