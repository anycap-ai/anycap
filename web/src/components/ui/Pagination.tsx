"use client";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-xl border border-[#d8dcd0] bg-[#f2f3ef]/70 px-2.5 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md opacity-40 hover:opacity-100 transition-opacity duration-200">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8dcd0] bg-[#fafbf8] text-[13px] text-[#4d5145] transition-colors hover:bg-[#f0f2eb] disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <ChevronLeft />
      </button>

      {pages.map((entry, i) =>
        entry === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center text-[13px] text-[#7a7e71] select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry as number)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[13px] font-medium transition-colors ${
              entry === page
                ? "border-[#6b7d3a] bg-[rgba(107,125,58,0.09)] text-[#3f4d1f]"
                : "border-[#d8dcd0] bg-[#fafbf8] text-[#4d5145] hover:bg-[#f0f2eb]"
            }`}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8dcd0] bg-[#fafbf8] text-[13px] text-[#4d5145] transition-colors hover:bg-[#f0f2eb] disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <ChevronRight />
      </button>
    </div>
  );
}

function buildPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 3.5 5 7l3.5 3.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3.5 9 7l-3.5 3.5" />
    </svg>
  );
}
