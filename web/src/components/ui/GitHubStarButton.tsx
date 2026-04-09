const REPO = "anycap-ai/anycap";
const REPO_URL = `https://github.com/${REPO}`;

async function getStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

function formatStarCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 1.25l1.75 3.94 4.25.44-3.19 2.83.94 4.19L8 10.46l-3.75 2.19.94-4.19L2 5.63l4.25-.44L8 1.25z" />
    </svg>
  );
}

export async function GitHubStarButton() {
  const stars = await getStarCount();

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2 text-[15px] tracking-[0.3px] rounded-lg border border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] transition-all duration-200 ease-out hover:border-[#b8bdaf] hover:bg-[#f0f2eb] hover:text-[#1c1f17] active:scale-[0.97]"
      style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 500 }}
    >
      <GitHubMark size={16} />
      <StarIcon size={14} />
      <span>Star</span>
      {stars !== null && (
        <>
          <span className="w-px h-3.5 bg-[#d8dcd0]" />
          <span className="tabular-nums text-[#6b7068]">
            {formatStarCount(stars)}
          </span>
        </>
      )}
    </a>
  );
}
