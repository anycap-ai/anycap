export type NavIconKey =
  | "about"
  | "agent-skills"
  | "audio-generation"
  | "audio-understanding"
  | "capabilities"
  | "claude-code"
  | "cli"
  | "codex"
  | "compare"
  | "context-engineering"
  | "cursor"
  | "drive"
  | "equip-agents"
  | "get-started"
  | "grounded-web-search"
  | "image-generation"
  | "image-understanding"
  | "learn"
  | "manus"
  | "music-generation"
  | "pricing"
  | "smart-goal"
  | "video-analysis"
  | "video-generation"
  | "web-crawl"
  | "web-search";

type NavIconProps = {
  icon: NavIconKey;
  className?: string;
};

const pathByIcon: Record<NavIconKey, string> = {
  about: "M9 5.25H9.01M8.25 8.25H9V12.25M5.25 15.25H12.75L15.25 12.75V5.25L12.75 2.75H5.25L2.75 5.25V12.75L5.25 15.25Z",
  "agent-skills": "M4 12.75L7.25 15.25L14.25 5.25M4.25 5.75H9.25M4.25 8.75H7.25",
  "audio-generation": "M3.75 7H6.25L9.5 4.5V13.5L6.25 11H3.75V7ZM11.75 7C12.4 7.55 12.75 8.2 12.75 9C12.75 9.8 12.4 10.45 11.75 11M13.5 5.5C14.5 6.45 15 7.6 15 9C15 10.4 14.5 11.55 13.5 12.5",
  "audio-understanding": "M4.5 8.75V10.25M7.5 6.25V12.75M10.5 4.75V14.25M13.5 7.25V11.75",
  capabilities: "M5 5H8V8H5V5ZM10 5H13V8H10V5ZM5 10H8V13H5V10ZM10 10H13V13H10V10Z",
  "claude-code": "M9 3L14.25 6V12L9 15L3.75 12V6L9 3ZM9 6.25V11.75M6.25 9H11.75",
  cli: "M4.5 6.5L7 9L4.5 11.5M8.5 12H13.5M2.75 4.25H15.25V13.75H2.75V4.25Z",
  codex: "M5 4.75L9 2.75L13 4.75V13.25L9 15.25L5 13.25V4.75ZM7.25 7H10.75V11H7.25V7Z",
  compare: "M5 4.25V13.75M13 4.25V13.75M3.5 6H7.25M10.75 12H14.5M3.5 12H7.25M10.75 6H14.5",
  "context-engineering": "M3.75 5.25H14.25M3.75 9H11.75M3.75 12.75H8.75M12.25 10.75L15 13.5L12.25 16.25",
  cursor: "M4 3.75L14.5 9L10.75 10.25L9.5 14L4 3.75Z",
  drive: "M4.75 4.75H9.25L10.75 6.5H13.25L15 10L13.25 13.25H4.75L3 10L4.75 4.75Z",
  "equip-agents": "M9 2.75V5.25M9 12.75V15.25M5.25 9H2.75M15.25 9H12.75M5.75 5.75L4 4M14 14L12.25 12.25M12.25 5.75L14 4M4 14L5.75 12.25M6.25 6.25H11.75V11.75H6.25V6.25Z",
  "get-started": "M4.5 13.5L13.5 4.5M9.25 4.5H13.5V8.75M4.5 4.5H7M4.5 7V4.5M13.5 11V13.5H11",
  "grounded-web-search": "M7.75 12.75C5 12.75 3.25 11.1 3.25 9C3.25 6.9 5 5.25 7.75 5.25C10.5 5.25 12.25 6.9 12.25 9C12.25 11.1 10.5 12.75 7.75 12.75ZM11.5 12L14.75 15.25M6.5 9L7.5 10L9.75 7.75",
  "image-generation": "M3.75 4.75H14.25V13.25H3.75V4.75ZM5.5 11.75L7.5 9.25L9.25 11.25L10.5 9.75L12.5 11.75M6.5 7.25H6.51",
  "image-understanding": "M3.75 5.25H14.25V12.75H3.75V5.25ZM5.75 11.25L7.5 9.25L9 10.75L10.25 9.5L12.25 11.25M11.5 6.75L14.75 3.5",
  learn: "M4.25 4.75H8.25C9 4.75 9.5 5.25 9.5 6V14.25C9.5 13.5 9 13 8.25 13H4.25V4.75ZM9.5 6C9.5 5.25 10 4.75 10.75 4.75H13.75V13H10.75C10 13 9.5 13.5 9.5 14.25",
  manus: "M5 13.75V7.75C5 6.5 6 5.5 7.25 5.5C8.5 5.5 9.5 6.5 9.5 7.75V13.75M9.5 8.5C9.5 7.25 10.45 6.25 11.7 6.25C12.95 6.25 13.9 7.25 13.9 8.5V13.75M3.75 13.75H15.25",
  "music-generation": "M6.25 12.25V5.75L13 4.25V10.75M6.25 12.25C6.25 13.25 5.4 14 4.5 14C3.6 14 2.75 13.25 2.75 12.25C2.75 11.25 3.6 10.5 4.5 10.5C5.4 10.5 6.25 11.25 6.25 12.25ZM13 10.75C13 11.75 12.15 12.5 11.25 12.5C10.35 12.5 9.5 11.75 9.5 10.75C9.5 9.75 10.35 9 11.25 9C12.15 9 13 9.75 13 10.75Z",
  pricing: "M4.75 4.25H11.25L14.25 7.25L7.75 13.75L1.25 7.25L4.75 4.25ZM4.75 4.25L7.75 13.75L11.25 4.25M1.25 7.25H14.25",
  "smart-goal": "M9 3.25C5.8 3.25 3.25 5.8 3.25 9C3.25 12.2 5.8 14.75 9 14.75C12.2 14.75 14.75 12.2 14.75 9M9 5.75V9H12.25M12 3.5H14.5V6",
  "video-analysis": "M3.75 5H11.5V13H3.75V5ZM11.5 8L14.75 6V12L11.5 10V8ZM6 7.25L9 9L6 10.75V7.25Z",
  "video-generation": "M3.75 5H11.5V13H3.75V5ZM11.5 8L14.75 6V12L11.5 10V8ZM6 7.25L9 9L6 10.75V7.25Z",
  "web-crawl": "M3.75 5.25H14.25V8.25H3.75V5.25ZM5 11.75H8M10 11.75H13M6.5 8.25V11.75M11.5 8.25V11.75M9 11.75V14.75",
  "web-search": "M8 12.5C5.5 12.5 3.5 10.5 3.5 8C3.5 5.5 5.5 3.5 8 3.5C10.5 3.5 12.5 5.5 12.5 8C12.5 10.5 10.5 12.5 8 12.5ZM11.5 11.5L14.5 14.5M5.75 8H10.25M8 5.75V10.25",
};

export function NavIcon({ icon, className = "" }: NavIconProps) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d9dfc9] bg-[#f2f5e9] text-[#6b7d3a] ${className}`}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d={pathByIcon[icon]}
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
