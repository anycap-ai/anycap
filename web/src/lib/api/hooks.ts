"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { anycapDelete, anycapGet, anycapPatch, anycapPost, anycapPut } from "./client";
import type {
  Balance,
  DashboardSummary,
  DriveFilePresignResult,
  DriveNode,
  DriveNodeListResult,
  DriveShareView,
  LogsResult,
  PageVersion,
  PageVersionListResult,
  PageVersionPresignResult,
  PageSite,
  PageSiteListResult,
  User,
} from "./types";

async function fetchWithAccessToken<T>(path: string): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapGet<T>(path, { bearerToken });
}

async function postWithAccessToken<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapPost<T>(path, body, { bearerToken });
}

async function patchWithAccessToken<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapPatch<T>(path, body, { bearerToken });
}

async function putWithAccessToken<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapPut<T>(path, body, { bearerToken });
}

async function deleteWithAccessToken<T>(path: string): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapDelete<T>(path, { bearerToken });
}

export function useUser() {
  return useSWR<User>("/v1/me", fetchWithAccessToken);
}

export function useDashboardSummary() {
  return useSWR<DashboardSummary>("/v1/dashboard/summary", fetchWithAccessToken);
}

export function useLogs(limit = 20) {
  return useSWR<LogsResult>(`/v1/logs?limit=${limit}`, fetchWithAccessToken);
}

export function useBalance() {
  return useSWR<Balance>("/v1/credits/balance", fetchWithAccessToken);
}

export function useDriveNodes(parentID?: number | null) {
  const query = parentID != null ? `?parent_id=${parentID}` : "";
  return useSWR<DriveNodeListResult>(`/v1/drive/nodes${query}`, fetchWithAccessToken);
}

export async function createDriveFolder(input: { name: string; parent_id?: number | null }) {
  const body: Record<string, unknown> = { name: input.name };
  if (input.parent_id !== undefined) {
    body.parent_id = input.parent_id;
  }
  return postWithAccessToken<DriveNode>("/v1/drive/folders", body);
}

export async function updateDriveNode(id: number, patch: Record<string, unknown>) {
  return patchWithAccessToken<DriveNode>(`/v1/drive/nodes/${id}`, patch);
}

export async function deleteDriveNode(id: number) {
  return deleteWithAccessToken<{ id: number; deleted: boolean; deleted_count: number }>(`/v1/drive/nodes/${id}`);
}

export async function presignDriveFile(input: {
  name: string;
  content_type: string;
  content_length: number;
  parent_id?: number | null;
}) {
  const body: Record<string, unknown> = {
    name: input.name,
    content_type: input.content_type,
    content_length: input.content_length,
  };
  if (input.parent_id !== undefined) {
    body.parent_id = input.parent_id;
  }
  return postWithAccessToken<DriveFilePresignResult>("/v1/drive/files/presign", body);
}

export async function completeDriveFile(input: {
  upload_session_id: number;
  file_id: number;
}) {
  return postWithAccessToken<DriveNode>("/v1/drive/files/complete", input);
}

export async function upsertDriveShare(
  nodeID: number,
  input: {
    expires_in_seconds?: number;
    no_expire?: boolean;
    password?: string;
    no_password?: boolean;
  } = {},
) {
  return putWithAccessToken<DriveShareView>(`/v1/drive/nodes/${nodeID}/share`, input);
}

export async function rotateDriveShare(nodeID: number) {
  return postWithAccessToken<DriveShareView>(`/v1/drive/nodes/${nodeID}/share/rotate`, {});
}

export async function revokeDriveShare(nodeID: number) {
  return deleteWithAccessToken<{ id: number; revoked: boolean }>(`/v1/drive/nodes/${nodeID}/share`);
}

export function usePageSites() {
  return useSWR<PageSiteListResult>("/v1/pages", fetchWithAccessToken);
}

export function usePageSite(id?: number) {
  const path = id ? `/v1/pages/${id}` : null;
  return useSWR<PageSite>(path, fetchWithAccessToken);
}

export async function createPageSite(input: { name: string }) {
  return postWithAccessToken<PageSite>("/v1/pages", input);
}

export async function updatePageSite(id: number, patch: Record<string, unknown>) {
  return patchWithAccessToken<PageSite>(`/v1/pages/${id}`, patch);
}

export function usePageVersions(pageID?: number) {
  const path = pageID ? `/v1/pages/${pageID}/versions` : null;
  return useSWR<PageVersionListResult>(path, fetchWithAccessToken);
}

export async function createPageVersion(pageID: number) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions`, {});
}

export async function presignPageVersionAsset(input: {
  page_id: number;
  version_id: number;
  asset_path: string;
  content_type: string;
  content_length: number;
}) {
  return postWithAccessToken<PageVersionPresignResult>(
    `/v1/pages/${input.page_id}/versions/${input.version_id}/files/presign`,
    {
      asset_path: input.asset_path,
      content_type: input.content_type,
      content_length: input.content_length,
    },
  );
}

export async function completePageVersionAsset(input: {
  page_id: number;
  version_id: number;
  upload_session_id: number;
}) {
  return postWithAccessToken<PageVersion>(
    `/v1/pages/${input.page_id}/versions/${input.version_id}/files/complete`,
    { upload_session_id: input.upload_session_id },
  );
}

export async function finalizePageVersion(pageID: number, versionID: number) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions/${versionID}/finalize`, {});
}

export async function publishPageVersion(pageID: number, versionID: number) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions/${versionID}/publish`, {});
}

export async function rollbackClonePageVersion(pageID: number, sourceVersionID: number) {
  return postWithAccessToken<PageVersion>(
    `/v1/pages/${pageID}/versions/${sourceVersionID}/rollback-clone`,
    {},
  );
}

export async function unpublishPageSite(pageID: number) {
  return postWithAccessToken<PageSite>(`/v1/pages/${pageID}/unpublish`, {});
}
