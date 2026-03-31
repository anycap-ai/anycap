"use client";

import { useState, useEffect } from "react";
import { getDriveShare, revokeDriveShare, rotateDriveShare, upsertDriveShare } from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/lib/toast";
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
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const busy = busyAction != null;
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    setShareURL("");
    setHasPassword(false);
    setExpiresAt(null);
    setExpiresInput("");
    setNoExpire(false);
    setPassword("");
    setNoPassword(false);
    setBusyAction(null);
    setLoading(false);
    setCopied(false);
  }

  // Auto-load existing share link when modal opens
  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    setLoading(true);
    getDriveShare(node.id)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setShareURL(result.url);
          setHasPassword(result.has_password);
          setExpiresAt(result.expires_at ?? null);
        }
      })
      .catch(() => {
        // ignore — no existing share
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [node]);

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

  async function onCreate() {
    if (!node) return;
    setBusyAction("create");
    try {
      const result = await upsertDriveShare(node.id, {});
      setShareURL(result.url);
      setHasPassword(result.has_password);
      setExpiresAt(result.expires_at ?? null);
      await onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create share");
    } finally {
      setBusyAction(null);
    }
  }

  async function onSaveSettings() {
    if (!node) return;
    setBusyAction("save");
    try {
      if (password.trim() !== "" && noPassword) {
        throw new Error("Password and remove password cannot be used together");
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
      toast.error(err instanceof Error ? err.message : "Failed to update share");
    } finally {
      setBusyAction(null);
    }
  }

  async function onRotate() {
    if (!node) return;
    setBusyAction("rotate");
    try {
      const result = await rotateDriveShare(node.id);
      setShareURL(result.url);
      setHasPassword(result.has_password);
      setExpiresAt(result.expires_at ?? null);
      await onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rotate share");
    } finally {
      setBusyAction(null);
    }
  }

  async function onRevoke() {
    if (!node) return;
    setBusyAction("revoke");
    try {
      await revokeDriveShare(node.id);
      setShareURL("");
      setHasPassword(false);
      setExpiresAt(null);
      setPassword("");
      setNoPassword(false);
      await onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke share");
    } finally {
      setBusyAction(null);
    }
  }

  async function onCopyLink() {
    if (!shareURL) return;
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }

  const inputClass =
    "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-45 disabled:cursor-not-allowed outline-none focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] transition-all placeholder:text-[#9a9e90]";

  return (
    <Modal open={!!node} onClose={onClose} title="Share" onOpen={handleOpen}>
      {/* File info */}
      <p className="text-[14px] text-[#1c1f17] font-medium">{node?.name}</p>
      <p className="text-[13px] text-[#7a7e71] mt-1">{node?.kind}</p>

      <hr className="my-5 border-[#dce0d2]" />

      {/* Share link section */}
      <p className="text-[13px] font-medium text-[#4d5145] mb-3">
        Share link
      </p>

      {loading ? (
        <div className="flex items-center gap-2.5 py-2">
          <Spinner size={16} className="text-[#7a7e71]" />
          <p className="text-[14px] text-[#7a7e71]">Loading...</p>
        </div>
      ) : shareURL ? (
        <div className="space-y-3">
          {/* Link display card */}
          <div className="rounded-xl border border-[#d8dcd0] bg-[#fafbf8] px-4 py-3">
            <a
              href={shareURL}
              target="_blank"
              rel="noreferrer"
              className="block text-[13px] text-[#6b7d3a] break-all hover:underline transition-colors"
            >
              {shareURL}
            </a>
          </div>

          {/* Meta info */}
          <div className="flex gap-5 text-[13px] text-[#7a7e71]">
            <span>Password: {hasPassword ? "enabled" : "none"}</span>
            <span>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : "never"}</span>
          </div>

          {/* Copy button with feedback */}
          <button
            onClick={onCopyLink}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl border border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] hover:bg-[#f0f2eb] hover:border-[#b8bdaf] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7d3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[#6b7d3a]">Copied</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy link
              </>
            )}
          </button>
        </div>
      ) : (
        <ModalButton onClick={onCreate} busy={busyAction === "create"} disabled={busy} variant="primary">
          Create share link
        </ModalButton>
      )}

      {/* Settings & actions — only shown when a share link exists */}
      {shareURL && (
        <>
          <hr className="my-5 border-[#dce0d2]" />

          <p className="text-[13px] font-medium text-[#4d5145] mb-3">
            Settings
          </p>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-[13px] text-[#7a7e71] mb-2">
                Expiry (7d / 24h)
              </span>
              <input
                value={expiresInput}
                onChange={(e) => setExpiresInput(e.target.value)}
                placeholder="7d"
                disabled={busy || noExpire}
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6b7d3a] cursor-pointer"
                checked={noExpire}
                onChange={(e) => setNoExpire(e.target.checked)}
                disabled={busy}
              />
              <span className="text-[13px] text-[#3a3e32]">No expiry</span>
            </label>

            <label className="block">
              <span className="block text-[13px] text-[#7a7e71] mb-2">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy || noPassword}
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6b7d3a] cursor-pointer"
                checked={noPassword}
                onChange={(e) => setNoPassword(e.target.checked)}
                disabled={busy}
              />
              <span className="text-[13px] text-[#3a3e32]">Remove password</span>
            </label>

            <ModalButton onClick={onSaveSettings} busy={busyAction === "save"} disabled={busy} variant="primary">
              Save settings
            </ModalButton>
          </div>

          <hr className="my-5 border-[#dce0d2]" />

          <ModalActions>
            <ModalButton onClick={onRotate} busy={busyAction === "rotate"} disabled={busy}>
              Rotate link
            </ModalButton>
            <ModalButton onClick={onRevoke} busy={busyAction === "revoke"} disabled={busy} variant="danger">
              Revoke
            </ModalButton>
          </ModalActions>
        </>
      )}

    </Modal>
  );
}
