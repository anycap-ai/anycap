import { DiscordIcon } from "@/components/ui/DiscordLink";
import { GitHubIcon, GitHubLink } from "@/components/ui/GitHubLink";
import { discordInviteUrl } from "@/lib/contact";

type CommunityActionsVariant = "desktop" | "mobileCards" | "mobilePills";

type CommunityActionsProps = {
  variant?: CommunityActionsVariant;
  className?: string;
  onActionClick?: () => void;
};

type ActionKind = "github" | "discord";

type ActionStyle = {
  groupClassName: string;
  githubClassName: string;
  discordClassName: string;
  iconSize: number;
  showExternalIcon?: boolean;
  discordLabel: string;
  githubLabel: string;
};

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const desktopBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[15px] tracking-[0.3px] transition-all duration-200 ease-out active:scale-[0.97]";

const mobilePillBase =
  "relative z-[60] inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-150";

const mobileCardBase =
  "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[15px] transition-colors duration-150";

const styles: Record<CommunityActionsVariant, ActionStyle> = {
  desktop: {
    groupClassName: "flex items-center gap-2",
    githubClassName:
      `${desktopBase} border border-[#d8dcd0] bg-[#fff] text-[#1c1f17] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:border-[#b8bdaf] hover:bg-[#fff]`,
    discordClassName:
      `${desktopBase} border border-[#5865f2] bg-[#5865f2] text-white hover:border-[#4752c4] hover:bg-[#4752c4]`,
    iconSize: 16,
    discordLabel: "Feedback",
    githubLabel: "Star us",
  },
  mobileCards: {
    groupClassName: "mb-3 space-y-2",
    githubClassName:
      `${mobileCardBase} border border-[#d8dcd0] bg-[#fff] text-[#1c1f17] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:border-[#b8bdaf] hover:bg-[#fff]`,
    discordClassName:
      `${mobileCardBase} border border-[#5865f2] bg-[#5865f2] text-white hover:border-[#4752c4] hover:bg-[#4752c4]`,
    iconSize: 24,
    showExternalIcon: true,
    discordLabel: "Share feedback",
    githubLabel: "Star us",
  },
  mobilePills: {
    groupClassName: "contents",
    githubClassName:
      `${mobilePillBase} border border-[#d8dcd0] bg-[#fff] text-[#1c1f17] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:border-[#b8bdaf] hover:bg-[#fff]`,
    discordClassName:
      `${mobilePillBase} border border-[#5865f2] bg-[#5865f2] text-white hover:border-[#4752c4] hover:bg-[#4752c4]`,
    iconSize: 15,
    discordLabel: "Share feedback",
    githubLabel: "Star us",
  },
};

export function CommunityActions({
  variant = "desktop",
  className,
  onActionClick,
}: CommunityActionsProps) {
  const style = styles[variant];
  const actionOrder: ActionKind[] = variant === "desktop" ? ["github", "discord"] : ["discord", "github"];

  return (
    <div className={joinClassNames(style.groupClassName, className)}>
      {actionOrder.map((kind) => (
        <CommunityLink
          key={kind}
          kind={kind}
          label={kind === "github" ? style.githubLabel : style.discordLabel}
          className={kind === "github" ? style.githubClassName : style.discordClassName}
          iconSize={style.iconSize}
          showExternalIcon={style.showExternalIcon}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
}

function CommunityLink({
  kind,
  label,
  className,
  iconSize,
  showExternalIcon,
  onActionClick,
}: {
  kind: ActionKind;
  label: string;
  className: string;
  iconSize: number;
  showExternalIcon?: boolean;
  onActionClick?: () => void;
}) {
  const content = (
    <>
      {kind === "github" ? <GitHubIcon size={iconSize} /> : <DiscordIcon size={iconSize} />}
      <span className={showExternalIcon ? "min-w-0 flex-1" : undefined}>
        {label}
      </span>
      {showExternalIcon ? <ExternalIcon /> : null}
    </>
  );

  if (kind === "github") {
    return (
      <GitHubLink
        aria-label="Star AnyCap on GitHub"
        className={className}
        style={mono}
        onClick={onActionClick}
      >
        {content}
      </GitHubLink>
    );
  }

  return (
    <a
      href={discordInviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share feedback with the AnyCap team on Discord"
      className={className}
      style={mono}
      onClick={onActionClick}
    >
      {content}
    </a>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M3 9L9 3M4 3H9V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
