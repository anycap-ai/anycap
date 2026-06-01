import Link from "next/link";
import { defaultPublicHomePath } from "@/lib/site";

export const runtime = "edge";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 font-mono">
      <h1 className="text-xl font-bold mb-2">404 · Not Found</h1>
      <p className="text-[#888]">
        <Link href={defaultPublicHomePath} className="underline">
          Back to anycap.ai
        </Link>
      </p>
    </main>
  );
}
