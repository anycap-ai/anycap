"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  publishPageVersion,
  unpublishPageSite,
  updatePageSite,
  usePageSite,
  usePageVersions,
} from "@/lib/api/hooks";
import type { PageAccessMode } from "@/lib/api/types";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export default function PageDetailPage() {
  const params = useParams<{ id: string }>();
  const pageID = Number(params.id);
  const validPageID = Number.isInteger(pageID) && pageID > 0 ? pageID : undefined;
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
  const [publishingVersionID, setPublishingVersionID] = useState<number | null>(null);
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

  async function onPublish(versionID: number) {
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

  const versions = versionsData?.items ?? [];
  const currentVersion = versions.find((item) => item.id === data?.current_version_id);

  return (
    <div>
      <p className="text-[12px] tracking-[0.3px] text-[#5f6358] mb-6" style={mono}>
        Page Detail
      </p>

      {isLoading ? (
        <p className="text-[13px] text-[#707468]" style={mono}>Loading...</p>
      ) : !data ? (
        <p className="text-[13px] text-[#a83f32]" style={mono}>Page not found</p>
      ) : (
        <div className="space-y-6">
          <section className="border border-[#d4dbb8]/70 bg-[#f9faf5] p-5 rounded-xl">
            <p className="text-[12px] tracking-[0.3px] text-[#5f6358] mb-4" style={mono}>
              Basic Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-[#707468] mb-1" style={mono}>Name</p>
                <p className="text-[#1c1f17]">{data.name}</p>
              </div>
              <div>
                <p className="text-[#707468] mb-1" style={mono}>URL</p>
                <a href={`https://${data.page_name}.page.anycap.cloud`} className="text-[#1c1f17] hover:text-[#6b7d3a]" style={mono} target="_blank" rel="noreferrer">
                  https://{data.page_name}.page.anycap.cloud
                </a>
              </div>
              <div>
                <p className="text-[#707468] mb-1" style={mono}>Access mode</p>
                <p className="text-[#1c1f17]" style={mono}>{data.access_mode}</p>
              </div>
              <div>
                <p className="text-[#707468] mb-1" style={mono}>Status</p>
                <p className={data.current_version_id ? "text-[#6b7d3a]" : "text-[#707468]"} style={mono}>
                  {data.current_version_id
                    ? `live (v${currentVersion?.version_no ?? "?"})`
                    : "unpublished"}
                </p>
              </div>
            </div>
          </section>

          <section className="border border-[#d4dbb8]/70 bg-[#f9faf5] p-5 rounded-xl">
            <p className="text-[12px] tracking-[0.3px] text-[#5f6358] mb-4" style={mono}>
              Settings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[12px] text-[#707468] mb-1.5" style={mono}>Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#d4dbb8]/70 bg-[#f4f5f0] px-3 py-2 text-[13px] text-[#1c1f17] rounded-lg"
                />
              </label>

              <label className="block">
                <span className="block text-[12px] text-[#707468] mb-1.5" style={mono}>Access Mode</span>
                <select
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value as PageAccessMode)}
                  className="w-full border border-[#d4dbb8]/70 bg-[#f4f5f0] px-3 py-2 text-[13px] text-[#1c1f17] rounded-lg"
                >
                  <option value="public">public</option>
                  <option value="password">password</option>
                  <option value="private_reserved">private_reserved</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                id="spa_fallback"
                type="checkbox"
                checked={spaFallback}
                onChange={(e) => setSpaFallback(e.target.checked)}
                className="accent-[#6b7d3a]"
              />
              <label htmlFor="spa_fallback" className="text-[12px] text-[#4d5145]" style={mono}>
                Enable SPA fallback
              </label>
            </div>

            {accessMode === "password" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block">
                  <span className="block text-[12px] text-[#707468] mb-1.5" style={mono}>Password (leave empty to keep current)</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#d4dbb8]/70 bg-[#f4f5f0] px-3 py-2 text-[13px] text-[#1c1f17] rounded-lg"
                  />
                </label>
                <button
                  className="px-3 py-2 text-[12px] border border-[#d4dbb8]/70 bg-[#f4f5f0] text-[#707468] hover:text-[#6b7d3a] rounded-lg"
                  style={mono}
                  onClick={onClearPassword}
                  disabled={saving}
                >
                  Clear Password
                </button>
              </div>
            )}

            <div className="mt-5">
              <button
                className="px-3 py-2 text-[12px] border border-[#d4dbb8]/70 bg-[#f4f5f0] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
                style={mono}
                onClick={onSave}
                disabled={saving}
              >
                Save Settings
              </button>
            </div>
          </section>

          <section className="border border-[#d4dbb8]/70 bg-[#f9faf5] p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <p className="text-[12px] tracking-[0.3px] text-[#5f6358]" style={mono}>
                Versions
              </p>
              <button
                className="px-3 py-2 text-[12px] border border-[#d4dbb8]/70 bg-[#f4f5f0] text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
                style={mono}
                onClick={onUnpublish}
                disabled={unpublishing || data.current_version_id == null}
              >
                {unpublishing ? "Unpublishing..." : "Unpublish"}
              </button>
            </div>

            <div className="overflow-x-auto border border-[#d4dbb8]/70 bg-[#f4f5f0] rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#d4dbb8]">
                    <th className="text-left py-3 px-3 text-[12px] text-[#626658] font-normal" style={mono}>
                      Version
                    </th>
                    <th className="text-left py-3 px-3 text-[12px] text-[#626658] font-normal" style={mono}>
                      Status
                    </th>
                    <th className="text-left py-3 px-3 text-[12px] text-[#626658] font-normal" style={mono}>
                      Created
                    </th>
                    <th className="text-right py-3 px-3 text-[12px] text-[#626658] font-normal" style={mono}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {versionsLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[12px] text-[#707468]" style={mono}>
                        Loading versions...
                      </td>
                    </tr>
                  ) : versions.length > 0 ? (
                    versions.map((version) => {
                      const isLive = data.current_version_id === version.id;
                      const publishable = version.status === "verified";
                      return (
                        <tr key={version.id} className="border-b border-[#d4dbb8]/60">
                          <td className="py-3 px-3 text-[13px] text-[#1c1f17]" style={mono}>
                            v{version.version_no}
                          </td>
                          <td className="py-3 px-3 text-[13px]" style={mono}>
                            <span className={isLive ? "text-[#6b7d3a]" : "text-[#4d5145]"}>
                              {isLive ? "published" : version.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[13px] text-[#4d5145]" style={mono}>
                            {new Date(version.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              className="px-2.5 py-1.5 text-[11px] border border-[#d4dbb8]/70 text-[#1c1f17] hover:text-[#6b7d3a] disabled:opacity-45 rounded-lg"
                              style={mono}
                              onClick={() => onPublish(version.id)}
                              disabled={!publishable || publishingVersionID != null}
                            >
                              {publishingVersionID === version.id ? "Publishing..." : "Publish"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[12px] text-[#707468]" style={mono}>
                        No versions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {error && (
            <p className="text-[12px] text-[#a83f32]" style={mono}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
