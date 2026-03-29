"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { updateDriveNode } from "@/lib/api/hooks";
import { Modal, ModalActions, ModalButton } from "./Modal";


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
  const [error, setError] = useState("");

  function handleOpen() {
    if (node) {
      setName(node.name);
      setError("");
    }
  }

  async function onSubmit() {
    if (!node || !name.trim() || name === node.name) return;
    setBusy(true);
    setError("");
    try {
      await updateDriveNode(node.id, { name: name.trim() });
      await onChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to rename");
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
        <span className="block text-[11px] text-[#707468] mb-1.5">
          New name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={busy}
          autoFocus
          className="w-full border border-[#c8cebb] bg-white px-3 py-2 text-[13px] text-[#1c1f17] rounded-lg disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-1 focus:ring-[#6b7d3a]/20 transition-all"
         
        />
      </label>
      {error && (
        <p className="mt-3 text-[12px] text-[#a83f32]">{error}</p>
      )}
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onSubmit} disabled={busy || !name.trim()} variant="primary">
          Rename
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
