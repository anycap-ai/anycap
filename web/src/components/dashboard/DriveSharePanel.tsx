"use client";

import { useEffect, useState } from "react";
import { revokeDriveShare, rotateDriveShare, upsertDriveShare } from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

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

  useEffect(() => {
    setShareURL("");
    setHasPassword(false);
    setExpiresAt(null);
    setExpiresInput("");
    setNoExpire(false);
    setPassword("");
    setNoPassword(false);
    setBusy(false);
    setError("");
  }, [node?.id]);

  if (!node) return null;

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
    if (!window.confirm("Revoke this share link?")) return;
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
      // Keep silent to avoid noisy UX in unsupported environments.
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#1c1f17]/20">
      <div className="w-full max-w-[360px] h-full bg-[#f9faf5] border-l border-[#d4dbb8] p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[12px] tracking-[0.3px] text-[#5f6358]" style={mono}>
            Share
          </p>
          <button
            className="text-[12px] tracking-[0.3px] text-[#707468] hover:text-[#1c1f17]"
            style={mono}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="border border-[#d4dbb8] bg-[#f4f5f0] p-4">
          <p className="text-[13px] text-[#1c1f17] mb-1">{node.name}</p>
          <p className="text-[12px] text-[#626658]" style={mono}>
            {node.kind}
          </p>
        </div>

        <div className="mt-6 border border-[#d4dbb8] bg-[#f4f5f0] p-4 space-y-3">
          <p className="text-[12px] text-[#626658]" style={mono}>
            Share link
          </p>

          {shareURL ? (
            <div className="space-y-2">
              <a
                href={shareURL}
                target="_blank"
                rel="noreferrer"
                className="block text-[12px] text-[#1c1f17] break-all hover:text-[#6b7d3a]"
                style={mono}
              >
                {shareURL}
              </a>
              <div className="text-[12px] text-[#4d5145]" style={mono}>
                password: {hasPassword ? "enabled" : "none"}
              </div>
              <div className="text-[12px] text-[#4d5145]" style={mono}>
                expires: {expiresAt ? new Date(expiresAt).toLocaleString() : "never"}
              </div>
              <button
                className="px-2.5 py-1.5 text-[11px] border border-[#d4dbb8] text-[#1c1f17] hover:text-[#6b7d3a] rounded"
                style={mono}
                onClick={onCopyLink}
                disabled={busy}
              >
                Copy link
              </button>
            </div>
          ) : (
            <button
              className="px-3 py-2 text-[12px] border border-[#d4dbb8] text-[#1c1f17] hover:text-[#6b7d3a] rounded disabled:opacity-45"
              style={mono}
              onClick={onCreateOrLoad}
              disabled={busy}
            >
              Create / Load link
            </button>
          )}
        </div>

        <div className="mt-4 border border-[#d4dbb8] bg-[#f4f5f0] p-4 space-y-3">
          <p className="text-[12px] text-[#626658]" style={mono}>
            Settings
          </p>
          <label className="block">
            <span className="block text-[11px] text-[#707468] mb-1" style={mono}>
              Expiry (7d / 24h)
            </span>
            <input
              value={expiresInput}
              onChange={(e) => setExpiresInput(e.target.value)}
              placeholder="7d"
              disabled={busy || noExpire}
              className="w-full border border-[#d4dbb8] bg-[#fbfcf7] px-2.5 py-2 text-[12px] text-[#1c1f17] rounded disabled:opacity-45"
              style={mono}
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
            <span className="text-[11px] text-[#4d5145]" style={mono}>
              No expiry
            </span>
          </label>

          <label className="block">
            <span className="block text-[11px] text-[#707468] mb-1" style={mono}>
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy || noPassword}
              className="w-full border border-[#d4dbb8] bg-[#fbfcf7] px-2.5 py-2 text-[12px] text-[#1c1f17] rounded disabled:opacity-45"
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
            <span className="text-[11px] text-[#4d5145]" style={mono}>
              Remove password
            </span>
          </label>

          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8] text-[#1c1f17] hover:text-[#6b7d3a] rounded disabled:opacity-45"
            style={mono}
            onClick={onSaveSettings}
            disabled={busy}
          >
            Save settings
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8] text-[#1c1f17] hover:text-[#6b7d3a] rounded disabled:opacity-45"
            style={mono}
            onClick={onRotate}
            disabled={busy || !shareURL}
          >
            Rotate
          </button>
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8] text-[#a83f32] hover:opacity-80 rounded disabled:opacity-45"
            style={mono}
            onClick={onRevoke}
            disabled={busy || !shareURL}
          >
            Revoke
          </button>
        </div>

        {error && (
          <p className="mt-4 text-[12px] text-[#a83f32]" style={mono}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
