"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createPagePreviewHost,
  publishPageVersion,
  unpublishPageSite,
  updatePageSite,
  usePageSite,
  usePageVersions,
} from "@/lib/api/hooks";
import type { PageAccessMode } from "@/lib/api/types";


/* ── Shared button styles ── */
const btnPrimary =
  "px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all bg-[#6b7d3a] text-white hover:bg-[#5c6c31] active:bg-[#4f5d2a] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] disabled:bg-[#c5ccb8] disabled:text-white/70 disabled:shadow-none disabled:cursor-not-allowed";
const btnSecondary =
  "px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all border border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32] hover:bg-[#f0f2eb] hover:border-[#b8bdaf] active:bg-[#e8ebe2] shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:border-[#e5e8df] disabled:bg-[#f5f6f3] disabled:text-[#b0b4a8] disabled:shadow-none disabled:cursor-not-allowed";

const cardClass =
  "border border-[#d8dcd0] bg-white p-7 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]";

const inputClass =
  "w-full border border-[#ccd1c3] bg-[#fafbf8] px-4 py-2.5 text-[14px] text-[#1c1f17] rounded-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:border-[#6b7d3a] focus:ring-2 focus:ring-[rgba(107,125,58,0.15)] outline-none transition-all";


export default function PageDetailPage() {
  const params = useParams<{ id: string }>();
  const validPageID = params.id?.trim() ? params.id : undefined;
  const { data, isLoading, mutate } = usePageSite(validPageID);
  const {
    data: versionsData,
    isLoading: versionsLoading,
    mutate: mutateVersions,
  } = usePageVersions(validPageID);

  const [name, setName] = useState("");
  const [accessMode, setAccessMode] = useState<PageAccessMode>("public");
  const [spaFallback, setSpaFallback] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishingVersionID, setPublishingVersionID] = useState<string | null>(null);
  const [previewingVersionID, setPreviewingVersionID] = useState<string | null>(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setAccessMode(data.access_mode);
    setSpaFallback(data.spa_fallback);
    setPassword("");
  }, [data]);

  async function onSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const patch: Record<string, unknown> = {
        name,
        access_mode: accessMode,
        spa_fallback: spaFallback,
      };
      if (accessMode === "password" && password.trim() !== "") {
        patch.password = password.trim();
      }
      if (accessMode === "public") {
        patch.no_password = true;
      }

      await updatePageSite(data.id, patch);
      setPassword("");
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function onClearPassword() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await updatePageSite(data.id, { no_password: true });
      setPassword("");
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to clear password");
    } finally {
      setSaving(false);
    }
  }

  async function onPublish(versionID: string) {
    if (!data) return;
    setPublishingVersionID(versionID);
    setError("");
    try {
      await publishPageVersion(data.id, versionID);
      await Promise.all([mutate(), mutateVersions()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to publish version");
    } finally {
      setPublishingVersionID(null);
    }
  }

  async function onUnpublish() {
    if (!data || data.current_version_id == null) return;
    if (!window.confirm("Unpublish current live version?")) return;
    setUnpublishing(true);
    setError("");
    try {
      await unpublishPageSite(data.id);
      await Promise.all([mutate(), mutateVersions()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to unpublish");
    } finally {
      setUnpublishing(false);
    }
  }

  async function onPreview(versionID: string) {
    if (!data) return;
    setPreviewingVersionID(versionID);
    setError("");
    try {
      const result = await createPagePreviewHost(data.id, versionID);
      window.open(result.preview_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to preview version");
    } finally {
      setPreviewingVersionID(null);
    }
  }

  const versions = versionsData?.items ?? [];
  const currentVersion = versions.find((item) => item.id === data?.current_version_id);
  const pageUrl = data?.page_url;

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-40 bg-[#e5e7e0] rounded-lg animate-pulse mb-9" />
        <div className="space-y-7">
          <div className={cardClass}>
            <div className="h-4 w-24 bg-[#e5e7e0] rounded animate-pulse mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-16 bg-[#eceee7] rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-[#e5e7e0] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className={cardClass}>
            <div className="h-4 w-20 bg-[#e5e7e0] rounded animate-pulse mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-10 bg-[#eceee7] rounded-xl animate-pulse" />
              <div className="h-10 bg-[#eceee7] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1c1f17] mb-9 tracking-tight">
        Page Detail
      </h1>

      {!data ? (
        <p className="text-[14px] text-[#c4442d]">Page not found</p>
      ) : (
        <div className="space-y-7">
          <section className={cardClass}>
            <p className="text-[14px] font-semibold text-[#4d5145] mb-5">
              Basic Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[14px]">
              <div>
                <p className="text-[#7a7e71] mb-1.5">Name</p>
                <p className="text-[#1c1f17] font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-[#7a7e71] mb-1.5">URL</p>
                {pageUrl ? (
                  <a href={pageUrl} className="text-[#1c1f17] hover:text-[#6b7d3a] underline underline-offset-2 decoration-[#ccd1c3] hover:decoration-[#6b7d3a] transition-colors" target="_blank" rel="noreferrer">
                    {pageUrl}
                  </a>
                ) : (
                  <span className="text-[#b0b4a8]">—</span>
                )}
              </div>
              <div>
                <p className="text-[#7a7e71] mb-1.5">Access mode</p>
                <p className="text-[#1c1f17]">{data.access_mode}</p>
              </div>
              <div>
                <p className="text-[#7a7e71] mb-1.5">Status</p>
                <p className={`font-medium ${data.current_version_id ? "text-[#6b7d3a]" : "text-[#7a7e71]"}`}>
                  {data.current_version_id
                    ? `live (v${currentVersion?.version_no ?? "?"})`
                    : "unpublished"}
                </p>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <p className="text-[14px] font-semibold text-[#4d5145] mb-5">
              Settings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block">
                <span className="block text-[13px] text-[#7a7e71] mb-2">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </label>

              <label className="block">
                <span className="block text-[13px] text-[#7a7e71] mb-2">Access Mode</span>
                <select
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value as PageAccessMode)}
                  className={inputClass}
                >
                  <option value="public">public</option>
                  <option value="password">password</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <input
                id="spa_fallback"
                type="checkbox"
                checked={spaFallback}
                onChange={(e) => setSpaFallback(e.target.checked)}
                className="accent-[#6b7d3a] w-4 h-4"
              />
              <label htmlFor="spa_fallback" className="text-[13px] text-[#4d5145]">
                Enable SPA fallback
              </label>
            </div>

            {accessMode === "password" && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block">
                  <span className="block text-[13px] text-[#7a7e71] mb-2">Password (leave empty to keep current)</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                </label>
                <button className={btnSecondary} onClick={onClearPassword} disabled={saving}>
                  Clear Password
                </button>
              </div>
            )}

            <div className="mt-6">
              <button className={btnPrimary} onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <p className="text-[14px] font-semibold text-[#4d5145]">
                Versions
              </p>
              <button
                className={btnSecondary}
                onClick={onUnpublish}
                disabled={unpublishing || data.current_version_id == null}
              >
                {unpublishing ? "Unpublishing..." : "Unpublish"}
              </button>
            </div>

            <div className="overflow-x-auto border border-[#d8dcd0] bg-white rounded-2xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f4f5f1] border-b border-[#e0e3da]">
                    <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#6b7068]">Version</th>
                    <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#6b7068]">Status</th>
                    <th className="text-left py-3.5 px-5 text-[13px] font-medium text-[#6b7068]">Created</th>
                    <th className="text-right py-3.5 px-5 text-[13px] font-medium text-[#6b7068]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {versionsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#eceee7]">
                        {[0, 1, 2, 3].map((j) => (
                          <td key={j} className="py-[15px] px-5">
                            <div className="h-5 w-full bg-[#d0d4c8]/40 animate-pulse rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : versions.length > 0 ? (
                    versions.map((version) => {
                      const isLive = data.current_version_id === version.id;
                      const publishable = version.status === "verified" || version.status === "archived";
                      const canPublish = publishable && publishingVersionID == null;
                      const canOpen = isLive && !!pageUrl;
                      const canPreview = version.status === "verified" || version.status === "published" || version.status === "archived" || isLive;
                      return (
                        <tr key={version.id} className="border-b border-[#eceee7] hover:bg-[#f9faf7] transition-colors">
                          <td className="py-[15px] px-5 text-[14px] text-[#1c1f17] font-medium">v{version.version_no}</td>
                          <td className="py-[15px] px-5 text-[14px]">
                            <span className={`font-medium ${isLive ? "text-[#6b7d3a]" : "text-[#4d5145]"}`}>
                              {isLive ? "published" : version.status}
                            </span>
                          </td>
                          <td className="py-[15px] px-5 text-[14px] text-[#4d5145]">
                            {new Date(version.created_at).toLocaleString()}
                          </td>
                          <td className="py-[15px] px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              {canOpen && (
                                <a
                                  href={pageUrl!}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={btnSecondary}
                                >
                                  Open
                                </a>
                              )}
                              {canPreview && (
                                <button
                                  className={btnSecondary}
                                  onClick={() => onPreview(version.id)}
                                  disabled={previewingVersionID != null}
                                >
                                  {previewingVersionID === version.id ? "Opening..." : "Preview"}
                                </button>
                              )}
                              <button
                                className={canPublish ? btnPrimary : `${btnSecondary} !shadow-none`}
                                onClick={() => onPublish(version.id)}
                                disabled={!canPublish}
                              >
                                {publishingVersionID === version.id ? "Publishing..." : "Publish"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[14px] text-[#7a7e71]">No versions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {error && <p className="text-[13px] text-[#c4442d]">{error}</p>}
        </div>
      )}
    </div>
  );
}
