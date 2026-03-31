const variantStyles: Record<string, string> = {
  success:
    "bg-[rgba(107,125,58,0.10)] text-[#556b2a] border-[rgba(107,125,58,0.18)]",
  neutral:
    "bg-[rgba(122,126,113,0.08)] text-[#6b7068] border-[rgba(122,126,113,0.14)]",
  muted:
    "bg-[rgba(176,180,168,0.10)] text-[#9a9e90] border-[rgba(176,180,168,0.14)]",
  info:
    "bg-[rgba(143,163,78,0.10)] text-[#5e7030] border-[rgba(143,163,78,0.16)]",
  error:
    "bg-[rgba(196,68,45,0.08)] text-[#a83a26] border-[rgba(196,68,45,0.14)]",
};

const autoVariant: Record<string, string> = {
  live: "success",
  published: "success",
  shared: "success",
  succeed: "success",
  success: "success",
  ok: "success",
  public: "info",
  verified: "info",
  private: "neutral",
  unpublished: "neutral",
  password: "neutral",
  archived: "muted",
  error: "error",
  failed: "error",
  fail: "error",
};

export default function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant?: keyof typeof variantStyles;
}) {
  const v = variant ?? autoVariant[status.toLowerCase()] ?? "neutral";
  const styles = variantStyles[v];

  return (
    <span
      className={`inline-flex items-center px-3 py-[5px] rounded-lg text-[13px] font-medium leading-none border ${styles}`}
    >
      {status}
    </span>
  );
}
