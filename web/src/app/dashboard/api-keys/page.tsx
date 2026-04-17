"use client";

export const runtime = "edge";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  deleteApiKey,
  disableApiKey,
  useApiKeys,
} from "@/lib/api/hooks";
import type { CreateApiKeyResult, ManagedApiKey } from "@/lib/api/types";
import { Spinner } from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatTime, timeAgo } from "@/lib/date";
import { toast } from "@/lib/toast";
import { CreateApiKeyModal } from "@/components/dashboard/CreateApiKeyModal";
import { RevealApiKeyModal } from "@/components/dashboard/RevealApiKeyModal";
import { ExtendApiKeyModal } from "@/components/dashboard/ExtendApiKeyModal";
import { RenameApiKeyModal } from "@/components/dashboard/RenameApiKeyModal";

function ExpiryCell({ expiresAt, status }: { expiresAt?: string | null; status: string }) {
  if (!expiresAt) {
    return <StatusBadge status="never expires" variant="info" />;
  }
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-[#b0b4a8]">—</span>;
  }
  const ms = date.getTime() - Date.now();
  if (status !== "active") {
    return (
      <span className="text-[13px] text-[#7a7e71]" title={date.toLocaleString()}>
        {date.toLocaleDateString()}
      </span>
    );
  }
  if (ms <= 0) {
    return <StatusBadge status="expired" variant="error" />;
  }
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  const variant = days <= 7 ? "error" : days <= 30 ? "info" : "neutral";
  return (
    <span title={date.toLocaleString()}>
      <StatusBadge
        status={days <= 1 ? "expires today" : `expires in ${days}d`}
        variant={variant}
      />
    </span>
  );
}

function ActionsMenu({
  apiKey,
  onRename,
  onExtend,
  onDisable,
  onDelete,
}: {
  apiKey: ManagedApiKey;
  onRename: () => void;
  onExtend: () => void;
  onDisable: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right });
    }
    setOpen((v) => !v);
  }

  function act(fn: () => void) {
    setOpen(false);
    fn();
  }

  const isActive = apiKey.status === "active";

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        className="p-1.5 rounded-lg text-[#7a7e71] hover:text-[#1c1f17] hover:bg-[#eceee7] transition-colors"
        onClick={toggle}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-44 bg-white border border-[#d8dcd0] rounded-xl shadow-lg py-1"
            style={{ top: pos.top, left: pos.left, transform: "translateX(-100%)" }}
          >
            <button
              className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#1c1f17] hover:bg-[#f7f8f5] transition-colors"
              onClick={() => act(onRename)}
            >
              Rename
            </button>
            {isActive && (
              <button
                className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#1c1f17] hover:bg-[#f7f8f5] transition-colors"
                onClick={() => act(onExtend)}
              >
                Renew expiry
              </button>
            )}
            {isActive && (
              <button
                className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#a83a26] hover:bg-[#fdf2ef] transition-colors"
                onClick={() => act(onDisable)}
              >
                Disable
              </button>
            )}
            <button
              className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#a83a26] hover:bg-[#fdf2ef] transition-colors"
              onClick={() => act(onDelete)}
            >
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function ApiKeysPage() {
  const { data, isLoading, mutate } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);
  const [reveal, setReveal] = useState<{ rawKey: string; name: string } | null>(null);
  const [renameKey, setRenameKey] = useState<ManagedApiKey | null>(null);
  const [extendKey, setExtendKey] = useState<ManagedApiKey | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);

  async function handleCreated(result: CreateApiKeyResult) {
    setCreateOpen(false);
    setReveal({ rawKey: result.raw_key, name: result.api_key.name });
    await mutate();
  }

  async function handleDisable(apiKey: ManagedApiKey) {
    if (!window.confirm(`Disable "${apiKey.name}"? Existing sessions using this key will fail.`)) {
      return;
    }
    setPendingId(apiKey.id);
    try {
      await disableApiKey(apiKey.id);
      await mutate();
      toast.info(`Disabled ${apiKey.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable API key");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(apiKey: ManagedApiKey) {
    if (
      !window.confirm(
        `Delete "${apiKey.name}"? This is permanent. The key will stop working immediately.`,
      )
    ) {
      return;
    }
    setPendingId(apiKey.id);
    try {
      await deleteApiKey(apiKey.id);
      await mutate();
      toast.info(`Deleted ${apiKey.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete API key");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-9 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1c1f17] tracking-tight">API keys</h1>
          <p className="mt-2 text-[14px] text-[#7a7e71] max-w-[640px] leading-[1.6]">
            Manage long-lived API keys for programmatic access. The CLI manages its own key via{" "}
            <code className="text-[13px] text-[#3a3e32]">anycap login</code> and is shown here as{" "}
            <code className="text-[13px] text-[#3a3e32]">cli</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-[#7a7e71] hover:text-[#1c1f17] hover:bg-[#eceee7] transition-colors disabled:opacity-40"
            onClick={async () => {
              setRefreshing(true);
              await Promise.all([mutate(), new Promise((r) => setTimeout(r, 400))]);
              setRefreshing(false);
            }}
            disabled={refreshing}
            title="Refresh"
          >
            <svg
              className={refreshing ? "animate-spin" : ""}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#6b7d3a] hover:bg-[#5c6c31] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors"
            onClick={() => setCreateOpen(true)}
          >
            New key
          </button>
        </div>
      </div>

      <div className="border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71] rounded-tl-2xl">
                Name
              </th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Prefix</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Status</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Expiry</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Last used</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Created</th>
              <th className="text-right py-3.5 px-5 text-[13px] font-medium text-[#7a7e71] rounded-tr-2xl">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eceee7]">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="py-[15px] px-5">
                      <div className="h-5 w-full bg-[#d0d4c8]/40 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((apiKey) => {
                const isCli = apiKey.name === "cli";
                return (
                  <tr
                    key={apiKey.id}
                    className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors"
                  >
                    <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{apiKey.name}</span>
                        {isCli && (
                          <span
                            className="text-[11px] px-2 py-[2px] rounded-md bg-[#eceee7] text-[#7a7e71]"
                            title="Managed by `anycap login`"
                          >
                            CLI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-[15px] px-5 text-[13px] font-mono text-[#4d5145]">
                      {apiKey.key_prefix || "—"}
                    </td>
                    <td className="py-[15px] px-5">
                      <StatusBadge
                        status={apiKey.status}
                        variant={apiKey.status === "active" ? "success" : "muted"}
                      />
                    </td>
                    <td className="py-[15px] px-5">
                      <ExpiryCell expiresAt={apiKey.expires_at} status={apiKey.status} />
                    </td>
                    <td
                      className="py-[15px] px-5 text-[13px] text-[#4d5145]"
                      title={apiKey.last_used_at ? formatTime(apiKey.last_used_at) : ""}
                    >
                      {apiKey.last_used_at ? timeAgo(apiKey.last_used_at) : "—"}
                    </td>
                    <td className="py-[15px] px-5 text-[13px] text-[#4d5145]">
                      {formatTime(apiKey.created_at)}
                    </td>
                    <td className="py-[15px] px-5 text-right">
                      {pendingId === apiKey.id ? (
                        <Spinner size={14} />
                      ) : (
                        <ActionsMenu
                          apiKey={apiKey}
                          onRename={() => setRenameKey(apiKey)}
                          onExtend={() => setExtendKey(apiKey)}
                          onDisable={() => handleDisable(apiKey)}
                          onDelete={() => handleDelete(apiKey)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[14px] text-[#7a7e71]">
                  No API keys yet. Click <span className="text-[#1c1f17]">New key</span> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateApiKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <RevealApiKeyModal
        rawKey={reveal?.rawKey ?? null}
        name={reveal?.name}
        onClose={() => setReveal(null)}
      />
      <RenameApiKeyModal
        apiKey={renameKey}
        onClose={() => setRenameKey(null)}
        onChanged={() => mutate()}
      />
      <ExtendApiKeyModal
        apiKey={extendKey}
        onClose={() => setExtendKey(null)}
        onChanged={() => mutate()}
      />
    </div>
  );
}
