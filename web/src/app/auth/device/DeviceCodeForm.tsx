"use client";

import { FormEvent, useMemo, useState } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";

type Props = {
  initialCode: string;
};

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

function errorMessage(reason: string | undefined): string {
  switch (reason) {
    case "expired":
      return "Code expired. Please request a new code in your terminal.";
    case "verify_failed":
      return "Authorization failed. Please retry.";
    default:
      return "Invalid code. Please check and retry.";
  }
}

export function DeviceCodeForm({ initialCode }: Props) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalizedCode = useMemo(
    () => code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, ""),
    [code],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedCode || submitting) {
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let check: { valid?: boolean; reason?: string };
      try {
        check = await anycapPost<{ valid: boolean; reason?: string }>(
          "/v1/auth/device-code-check",
          { user_code: normalizedCode },
        );
      } catch {
        check = { valid: false, reason: "invalid" };
      }

      if (!check.valid) {
        setError(errorMessage(check.reason));
        return;
      }

      const target = `/auth/login?return_to=${encodeURIComponent("/auth/device/complete")}&device_code=${encodeURIComponent(normalizedCode)}`;
      window.location.assign(target);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-[680px]">
      <div className="text-left">
        <label className="block">
          <span
            className="block text-[11px] uppercase tracking-[3px] text-[#707468] mb-2"
            style={mono}
          >
            One-time Code
          </span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full h-[88px] md:h-[106px] border border-[#c7cfad] bg-[#fcfdf8] px-5 text-[26px] md:text-[34px] leading-none tracking-[3px] md:tracking-[4px] text-[#1c1f17] text-center placeholder:text-[#7a7e74] outline-none focus:border-[#6b7d3a] focus:shadow-[0_0_0_4px_rgba(107,125,58,0.12)]"
            style={mono}
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm text-[#a83f32]" style={mono}>
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          type="submit"
          disabled={!normalizedCode || submitting}
          className="w-full md:w-auto min-w-[220px] px-10 py-4 text-[12px] uppercase tracking-[3px] bg-[#66793a] text-[#f4f5f0] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_22px_rgba(102,121,58,0.28)] disabled:opacity-50 hover:bg-[#1c1f17] transition-colors"
          style={mono}
        >
          {submitting ? "Authorizing..." : "Continue"}
        </button>
      </div>
    </form>
  );
}
