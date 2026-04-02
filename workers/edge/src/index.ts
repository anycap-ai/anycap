import { resolveConfig } from "./config";
import { handleDrive } from "./drive";
import { notFoundPage } from "./response";
import type { Env } from "./types";
import { handlePage } from "./page";
import { handlePublic } from "./public";
import { handleArtifactPublic } from "./artifact/public";
import { handleArtifactIngest } from "./artifact/ingest";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const config = resolveConfig(env);
			const hostname = new URL(request.url).hostname.toLowerCase();

			if (hostname === config.cdnHost) {
				return await handlePublic(request, env);
			}
			if (hostname === config.driveHost) {
				return await handleDrive(request, env, config, ctx);
			}
			if (hostname === config.artifactHost) {
				return await handleArtifactPublic(request, env);
			}
			if (hostname === config.artifactIngestHost) {
				return await handleArtifactIngest(request, env);
			}
			if (hostname.startsWith(config.pageHostPrefix) || hostname.startsWith(config.pagePreviewHostPrefix)) {
				return await handlePage(request, env, config, ctx);
			}
			return notFoundPage("Unknown host");
		} catch (err) {
			const message = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
			return new Response(message, { status: 500, headers: { "content-type": "text/plain" } });
		}
	},
};
