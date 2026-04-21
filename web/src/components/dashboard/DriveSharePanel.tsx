"use client";

import { useState, useEffect } from "react";
import { getDriveShare, revokeDriveShare, rotateDriveShare, upsertDriveShare } from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/lib/toast";
import { Modal, ModalActions, ModalButton } from "@/components/ui/Modal";
import { formatTime } from "@/lib/date";

function MetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dde0e6] bg-[#f8f8fa] px-3 py-1.5 text-[12px] text-[#4d5145]">
      <span className="text-[#7a7e71]">{label}</span>
      <span className="font-medium text-[#1c1f17]">{value}</span>
    </span>
  );
}

function SectionTitle({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-[13px] font-medium text-[#4d5145]">{title}</p>
      {body ? (
        <p className="mt-1 text-[12px] leading-[1.6] text-[#7a7e71]">{body}</p>
      ) : null}
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<"link" | "settings" | "controls">("link");

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
    setActiveTab("link");
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
      setActiveTab("link");
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
      setActiveTab("link");
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
      setActiveTab("link");
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
    "w-full rounded-xl border border-[#d6dae2] bg-[#fbfbfd] px-4 py-2.5 text-[14px] text-[#1c1f17] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#9a9e90] outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:border-[#aeb4c0] focus:ring-2 focus:ring-[rgba(134,142,156,0.16)]";

  return (
    <Modal open={!!node} onClose={onClose} title="Share" onOpen={handleOpen} panelClassName="bg-white max-w-[560px]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#e1e3e8] bg-[#fbfbfd] px-4 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-[#1c1f17]">{node?.name}</p>
              <p className="mt-1 text-[13px] capitalize text-[#7a7e71]">{node?.kind}</p>
            </div>
            {shareURL ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dde0e6] bg-[#f3f4f7] px-3 py-1.5 text-[12px] font-medium text-[#454a54]">
                Active share
              </span>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2.5 py-2">
            <Spinner size={16} className="text-[#7a7e71]" />
            <p className="text-[14px] text-[#7a7e71]">Loading share settings...</p>
          </div>
        ) : shareURL ? (
          <>
            <div className="inline-flex rounded-2xl border border-[#dde0e6] bg-[#f3f4f7] p-1">
              {[
                { id: "link" as const, label: "Share link" },
                { id: "settings" as const, label: "Settings" },
                { id: "controls" as const, label: "Controls" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-[0.9rem] px-3.5 py-2 text-[12px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-[#1c1f17] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-[#6b6f78] hover:text-[#3a3e32]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "link" ? (
              <div className="rounded-2xl border border-[#e1e3e8] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <SectionTitle
                  title="Share link"
                  body="Copy the active link or open it in a new tab."
                />
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#e1e2e6] bg-[#f8f8fa] px-4 py-3">
                    <a
                      href={shareURL}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-[13px] text-[#353941] hover:underline transition-colors"
                    >
                      {shareURL}
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MetaPill label="Password" value={hasPassword ? "Enabled" : "None"} />
                    <MetaPill label="Expires" value={expiresAt ? formatTime(expiresAt) : "Never"} />
                  </div>
                  <button
                    onClick={onCopyLink}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d6dae2] bg-[#fbfbfd] px-5 py-2.5 text-[13px] font-medium text-[#3a3e32] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:border-[#b8bdaf] hover:bg-[#f3f4f7] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b616d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[#454a54]">Copied</span>
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
              </div>
            ) : null}

            {activeTab === "settings" ? (
              <div className="rounded-2xl border border-[#e1e3e8] bg-[#fcfcfd] px-4 py-4">
                <SectionTitle
                  title="Advanced settings"
                  body="Adjust expiry or password before saving a new share configuration."
                />

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="block">
                      <span className="mb-2 block text-[13px] text-[#7a7e71]">
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

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#e1e2e6] bg-[#fbfbfd] px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-[#868e9c]"
                        checked={noExpire}
                        onChange={(e) => setNoExpire(e.target.checked)}
                        disabled={busy}
                      />
                      <span className="text-[13px] text-[#3a3e32]">No expiry</span>
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="block">
                      <span className="mb-2 block text-[13px] text-[#7a7e71]">
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

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#e1e2e6] bg-[#fbfbfd] px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-[#868e9c]"
                        checked={noPassword}
                        onChange={(e) => setNoPassword(e.target.checked)}
                        disabled={busy}
                      />
                      <span className="text-[13px] text-[#3a3e32]">Remove password</span>
                    </label>
                  </div>

                  <ModalButton onClick={onSaveSettings} busy={busyAction === "save"} disabled={busy} variant="primary">
                    Save settings
                  </ModalButton>
                </div>
              </div>
            ) : null}

            {activeTab === "controls" ? (
              <div className="rounded-2xl border border-[#e8d8d4] bg-[#fffaf9] px-4 py-3.5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#4d5145]">Link controls</p>
                    <p className="mt-1 text-[12px] leading-[1.6] text-[#7a7e71]">Rotate to issue a new URL or revoke the current share.</p>
                  </div>
                </div>
                <ModalActions>
                  <ModalButton onClick={onRotate} busy={busyAction === "rotate"} disabled={busy}>
                    Rotate link
                  </ModalButton>
                  <ModalButton onClick={onRevoke} busy={busyAction === "revoke"} disabled={busy} variant="danger">
                    Revoke
                  </ModalButton>
                </ModalActions>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-[#d8dcd0] bg-[#fcfcfa] px-4 py-4">
            <SectionTitle
              title="Create share link"
              body="Generate a public link for this file, then optionally add expiry or password protection."
            />
            <ModalButton onClick={onCreate} busy={busyAction === "create"} disabled={busy} variant="primary">
              Create share link
            </ModalButton>
          </div>
        )}
      </div>
    </Modal>
  );
}
