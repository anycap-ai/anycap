"use client";

import { useState } from "react";
import type { DriveNode } from "@/lib/api/types";
import { deleteDriveNode } from "@/lib/api/hooks";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";


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

  async function onConfirm() {
    if (!node) return;
    setBusy(true);
    try {
      await deleteDriveNode(node.id);
      await onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!node}
      onClose={onClose}
      title="Delete"
    >
      <p className="text-[14px] text-[#4d5145] leading-relaxed">
        Are you sure you want to delete <span className="font-medium text-[#1c1f17]">{node?.name}</span>?
        {node?.kind === "folder" && " This will also delete all contents inside."}
      </p>
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={onConfirm} busy={busy} variant="danger">
          Delete
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
