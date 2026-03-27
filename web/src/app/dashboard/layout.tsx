import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { readSessionFromStore } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = readSessionFromStore(await cookies());
  if (!session?.apiKey) {
    redirect("/auth/login?return_to=/dashboard");
  }

  return (
    <SWRProvider>
      <DashboardShell>{children}</DashboardShell>
    </SWRProvider>
  );
}
