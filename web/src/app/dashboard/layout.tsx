import type { Metadata } from "next";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardToast } from "@/components/dashboard/DashboardToast";

export const runtime = "edge";

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
  return (
    <SWRProvider>
      <DashboardShell>{children}</DashboardShell>
      <DashboardToast />
    </SWRProvider>
  );
}
