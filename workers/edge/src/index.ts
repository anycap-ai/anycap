import { resolveConfig } from "./config";
import { handleDrive } from "./drive";
import { notFoundPage } from "./response";
import type { Env } from "./types";
import { handlePage } from "./page";
import { handlePublic } from "./public";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const config = resolveConfig(env);
			const hostname = new URL(request.url).hostname.toLowerCase();

			if (hostname === config.cdnHost) {
				return await handlePublic(request, env);
			}
			if (hostname === config.driveHost) {
				return await handleDrive(request, env, config);
			}
			if (hostname.startsWith(config.pageHostPrefix)) {
				return await handlePage(request, env, config);
			}
			return notFoundPage("Unknown host");
		} catch (err) {
			const message = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
			return new Response(message, { status: 500, headers: { "content-type": "text/plain" } });
		}
	},
};
