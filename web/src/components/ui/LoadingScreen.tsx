export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center bg-[#f4f5f0]"
    >
      <div
        style={{
          animation: "anycap-loading-enter 700ms ease-out 220ms both",
        }}
      >
        <span
          aria-hidden
          className="block h-2 w-2 rounded-full bg-[#6b7d3a]"
          style={{
            animation: "anycap-loading-breathe 1.8s ease-in-out infinite",
          }}
        />
      </div>
      <span className="sr-only">Loading</span>
      <style>{`
        @keyframes anycap-loading-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes anycap-loading-breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
