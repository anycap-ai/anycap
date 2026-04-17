"use client";

import { useState } from "react";
import { updateApiKey } from "@/lib/api/hooks";
import type { ManagedApiKey } from "@/lib/api/types";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";

const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all";

const NAME_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

export function RenameApiKeyModal({
  apiKey,
  onClose,
  onChanged,
}: {
  apiKey: ManagedApiKey | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  function handleOpen() {
    if (apiKey) setName(apiKey.name);
  }

  async function onSubmit() {
    if (!apiKey) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === apiKey.name) return;
    if (!NAME_PATTERN.test(trimmed)) {
      toast.error("Name must be 1-64 characters: letters, digits, '.', '_', '-'");
      return;
    }
    if (trimmed.toLowerCase() === "cli") {
      toast.error("'cli' is reserved for the OAuth-managed CLI key");
      return;
    }
    setBusy(true);
    try {
      await updateApiKey(apiKey.id, { name: trimmed });
      await onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!apiKey} onClose={onClose} title="Rename API key" onOpen={handleOpen}>
      <label className="block">
        <span className="block text-[13px] text-[#7a7e71] mb-2">New name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={busy}
          autoFocus
          className={inputClass}
        />
      </label>
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>
          Cancel
        </ModalButton>
        <ModalButton
          onClick={onSubmit}
          disabled={!name.trim() || name === apiKey?.name}
          busy={busy}
          variant="primary"
        >
          Rename
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
