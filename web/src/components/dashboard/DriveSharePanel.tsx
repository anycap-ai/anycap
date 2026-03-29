"use client";

import { useState } from "react";
import { revokeDriveShare, rotateDriveShare, upsertDriveShare } from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { Modal, ModalActions, ModalButton } from "./Modal";


export function DriveSharePanel({
  node,
  onClose,
  onChanged,
}: {
  node?: DriveNode | null;
  onClose: () => void;
  onChanged?: () => void | Promise<unknown>;
}) {
  const [shareURL, setShareURL] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expiresInput, setExpiresInput] = useState("");
  const [noExpire, setNoExpire] = useState(false);
  const [password, setPassword] = useState("");
  const [noPassword, setNoPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setShareURL("");
    setHasPassword(false);
    setExpiresAt(null);
    setExpiresInput("");
    setNoExpire(false);
    setPassword("");
    setNoPassword(false);
    setBusy(false);
    setError("");
  }

  function parseExpiresToSeconds(input: string): number {
    const value = input.trim().toLowerCase();
    if (!value) throw new Error("expiry is required");
    if (value.endsWith("d")) {
      const days = Number.parseInt(value.slice(0, -1), 10);
      if (!Number.isInteger(days) || days <= 0) {
        throw new Error("expiry must be positive (example: 7d or 24h)");
      }
      return days * 24 * 60 * 60;
    }
    if (value.endsWith("h")) {
      const hours = Number.parseInt(value.slice(0, -1), 10);
      if (!Number.isInteger(hours) || hours <= 0) {
        throw new Error("expiry must be positive (example: 7d or 24h)");
      }
      return hours * 60 * 60;
    }
    throw new Error("expiry must end with d or h (example: 7d or 24h)");
  }

  async function onCreateOrLoad() {
    if (!node) return;
    setBusy(true);
    setError("");
    try {
      const result = await upsertDriveShare(node.id, {});
      setShareURL(result.url);
      setHasPassword(result.has_password);
      setExpiresAt(result.expires_at ?? null);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to create share");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveSettings() {
    if (!node) return;
    setBusy(true);
    setError("");
    try {
      if (password.trim() !== "" && noPassword) {
        throw new Error("password and remove password cannot be used together");
      }
      const payload: Record<string, unknown> = {};
      if (noExpire) {
        payload.no_expire = true;
      } else if (expiresInput.trim() !== "") {
        payload.expires_in_seconds = parseExpiresToSeconds(expiresInput);
      }
      if (password.trim() !== "") {
        payload.password = password.trim();
      }
      if (noPassword) {
        payload.no_password = true;
      }
      const result = await upsertDriveShare(node.id, payload);
      setShareURL(result.url);
      setHasPassword(result.has_password);
      setExpiresAt(result.expires_at ?? null);
      setPassword("");
      setNoPassword(false);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to update share");
    } finally {
      setBusy(false);
    }
  }

  async function onRotate() {
    if (!node) return;
    setBusy(true);
    setError("");
    try {
      const result = await rotateDriveShare(node.id);
      setShareURL(result.url);
      setHasPassword(result.has_password);
      setExpiresAt(result.expires_at ?? null);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to rotate share");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke() {
    if (!node) return;
    setBusy(true);
    setError("");
    try {
      await revokeDriveShare(node.id);
      setShareURL("");
      setHasPassword(false);
      setExpiresAt(null);
      setPassword("");
      setNoPassword(false);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to revoke share");
    } finally {
      setBusy(false);
    }
  }

  async function onCopyLink() {
    if (!shareURL) return;
    try {
      await navigator.clipboard.writeText(shareURL);
    } catch {
      // silent
    }
  }

  return (
    <Modal open={!!node} onClose={onClose} title="Share" onOpen={handleOpen}>
      {/* File info — inline, no box */}
      <p className="text-[13px] text-[#1c1f17] font-medium">{node?.name}</p>
      <p className="text-[12px] text-[#707468] mt-0.5">{node?.kind}</p>

      <hr className="my-4 border-[#d4dbb8]" />

      {/* Share link */}
      <p className="text-[11px] text-[#707468] uppercase tracking-[0.5px] mb-3">
        Share link
      </p>

      {shareURL ? (
        <div className="space-y-2.5">
          <a
            href={shareURL}
            target="_blank"
            rel="noreferrer"
            className="block text-[12px] text-[#6b7d3a] break-all hover:underline"
           
          >
            {shareURL}
          </a>
          <div className="flex gap-4 text-[12px] text-[#4d5145]">
            <span>password: {hasPassword ? "enabled" : "none"}</span>
            <span>expires: {expiresAt ? new Date(expiresAt).toLocaleString() : "never"}</span>
          </div>
          <ModalButton onClick={onCopyLink} disabled={busy}>
            Copy link
          </ModalButton>
        </div>
      ) : (
        <ModalButton onClick={onCreateOrLoad} disabled={busy} variant="primary">
          Create / Load link
        </ModalButton>
      )}

      <hr className="my-4 border-[#d4dbb8]" />

      {/* Settings */}
      <p className="text-[11px] text-[#707468] uppercase tracking-[0.5px] mb-3">
        Settings
      </p>

      <div className="space-y-3.5">
        <label className="block">
          <span className="block text-[11px] text-[#5f6358] mb-1.5">
            Expiry (7d / 24h)
          </span>
          <input
            value={expiresInput}
            onChange={(e) => setExpiresInput(e.target.value)}
            placeholder="7d"
            disabled={busy || noExpire}
            className="w-full border border-[#c8cebb] bg-white px-3 py-2 text-[12px] text-[#1c1f17] rounded-lg disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-1 focus:ring-[#6b7d3a]/20 transition-all placeholder:text-[#b5b8ad]"
           
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-[#6b7d3a]"
            checked={noExpire}
            onChange={(e) => setNoExpire(e.target.checked)}
            disabled={busy}
          />
          <span className="text-[11px] text-[#4d5145]">No expiry</span>
        </label>

        <label className="block">
          <span className="block text-[11px] text-[#5f6358] mb-1.5">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy || noPassword}
            className="w-full border border-[#c8cebb] bg-white px-3 py-2 text-[12px] text-[#1c1f17] rounded-lg disabled:opacity-45 outline-none focus:border-[#6b7d3a] focus:ring-1 focus:ring-[#6b7d3a]/20 transition-all"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-[#6b7d3a]"
            checked={noPassword}
            onChange={(e) => setNoPassword(e.target.checked)}
            disabled={busy}
          />
          <span className="text-[11px] text-[#4d5145]">Remove password</span>
        </label>

        <ModalButton onClick={onSaveSettings} disabled={busy} variant="primary">
          Save settings
        </ModalButton>
      </div>

      <hr className="my-4 border-[#d4dbb8]" />

      <ModalActions>
        <ModalButton onClick={onRotate} disabled={busy || !shareURL}>
          Rotate link
        </ModalButton>
        <ModalButton onClick={onRevoke} disabled={busy || !shareURL} variant="danger">
          Revoke
        </ModalButton>
      </ModalActions>

      {error && (
        <p className="mt-3 text-[12px] text-[#a83f32]">{error}</p>
      )}
    </Modal>
  );
}
