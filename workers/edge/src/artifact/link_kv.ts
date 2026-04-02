import type { ArtifactLinkRecord, Env } from "../types";

const ARTIFACT_LINK_KEY_PREFIX = "artifact:link:";

export function buildArtifactLinkKey(token: string): string {
	return `${ARTIFACT_LINK_KEY_PREFIX}${token}`;
}

export async function loadArtifactLinkRecord(env: Env, token: string): Promise<ArtifactLinkRecord | null> {
	const raw = await env.EDGE_KV.get(buildArtifactLinkKey(token));
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw) as ArtifactLinkRecord;
		if (!parsed || typeof parsed.object_key !== "string" || parsed.object_key.trim() === "") {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}
