"use client";

export const runtime = "edge";

import { useMemo, useRef, useState } from "react";
import {
  completeDriveFile,
  createDriveFolder,
  deleteDriveNode,
  presignDriveFile,
  updateDriveNode,
  useDriveNodes,
} from "@/lib/api/hooks";
import type { DriveNode } from "@/lib/api/types";
import { DriveSharePanel } from "@/components/dashboard/DriveSharePanel";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

function formatSize(size?: number) {
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

export default function DrivePage() {
  const [path, setPath] = useState<Array<{ id: number; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [shareNode, setShareNode] = useState<DriveNode | null>(null);
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

  async function onRename(node: DriveNode) {
    const next = window.prompt("New name", node.name);
    if (!next || next === node.name) return;

    setBusy(true);
    setError("");
    try {
      await updateDriveNode(node.id, { name: next });
      await mutate();
      setPath((prev) => prev.map((item) => (item.id === node.id ? { ...item, name: next } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to rename");
    } finally {
      setBusy(false);
    }
  }

  async function onMove(node: DriveNode) {
    const raw = window.prompt("Destination parent id (empty = root)");
    if (raw === null) return;

    const parentID = raw.trim() === "" ? null : Number(raw);
    if (parentID !== null && (!Number.isInteger(parentID) || parentID <= 0)) {
      window.alert("Parent id must be a positive integer");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await updateDriveNode(node.id, { parent_id: parentID });
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to move node");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(node: DriveNode) {
    const ok = window.confirm(`Delete ${node.name}?`);
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await deleteDriveNode(node.id);
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to delete node");
    } finally {
      setBusy(false);
    }
  }

  function onOpenUpload() {
    fileInputRef.current?.click();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.3px] text-[#5f6358]" style={mono}>
            Drive
          </p>
          <div className="mt-2 flex items-center gap-2 text-[13px]" style={mono}>
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

        <div className="flex items-center gap-2" style={mono}>
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8] bg-[#f9faf5] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
            onClick={onOpenUpload}
            disabled={busy || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            className="px-3 py-2 text-[12px] border border-[#d4dbb8] bg-[#f9faf5] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
            onClick={onCreateFolder}
            disabled={busy || uploading}
          >
            New Folder
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-[12px] text-[#a83f32]" style={mono}>
          {error}
        </p>
      )}

      <div className="overflow-x-auto border border-[#d4dbb8] bg-[#f9faf5]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d4dbb8]">
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Name</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Size</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Modified</th>
              <th className="text-left py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Share</th>
              <th className="text-right py-3 px-3.5 text-[12px] tracking-[0.3px] text-[#626658] font-normal" style={mono}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[13px] text-[#707468]" style={mono}>
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((node) => (
                <tr key={node.id} className="border-b border-[#d4dbb8]/60">
                  <td className="py-3 px-3.5 text-[13px] text-[#1c1f17]">
                    {node.kind === "folder" ? (
                      <button
                        className="hover:text-[#6b7d3a]"
                        onClick={() => setPath((prev) => [...prev, { id: node.id, name: node.name }])}
                      >
                        [DIR] {node.name}
                      </button>
                    ) : (
                      <span>[FILE] {node.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]" style={mono}>{formatSize(node.size)}</td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]" style={mono}>{formatTime(node.updated_at)}</td>
                  <td className="py-3 px-3.5 text-[13px] text-[#4d5145]">
                      <button
                        className="text-[#707468] hover:text-[#6b7d3a]"
                        style={mono}
                        onClick={() => setShareNode(node)}
                        disabled={busy || uploading}
                      >
                        Manage
                      </button>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-2" style={mono}>
                      <button
                        className="text-[#707468] hover:text-[#6b7d3a] disabled:opacity-45"
                        onClick={() => onRename(node)}
                        disabled={busy || uploading}
                      >
                        Rename
                      </button>
                      <button
                        className="text-[#707468] hover:text-[#6b7d3a] disabled:opacity-45"
                        onClick={() => onMove(node)}
                        disabled={busy || uploading}
                      >
                        Move
                      </button>
                      <button
                        className="text-[#a83f32] hover:opacity-80 disabled:opacity-45"
                        onClick={() => onDelete(node)}
                        disabled={busy || uploading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[13px] text-[#707468]" style={mono}>
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
    </div>
  );
}
