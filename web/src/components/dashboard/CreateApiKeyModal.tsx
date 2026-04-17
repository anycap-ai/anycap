"use client";

import { useState } from "react";
import { createApiKey } from "@/lib/api/hooks";
import type { CreateApiKeyResult } from "@/lib/api/types";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";

const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all";

const presetOptions: { label: string; days: number | null }[] = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
  { label: "Never expires", days: 0 },
  { label: "Custom", days: null },
];

const NAME_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

export function CreateApiKeyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (result: CreateApiKeyResult) => void;
}) {
  const [name, setName] = useState("");
  const [presetIdx, setPresetIdx] = useState(1); // default 30 days
  const [customDays, setCustomDays] = useState("30");
  const [busy, setBusy] = useState(false);

  function reset() {
    setName("");
    setPresetIdx(1);
    setCustomDays("30");
    setBusy(false);
  }

  function handleClose() {
    if (busy) return;
    reset();
    onClose();
  }

  async function onSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!NAME_PATTERN.test(trimmed)) {
      toast.error("Name must be 1-64 characters: letters, digits, '.', '_', '-'");
      return;
    }
    if (trimmed.toLowerCase() === "cli") {
      toast.error("'cli' is reserved for the OAuth-managed CLI key");
      return;
    }
    const preset = presetOptions[presetIdx];
    let expires_in_days: number | undefined;
    if (preset.days === null) {
      const n = Number(customDays);
      if (!Number.isInteger(n) || n < 1 || n > 3650) {
        toast.error("Custom expiry must be between 1 and 3650 days");
        return;
      }
      expires_in_days = n;
    } else {
      expires_in_days = preset.days;
    }

    setBusy(true);
    try {
      const result = await createApiKey({ name: trimmed, expires_in_days });
      onCreated(result);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create API key">
      <div className="space-y-4">
        <label className="block">
          <span className="block text-[13px] text-[#7a7e71] mb-2">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            autoFocus
            placeholder="ci-bot"
            className={inputClass}
          />
        </label>

        <div>
          <span className="block text-[13px] text-[#7a7e71] mb-2">Expiry</span>
          <div className="grid grid-cols-3 gap-2">
            {presetOptions.map((opt, idx) => {
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
          {presetOptions[presetIdx].days === null && (
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
          {presetOptions[presetIdx].days === 0 && (
            <p className="mt-2 text-[12px] text-[#a83a26]">
              No expiry. The key remains valid until you disable or delete it.
            </p>
          )}
        </div>
      </div>

      <ModalActions>
        <ModalButton onClick={handleClose} disabled={busy}>
          Cancel
        </ModalButton>
        <ModalButton
          onClick={onSubmit}
          disabled={!name.trim()}
          busy={busy}
          variant="primary"
        >
          Create
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
