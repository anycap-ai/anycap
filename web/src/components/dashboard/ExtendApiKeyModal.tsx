"use client";

import { useEffect, useState } from "react";
import { updateApiKey } from "@/lib/api/hooks";
import type { ManagedApiKey } from "@/lib/api/types";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";

const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all";

const presets: { label: string; days: number | null; never?: boolean }[] = [
  { label: "+ 7 days", days: 7 },
  { label: "+ 30 days", days: 30 },
  { label: "+ 90 days", days: 90 },
  { label: "+ 1 year", days: 365 },
  { label: "Make permanent", days: null, never: true },
  { label: "Custom", days: null },
];

export function ExtendApiKeyModal({
  apiKey,
  onClose,
  onChanged,
}: {
  apiKey: ManagedApiKey | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [presetIdx, setPresetIdx] = useState(1);
  const [customDays, setCustomDays] = useState("30");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setPresetIdx(1);
      setCustomDays("30");
    }
  }, [apiKey]);

  async function onSubmit() {
    if (!apiKey) return;
    const preset = presets[presetIdx];
    setBusy(true);
    try {
      if (preset.never) {
        await updateApiKey(apiKey.id, { never_expires: true });
      } else {
        let days = preset.days ?? 0;
        if (preset.days === null) {
          const n = Number(customDays);
          if (!Number.isInteger(n) || n < 1 || n > 3650) {
            toast.error("Custom expiry must be between 1 and 3650 days");
            setBusy(false);
            return;
          }
          days = n;
        }
        await updateApiKey(apiKey.id, { expires_in_days: days });
      }
      await onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update API key");
    } finally {
      setBusy(false);
    }
  }

  const currentExpiry = apiKey?.expires_at
    ? new Date(apiKey.expires_at).toLocaleString()
    : "Never expires";

  return (
    <Modal open={!!apiKey} onClose={onClose} title="Renew expiry">
      <p className="text-[13px] text-[#7a7e71] mb-3">
        Current: <span className="text-[#1c1f17]">{currentExpiry}</span>
      </p>
      <p className="text-[12px] text-[#7a7e71] mb-3 leading-relaxed">
        Renewal resets the expiry from now -- it does not add to the current expiry.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((opt, idx) => {
          const active = idx === presetIdx;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => setPresetIdx(idx)}
              disabled={busy}
              className={`px-3 py-2 text-[13px] rounded-xl border transition-colors disabled:opacity-40 ${
                active
                  ? "border-[#6b7d3a] bg-[rgba(107,125,58,0.10)] text-[#1c1f17]"
                  : "border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] hover:bg-[#f0f2eb]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {presets[presetIdx].days === null && !presets[presetIdx].never && (
        <div className="mt-3 flex items-center gap-2">
          <input
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={busy}
            inputMode="numeric"
            className={`${inputClass} max-w-[120px]`}
          />
          <span className="text-[13px] text-[#7a7e71]">days (1 - 3650)</span>
        </div>
      )}
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>
          Cancel
        </ModalButton>
        <ModalButton onClick={onSubmit} busy={busy} variant="primary">
          Apply
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
