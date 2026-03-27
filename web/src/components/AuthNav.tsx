import { cookies } from "next/headers";
import Link from "next/link";
import { readSessionFromStore } from "@/lib/auth/session";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

const linkClass =
  "px-2.5 py-1.5 text-[11px] text-[#3f4437] hover:text-[#1c1f17] hover:bg-[#6b7d3a]/[0.08] active:scale-[0.97] tracking-[2px] uppercase rounded transition-all duration-200 ease-out";

export async function AuthNav() {
  const cookieStore = await cookies();
  const session = readSessionFromStore(cookieStore);
  const isLoggedIn = Boolean(session?.apiKey);

  return (
    <>
      {session?.user?.email ? (
        <span className="px-2.5 py-1.5 text-[11px] text-[#5a5e52] tracking-[1.5px]" style={mono}>
          {session.user.email}
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
