const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;

export default function ForHumanLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p
        className="text-sm tracking-[1px] text-[#5a5e52] animate-pulse"
        style={pixel}
      >
        Loading…
      </p>
    </div>
  );
}
