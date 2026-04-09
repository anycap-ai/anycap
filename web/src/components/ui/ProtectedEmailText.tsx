import { buildProtectedEmailHtml, contactEmail } from "@/lib/contact";

type ProtectedEmailTextProps = {
  email?: string;
  className?: string;
};

export function ProtectedEmailText({
  email = contactEmail,
  className,
}: ProtectedEmailTextProps) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: buildProtectedEmailHtml(email) }}
    />
  );
}
