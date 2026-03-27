import { SeoShell } from "@/components/SeoShell";

export const runtime = "edge";

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SeoShell>{children}</SeoShell>;
}
