"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { updateDriveNode } from "@/lib/api/hooks";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "./Modal";


const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all";

export function DriveRenameModal({
  node,
  onClose,
  onChanged,
}: {
  node: DriveNode | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  function handleOpen() {
    if (node) {
      setName(node.name);
    }
  }

  async function onSubmit() {
    if (!node || !name.trim() || name === node.name) return;
    setBusy(true);
    try {
      await updateDriveNode(node.id, { name: name.trim() });
      await onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!node}
      onClose={onClose}
      title="Rename"
      onOpen={handleOpen}
    >
      <label className="block">
        <span className="block text-[13px] text-[#7a7e71] mb-2">
          New name
        </span>
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
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onSubmit} disabled={!name.trim()} busy={busy} variant="primary">
          Rename
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
