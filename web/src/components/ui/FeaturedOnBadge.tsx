type FeaturedOnBadgeProps = {
  href: string;
  badgeSrc: string;
  badgeAlt: string;
  title?: string;
  description?: string;
  className?: string;
};

/**
 * Compact third-party badge block for low-profile placement on a single page.
 * Keep it visible and linked, but sized down so it does not dominate the layout.
 */
export function FeaturedOnBadge({
  href,
  badgeSrc,
  badgeAlt,
  title = "Featured on",
  description,
  className = "",
}: FeaturedOnBadgeProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${className}`}
    >
      <div>
        <p className="text-[10px] font-bold tracking-[0.5px] text-[#3a3e32] mb-2">
          {title}
        </p>
        {description ? (
          <p className="text-[10px] leading-5 text-[#697057]">
            {description}
          </p>
        ) : null}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={badgeAlt}
        className="inline-flex max-w-full items-center rounded-xl border border-[#d4dbb8] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:border-[#b8bdaf] hover:bg-[#f7f8f3]"
      >
        {/* Remote badge asset from the vendor is intentionally embedded as a plain image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badgeSrc}
          alt={badgeAlt}
          width={220}
          height={54}
          loading="lazy"
          decoding="async"
          className="h-[54px] w-auto max-w-full"
        />
      </a>
    </div>
  );
}
