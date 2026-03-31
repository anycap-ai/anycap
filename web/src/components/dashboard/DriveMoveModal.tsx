"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { updateDriveNode } from "@/lib/api/hooks";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";


const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all placeholder:text-[#b0b4a8]";

export function DriveMoveModal({
  node,
  onClose,
  onChanged,
}: {
  node: DriveNode | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [parentInput, setParentInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (!node) return;
    const trimmed = parentInput.trim();
    const parentID = trimmed === "" ? null : trimmed;
    setBusy(true);
    try {
      await updateDriveNode(node.id, { parent_id: parentID });
      await onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!node}
      onClose={onClose}
      title="Move"
      onOpen={() => { setParentInput(""); }}
    >
      <p className="text-[14px] text-[#4d5145] mb-4">
        Moving <span className="font-medium text-[#1c1f17]">{node?.name}</span>
      </p>
      <label className="block">
        <span className="block text-[13px] text-[#7a7e71] mb-2">
          Destination parent ID (empty for root)
        </span>
        <input
          value={parentInput}
          onChange={(e) => setParentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={busy}
          autoFocus
          placeholder="root"
          className={inputClass}
        />
      </label>
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onSubmit} busy={busy} variant="primary">
          Move
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
