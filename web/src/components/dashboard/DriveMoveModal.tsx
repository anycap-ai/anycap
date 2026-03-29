"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { updateDriveNode } from "@/lib/api/hooks";
import { Modal, ModalActions, ModalButton } from "./Modal";


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
  const [error, setError] = useState("");

  async function onSubmit() {
    if (!node) return;
    const trimmed = parentInput.trim();
    const parentID = trimmed === "" ? null : trimmed;
    setBusy(true);
    setError("");
    try {
      await updateDriveNode(node.id, { parent_id: parentID });
      await onChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to move");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!node}
      onClose={onClose}
      title="Move"
      onOpen={() => { setParentInput(""); setError(""); }}
    >
      <p className="text-[13px] text-[#4d5145] mb-4">
        Moving <span className="text-[#1c1f17]">{node?.name}</span>
      </p>
      <label className="block">
        <span className="block text-[11px] text-[#707468] mb-1.5">
          Destination parent ID (empty for root)
        </span>
        <input
          value={parentInput}
          onChange={(e) => setParentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={busy}
          autoFocus
          placeholder="root"
          className="w-full border border-[#c8cebb] bg-white px-3 py-2 text-[13px] text-[#1c1f17] rounded-lg disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-1 focus:ring-[#6b7d3a]/20 transition-all"
         
        />
      </label>
      {error && (
        <p className="mt-3 text-[12px] text-[#a83f32]">{error}</p>
      )}
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onSubmit} disabled={busy} variant="primary">
          Move
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
