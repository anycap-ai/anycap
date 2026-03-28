const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;

export default function ForHumanLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f5f0] text-[#5a5e52]">
      <p className="animate-pulse text-sm tracking-[1px]" style={pixel}>
        Loading...
      </p>
    </div>
  );
}
