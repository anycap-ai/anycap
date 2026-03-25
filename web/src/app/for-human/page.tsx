import Link from "next/link";

export default function ForHumanPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">AnyCap for Humans</h1>
      <p className="text-[#888]">
        This page is under construction. Head to{" "}
        <Link href="/" className="underline">
          anycap.ai
        </Link>{" "}
        for the agent-readable version.
      </p>
    </main>
  );
}
