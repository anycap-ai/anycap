export const runtime = 'edge';

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export default function DashboardPage() {
  return (
    <div className="py-12 md:py-20 flex flex-col items-center text-center">
      <p
        className="text-[11px] uppercase tracking-[2px] text-[#9a9e90]"
        style={mono}
      >
        Dashboard
      </p>
      <p className="mt-4 text-base text-[#4d5145] leading-[1.7]">
        Usage and billing insights are coming soon.
      </p>
    </div>
  );
}
