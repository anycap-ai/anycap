"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { buildMailtoHref, contactEmail } from "@/lib/contact";

type EmailActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  email?: string;
  subject?: string;
};

export function EmailActionButton({
  email = contactEmail,
  subject,
  onClick,
  ...props
}: EmailActionButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    window.location.href = buildMailtoHref(email, { subject });
  };

  return <button type="button" onClick={handleClick} {...props} />;
}
