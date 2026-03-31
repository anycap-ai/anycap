"use client";

export const runtime = "edge";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createDriveAccessLinks,
  useDriveNodes,
} from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { FolderIcon, FileIcon } from "@/components/dashboard/DriveIcons";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/lib/toast";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { DriveSharePanel } from "@/components/dashboard/DriveSharePanel";
import { DriveRenameModal } from "@/components/dashboard/DriveRenameModal";
import { DriveMoveModal } from "@/components/dashboard/DriveMoveModal";
import { DriveDeleteModal } from "@/components/dashboard/DriveDeleteModal";


function formatSize(size?: number | null) {
  if (size == null) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function MoreMenu({
  onRename,
  onMove,
  disabled,
}: {
  onRename: () => void;
  onMove: () => void;
  disabled?: boolean;
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
      ) return;
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

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        className="p-1.5 rounded-lg text-[#7a7e71] hover:text-[#1c1f17] hover:bg-[#eceee7] transition-colors disabled:opacity-40"
        onClick={toggle}
        disabled={disabled}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-32 bg-white border border-[#d8dcd0] rounded-xl shadow-lg py-1"
          style={{ top: pos.top, left: pos.left, transform: "translateX(-100%)" }}
        >
          <button className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#1c1f17] hover:bg-[#f7f8f5] transition-colors" onClick={() => act(onRename)}>Rename</button>
          <button className="w-full text-left px-3.5 py-2.5 text-[13px] text-[#1c1f17] hover:bg-[#f7f8f5] transition-colors" onClick={() => act(onMove)}>Move</button>
        </div>,
        document.body
      )}
    </div>
  );
}

function ActionLink({
  onClick,
  disabled,
  busy,
  variant = "default",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] rounded-lg transition-colors disabled:opacity-40 ${
        variant === "danger"
          ? "text-[#c4442d] hover:bg-[#c4442d]/10"
          : "text-[#7a7e71] hover:bg-[#eceee7] hover:text-[#1c1f17]"
      }`}
      onClick={onClick}
      disabled={disabled || busy}
    >
      {busy && <Spinner size={13} />}
      {children}
    </button>
  );
}

export default function DrivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const folderIds = useMemo<string[]>(() => {
    const raw = searchParams.get("path");
    if (!raw) return [];
    return raw.split(",").filter(Boolean);
  }, [searchParams]);

  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  const navigateTo = useCallback((ids: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (ids.length === 0) {
      params.delete("path");
    } else {
      params.set("path", ids.join(","));
    }
    const qs = params.toString();
    router.push(`/dashboard/drive${qs ? `?${qs}` : ""}`);
  }, [searchParams, router]);

  const enterFolder = useCallback((id: string, name: string) => {
    setNameMap((prev) => ({ ...prev, [id]: name }));
    navigateTo([...folderIds, id]);
  }, [folderIds, navigateTo]);

  const [busyAction, setBusyAction] = useState<{ nodeId: string; type: "preview" | "download" } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shareNode, setShareNode] = useState<DriveNode | null>(null);
  const [renameNode, setRenameNode] = useState<DriveNode | null>(null);
  const [moveNode, setMoveNode] = useState<DriveNode | null>(null);
  const [deleteNode, setDeleteNode] = useState<DriveNode | null>(null);

  const currentParentID = folderIds.length > 0 ? folderIds[folderIds.length - 1] : null;
  const { data, isLoading, mutate } = useDriveNodes(currentParentID);

  const rows = useMemo(() => data?.items ?? [], [data]);

  function handleRenameClose() {
    setRenameNode(null);
  }

  async function handleRenamed() {
    await mutate();
    const renamed = renameNode;
    if (renamed) {
      setNameMap((prev) => ({ ...prev, [renamed.id]: renamed.name }));
    }
  }

  async function openDrivePreview(node: DriveNode) {
    if (node.kind !== "file") return;
    setBusyAction({ nodeId: node.id, type: "preview" });
    try {
      const links = await createDriveAccessLinks(node.id);
      window.open(links.preview_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open preview");
    } finally {
      setBusyAction(null);
    }
  }

  async function downloadDriveFile(node: DriveNode) {
    if (node.kind !== "file") return;
    setBusyAction({ nodeId: node.id, type: "download" });
    try {
      const links = await createDriveAccessLinks(node.id);
      window.open(links.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-9 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1c1f17] tracking-tight">
            Drive
          </h1>
          <div className="mt-2.5 flex items-center gap-2 text-[14px]">
            <button
              className="text-[#1c1f17] hover:text-[#6b7d3a]"
              onClick={() => navigateTo([])}
            >
              /
            </button>
            {folderIds.map((id, idx) => (
              <div key={id} className="flex items-center gap-2">
                {idx > 0 && <span className="text-[#7a7e71]">/</span>}
                <button
                  className="text-[#1c1f17] hover:text-[#6b7d3a]"
                  onClick={() => navigateTo(folderIds.slice(0, idx + 1))}
                >
                  {nameMap[id] ?? id}
                </button>
              </div>
            ))}
          </div>
        </div>

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
          <svg className={refreshing ? "animate-spin" : ""} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>

      <div className="border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71] rounded-tl-2xl">Name</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Status</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Size</th>
              <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#7a7e71]">Modified</th>
              <th className="text-right py-3.5 px-5 text-[13px] font-medium text-[#7a7e71] rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eceee7]">
                  <td className="py-[15px] px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-5 bg-[#d0d4c8]/40 animate-pulse rounded" />
                      <div className="h-5 w-32 bg-[#d0d4c8]/40 animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="py-[15px] px-5">
                    <div className="h-5 w-14 bg-[#d0d4c8]/40 animate-pulse rounded" />
                  </td>
                  <td className="py-[15px] px-5">
                    <div className="h-5 w-16 bg-[#d0d4c8]/40 animate-pulse rounded" />
                  </td>
                  <td className="py-[15px] px-5">
                    <div className="h-5 w-28 bg-[#d0d4c8]/40 animate-pulse rounded" />
                  </td>
                  <td className="py-[15px] px-5">
                    <div className="h-5 w-24 bg-[#d0d4c8]/40 animate-pulse rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : rows.length > 0 || folderIds.length > 0 ? (
              <>
              {folderIds.length > 0 && (
                <tr className="border-b border-[#eceee7] hover:bg-[#fafbf8] transition-colors">
                  <td colSpan={5} className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
                    <button
                      className="flex items-center gap-2.5 hover:text-[#6b7d3a] transition-colors"
                      onClick={() => navigateTo(folderIds.slice(0, -1))}
                    >
                      <FolderIcon className="text-[#7a7e71] shrink-0" />
                      ..
                    </button>
                  </td>
                </tr>
              )}
              {rows.map((node) => {
                const nodeBusy = busyAction?.nodeId === node.id ? busyAction.type : null;
                return (
                <tr key={node.id} className={`border-b border-[#eceee7] transition-colors ${nodeBusy ? "bg-[#f5f7f0]" : "hover:bg-[#fafbf8]"}`}>
                  <td className="py-[15px] px-5 text-[14px] text-[#1c1f17]">
                    {node.kind === "folder" ? (
                      <button
                        className="flex items-center gap-2.5 hover:text-[#6b7d3a] transition-colors"
                        onClick={() => enterFolder(node.id, node.name)}
                      >
                        <FolderIcon className="text-[#7a7e71] shrink-0" />
                        {node.name}
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2.5 hover:text-[#6b7d3a] transition-colors"
                        onClick={() => { void openDrivePreview(node); }}
                        disabled={busyAction != null}
                      >
                        {nodeBusy === "preview" ? (
                          <Spinner size={16} className="text-[#6b7d3a]" />
                        ) : (
                          <FileIcon name={node.name} className="text-[#7a7e71] shrink-0" />
                        )}
                        {node.name}
                      </button>
                    )}
                  </td>
                  <td className="py-[15px] px-5 text-[14px]">
                    <StatusBadge status={node.has_share ? "Shared" : "Private"} />
                  </td>
                  <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">{formatSize(node.size)}</td>
                  <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">{formatTime(node.updated_at)}</td>
                  <td className="py-[15px] px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {node.kind === "file" && (
                        <ActionLink onClick={() => { void downloadDriveFile(node); }} disabled={busyAction != null} busy={nodeBusy === "download"}>
                          Download
                        </ActionLink>
                      )}
                      <ActionLink onClick={() => setShareNode(node)} disabled={busyAction != null}>
                        Share
                      </ActionLink>
                      <ActionLink onClick={() => setDeleteNode(node)} disabled={busyAction != null} variant="danger">
                        Delete
                      </ActionLink>
                      <MoreMenu
                        onRename={() => setRenameNode(node)}
                        onMove={() => setMoveNode(node)}
                        disabled={busyAction != null}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
              </>
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[14px] text-[#7a7e71]">
                  Empty folder
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DriveSharePanel
        node={shareNode}
        onClose={() => setShareNode(null)}
        onChanged={mutate}
      />
      <DriveRenameModal
        node={renameNode}
        onClose={handleRenameClose}
        onChanged={handleRenamed}
      />
      <DriveMoveModal
        node={moveNode}
        onClose={() => setMoveNode(null)}
        onChanged={mutate}
      />
      <DriveDeleteModal
        node={deleteNode}
        onClose={() => setDeleteNode(null)}
        onChanged={mutate}
      />
    </div>
  );
}
