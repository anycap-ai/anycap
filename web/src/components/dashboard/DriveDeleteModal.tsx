"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { deleteDriveNode } from "@/lib/api/hooks";
import { Modal, ModalActions, ModalButton } from "./Modal";


export function DriveDeleteModal({
  node,
  onClose,
  onChanged,
}: {
  node: DriveNode | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onConfirm() {
    if (!node) return;
    setBusy(true);
    setError("");
    try {
      await deleteDriveNode(node.id);
      await onChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!node}
      onClose={onClose}
      title="Delete"
      onOpen={() => setError("")}
    >
      <p className="text-[13px] text-[#4d5145]">
        Are you sure you want to delete <span className="text-[#1c1f17]">{node?.name}</span>?
        {node?.kind === "folder" && " This will also delete all contents inside."}
      </p>
      {error && (
        <p className="mt-3 text-[12px] text-[#a83f32]">{error}</p>
      )}
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onConfirm} disabled={busy} variant="danger">
          Delete
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
