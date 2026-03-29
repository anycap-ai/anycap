"use client";

export const runtime = "edge";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  completeDriveFile,
  createDriveFolder,
  presignDriveFile,
  useDriveNodes,
} from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { FolderIcon, FileIcon } from "@/components/dashboard/DriveIcons";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function act(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        className="p-1.5 rounded-md text-[#9a9e90] hover:text-[#3a3e32] hover:bg-[#d4dbb8]/40 transition-colors disabled:opacity-40"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white border border-[#d4dbb8] rounded-lg shadow-lg py-1">
          <button className="w-full text-left px-3 py-2 text-[13px] text-[#3a3e32] hover:bg-[#f4f5f0] transition-colors" onClick={() => act(onRename)}>Rename</button>
          <button className="w-full text-left px-3 py-2 text-[13px] text-[#3a3e32] hover:bg-[#f4f5f0] transition-colors" onClick={() => act(onMove)}>Move</button>
        </div>
      )}
    </div>
  );
}

function ActionLink({
  onClick,
  disabled,
  variant = "default",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      className={`px-2 py-1 text-[12px] rounded-md transition-colors disabled:opacity-40 ${
        variant === "danger"
          ? "text-[#a83f32] hover:bg-[#a83f32]/10"
          : "text-[#707468] hover:bg-[#d4dbb8]/40 hover:text-[#3a3e32]"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function DrivePage() {
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [shareNode, setShareNode] = useState<DriveNode | null>(null);
  const [renameNode, setRenameNode] = useState<DriveNode | null>(null);
  const [moveNode, setMoveNode] = useState<DriveNode | null>(null);
  const [deleteNode, setDeleteNode] = useState<DriveNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentParentID = path.length > 0 ? path[path.length - 1].id : null;
  const { data, isLoading, mutate } = useDriveNodes(currentParentID);

  const rows = useMemo(() => data?.items ?? [], [data]);

  async function onCreateFolder() {
    const name = window.prompt("Folder name");
    if (!name) return;

    setBusy(true);
    setError("");
    try {
      await createDriveFolder({
        name,
        parent_id: currentParentID,
      });
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to create folder");
    } finally {
      setBusy(false);
    }
  }

  async function onUploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const contentType = file.type || "application/octet-stream";
      const presign = await presignDriveFile({
        parent_id: currentParentID,
        name: file.name,
        content_type: contentType,
        content_length: file.size,
      });

      const uploadResp = await fetch(presign.upload_url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResp.ok) {
        throw new Error(`upload failed (${uploadResp.status})`);
      }

      await completeDriveFile({
        upload_session_id: presign.upload_session_id,
        file_id: presign.file_id,
      });
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  function handleRenameClose() {
    setRenameNode(null);
  }

  async function handleRenamed() {
    await mutate();
    const renamed = renameNode;
    if (renamed) {
      setPath((prev) => prev.map((item) => (item.id === renamed.id ? { ...item, name: renamed.name } : item)));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[16px] font-medium text-[#1c1f17]">
            Drive
          </p>
          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <button
              className="text-[#1c1f17] hover:text-[#6b7d3a]"
              onClick={() => setPath([])}
            >
              /
            </button>
            {path.map((segment, idx) => (
              <div key={segment.id} className="flex items-center gap-2">
                <span className="text-[#9a9e90]">/</span>
                <button
                  className="text-[#1c1f17] hover:text-[#6b7d3a]"
                  onClick={() => setPath(path.slice(0, idx + 1))}
                >
                  {segment.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8]/70 bg-[#f9faf5] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8]/70 bg-[#f9faf5] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
            onClick={onCreateFolder}
            disabled={busy || uploading}
          >
            New Folder
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-[12px] text-[#a83f32]">
          {error}
        </p>
      )}

      <div className="border border-[#d4dbb8]/70 bg-[#f9faf5] rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal">Name</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal">Size</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal">Modified</th>
              <th className="text-right py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-[13px] text-[#707468]">
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((node) => (
                <tr key={node.id} className="border-b border-[#d4dbb8]/60">
                  <td className="py-3 px-3.5 text-[13px] text-[#1c1f17]">
                    {node.kind === "folder" ? (
                      <button
                        className="flex items-center gap-2 hover:text-[#6b7d3a] transition-colors"
                        onClick={() => setPath((prev) => [...prev, { id: node.id, name: node.name }])}
                      >
                        <FolderIcon className="text-[#9a9e90] shrink-0" />
                        {node.name}
                      </button>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FileIcon name={node.name} className="text-[#9a9e90] shrink-0" />
                        {node.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]">{formatSize(node.size)}</td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]">{formatTime(node.updated_at)}</td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <ActionLink onClick={() => setShareNode(node)} disabled={busy || uploading}>
                        Share
                      </ActionLink>
                      <ActionLink onClick={() => setDeleteNode(node)} disabled={busy || uploading} variant="danger">
                        Delete
                      </ActionLink>
                      <MoreMenu
                        onRename={() => setRenameNode(node)}
                        onMove={() => setMoveNode(node)}
                        disabled={busy || uploading}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-10 text-center text-[13px] text-[#707468]">
                  Empty folder
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onUploadFile(file);
          }
          event.target.value = "";
        }}
      />

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
