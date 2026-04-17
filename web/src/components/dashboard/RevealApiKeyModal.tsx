"use client";

import { useState } from "react";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";
import { toast } from "@/lib/toast";

export function RevealApiKeyModal({
  rawKey,
  name,
  onClose,
}: {
  rawKey: string | null;
  name?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Modal
      open={!!rawKey}
      onClose={onClose}
      title={name ? `API key: ${name}` : "API key"}
      panelClassName="bg-white"
    >
      <p className="text-[13px] text-[#a83a26] mb-3 leading-relaxed">
        Copy this key now. For security reasons it will not be shown again.
      </p>
      <div className="border border-[#d8dcd0] bg-[#f7f8f5] rounded-xl px-4 py-3 font-mono text-[13px] text-[#1c1f17] break-all select-all">
        {rawKey}
      </div>
      <ModalActions>
        <ModalButton onClick={copy} variant="primary">
          {copied ? "Copied" : "Copy"}
        </ModalButton>
        <ModalButton onClick={onClose}>Done</ModalButton>
      </ModalActions>
    </Modal>
  );
}
