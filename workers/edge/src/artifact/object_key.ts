const ARTIFACT_OBJECT_KEY_PREFIX = "caps/outputs/o/";

export function isValidArtifactObjectKey(rawKey: string): boolean {
	const key = rawKey.trim();
	if (!key.startsWith(ARTIFACT_OBJECT_KEY_PREFIX)) {
		return false;
	}
	if (key.includes("..") || key.startsWith("/")) {
		return false;
	}
	const suffix = key.slice(ARTIFACT_OBJECT_KEY_PREFIX.length).trim();
	return suffix.length > 0 && !suffix.includes("/");
}
