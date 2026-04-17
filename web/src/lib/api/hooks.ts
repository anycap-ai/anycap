"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { anycapDelete, anycapGet, anycapPatch, anycapPost, anycapPut } from "./client";
import type {
  ApiKeyListResult,
  Balance,
  BillingCheckoutResult,
  CreateApiKeyResult,
  CreditPackListResult,
  DashboardSummary,
  DriveAccessLinksResult,
  DriveFilePresignResult,
  DriveNode,
  DriveNodeListResult,
  DriveShareView,
  LogsResult,
  ManagedApiKey,
  PageVersion,
  PageVersionListResult,
  PagePreviewHostResult,
  PageVersionPresignResult,
  PageSite,
  PageSiteListResult,
  UpdateApiKeyResult,
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

export function useLogs(limit = 10, offset = 0) {
  return useSWR<LogsResult>(`/v1/logs?limit=${limit}&offset=${offset}`, fetchWithAccessToken);
}

export function useBalance() {
  return useSWR<Balance>("/v1/credits/balance", fetchWithAccessToken);
}

export function useCreditPacks() {
  return useSWR<CreditPackListResult>("/v1/pricing/credit-packs", fetchWithAccessToken, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

export async function createBillingCheckout(input: {
  pack_id: string;
  quantity?: number;
  success_url?: string;
  cancel_url?: string;
  idempotency_key?: string;
}) {
  const body: Record<string, unknown> = {
    pack_id: input.pack_id,
  };
  if (input.quantity !== undefined) {
    body.quantity = input.quantity;
  }
  if (input.success_url !== undefined) {
    body.success_url = input.success_url;
  }
  if (input.cancel_url !== undefined) {
    body.cancel_url = input.cancel_url;
  }
  if (input.idempotency_key !== undefined) {
    body.idempotency_key = input.idempotency_key;
  }
  return postWithAccessToken<BillingCheckoutResult>("/v1/billing/checkout", body);
}

export function useDriveNodes(parentID?: string | null, limit = 10, offset = 0) {
  const params = new URLSearchParams();
  if (parentID != null) params.set("parent_id", parentID);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return useSWR<DriveNodeListResult>(`/v1/drive/nodes?${params}`, fetchWithAccessToken);
}

export async function createDriveFolder(input: { name: string; parent_id?: string | null }) {
  const body: Record<string, unknown> = { name: input.name };
  if (input.parent_id !== undefined) {
    body.parent_id = input.parent_id;
  }
  return postWithAccessToken<DriveNode>("/v1/drive/folders", body);
}

export async function updateDriveNode(id: string, patch: Record<string, unknown>) {
  return patchWithAccessToken<DriveNode>(`/v1/drive/nodes/${id}`, patch);
}

export async function deleteDriveNode(id: string) {
  return deleteWithAccessToken<{ id: string; deleted: boolean; deleted_count: number }>(`/v1/drive/nodes/${id}`);
}

export async function presignDriveFile(input: {
  name: string;
  content_type: string;
  content_length: number;
  parent_id?: string | null;
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
  upload_session_id: string;
  file_id: string;
}) {
  return postWithAccessToken<DriveNode>("/v1/drive/files/complete", input);
}

export async function getDriveShare(nodeID: string) {
  return fetchWithAccessToken<DriveShareView | null>(`/v1/drive/nodes/${nodeID}/share`);
}

export async function upsertDriveShare(
  nodeID: string,
  input: {
    expires_in_seconds?: number;
    no_expire?: boolean;
    password?: string;
    no_password?: boolean;
  } = {},
) {
  return putWithAccessToken<DriveShareView>(`/v1/drive/nodes/${nodeID}/share`, input);
}

export async function rotateDriveShare(nodeID: string) {
  return postWithAccessToken<DriveShareView>(`/v1/drive/nodes/${nodeID}/share/rotate`, {});
}

export async function revokeDriveShare(nodeID: string) {
  return deleteWithAccessToken<{ id: string; revoked: boolean }>(`/v1/drive/nodes/${nodeID}/share`);
}

export async function createDriveAccessLinks(nodeID: string) {
  return postWithAccessToken<DriveAccessLinksResult>(`/v1/drive/nodes/${nodeID}/access-links`, {});
}

export function usePageSites(limit = 10, offset = 0) {
  return useSWR<PageSiteListResult>(`/v1/pages?limit=${limit}&offset=${offset}`, fetchWithAccessToken);
}

export function usePageSite(id?: string) {
  const path = id ? `/v1/pages/${id}` : null;
  return useSWR<PageSite>(path, fetchWithAccessToken);
}

export async function createPageSite(input: { name: string }) {
  return postWithAccessToken<PageSite>("/v1/pages", input);
}

export async function updatePageSite(id: string, patch: Record<string, unknown>) {
  return patchWithAccessToken<PageSite>(`/v1/pages/${id}`, patch);
}

export function usePageVersions(pageID?: string) {
  const path = pageID ? `/v1/pages/${pageID}/versions` : null;
  return useSWR<PageVersionListResult>(path, fetchWithAccessToken);
}

export async function createPageVersion(pageID: string) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions`, {});
}

export async function presignPageVersionAsset(input: {
  page_id: string;
  version_id: string;
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
  page_id: string;
  version_id: string;
  upload_session_id: string;
}) {
  return postWithAccessToken<PageVersion>(
    `/v1/pages/${input.page_id}/versions/${input.version_id}/files/complete`,
    { upload_session_id: input.upload_session_id },
  );
}

export async function finalizePageVersion(pageID: string, versionID: string) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions/${versionID}/finalize`, {});
}

export async function publishPageVersion(pageID: string, versionID: string) {
  return postWithAccessToken<PageVersion>(`/v1/pages/${pageID}/versions/${versionID}/publish`, {});
}

export async function createPagePreviewHost(pageID: string, versionID: string) {
  return postWithAccessToken<PagePreviewHostResult>(
    `/v1/pages/${pageID}/versions/${versionID}/preview-host`,
    {},
  );
}

export async function rollbackClonePageVersion(pageID: string, sourceVersionID: string) {
  return postWithAccessToken<PageVersion>(
    `/v1/pages/${pageID}/versions/${sourceVersionID}/rollback-clone`,
    {},
  );
}

export async function unpublishPageSite(pageID: string) {
  return postWithAccessToken<PageSite>(`/v1/pages/${pageID}/unpublish`, {});
}

export function useApiKeys() {
  return useSWR<ApiKeyListResult>("/v1/api-keys", fetchWithAccessToken);
}

export async function createApiKey(input: { name: string; expires_in_days?: number }) {
  const body: Record<string, unknown> = { name: input.name };
  if (input.expires_in_days !== undefined) {
    body.expires_in_days = input.expires_in_days;
  }
  return postWithAccessToken<CreateApiKeyResult>("/v1/api-keys", body);
}

export async function updateApiKey(
  id: string,
  patch: { name?: string; expires_in_days?: number; never_expires?: boolean },
) {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.expires_in_days !== undefined) body.expires_in_days = patch.expires_in_days;
  if (patch.never_expires !== undefined) body.never_expires = patch.never_expires;
  const result = await patchWithAccessToken<UpdateApiKeyResult>(`/v1/api-keys/${id}`, body);
  return result.api_key as ManagedApiKey;
}

export async function disableApiKey(id: string) {
  return postWithAccessToken<{ id: string; disabled: boolean }>(`/v1/api-keys/${id}/disable`, {});
}

export async function deleteApiKey(id: string) {
  return deleteWithAccessToken<{ id: string; deleted: boolean }>(`/v1/api-keys/${id}`);
}
