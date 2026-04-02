import type { Env } from "./types";

export type EdgeConfig = {
	cdnHost: string;
	driveHost: string;
	artifactHost: string;
	artifactIngestHost: string;
	pageHostPrefix: string;
	pagePreviewHostPrefix: string;
	driveAssetCacheTTLSeconds: number;
	pageAssetCacheTTLSeconds: number;
	drivePasswordRateLimitWindowSeconds: number;
	drivePasswordRateLimitMaxAttempts: number;
	pagePasswordRateLimitWindowSeconds: number;
	pagePasswordRateLimitMaxAttempts: number;
	drivePasswordSessionTTLSeconds: number;
	pagePasswordSessionTTLSeconds: number;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
	if (!raw) {
		return fallback;
	}
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		return fallback;
	}
	return parsed;
}

export function resolveConfig(env: Env): EdgeConfig {
	const prefix = (env.PAGE_HOST_PREFIX || "page-").trim().toLowerCase();
	const previewPrefix = (env.PAGE_PREVIEW_HOST_PREFIX || "preview-page-").trim().toLowerCase();
	return {
		cdnHost: (env.CDN_HOST || "cdn.anycap.cloud").trim().toLowerCase(),
		driveHost: (env.DRIVE_HOST || "drive.anycap.cloud").trim().toLowerCase(),
		artifactHost: (env.ARTIFACT_HOST || "artifact.anycap.cloud").trim().toLowerCase(),
		artifactIngestHost: (env.ARTIFACT_INGEST_HOST || "artifact-ingest.anycap.cloud").trim().toLowerCase(),
		pageHostPrefix: prefix.endsWith("-") ? prefix : `${prefix}-`,
		pagePreviewHostPrefix: previewPrefix.endsWith("-") ? previewPrefix : `${previewPrefix}-`,
		driveAssetCacheTTLSeconds: parsePositiveInt(env.DRIVE_STATIC_ASSET_CACHE_TTL_SECONDS, 60),
		pageAssetCacheTTLSeconds: parsePositiveInt(env.PAGE_STATIC_ASSET_CACHE_TTL_SECONDS, 60),
		drivePasswordRateLimitWindowSeconds: parsePositiveInt(env.DRIVE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS, 300),
		drivePasswordRateLimitMaxAttempts: parsePositiveInt(env.DRIVE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS, 10),
		pagePasswordRateLimitWindowSeconds: parsePositiveInt(env.PAGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS, 300),
		pagePasswordRateLimitMaxAttempts: parsePositiveInt(env.PAGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS, 10),
		drivePasswordSessionTTLSeconds: parsePositiveInt(env.DRIVE_PASSWORD_SESSION_TTL_SECONDS, 3600),
		pagePasswordSessionTTLSeconds: parsePositiveInt(env.PAGE_PASSWORD_SESSION_TTL_SECONDS, 3600),
	};
}
