"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "./Modal";


export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[14px] text-[#4d5145] leading-relaxed">{message}</p>
      <ModalActions>
        <ModalButton onClick={onClose} disabled={busy}>Cancel</ModalButton>
        <ModalButton onClick={handleConfirm} busy={busy} variant={variant}>
          {confirmLabel}
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}
