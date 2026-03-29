import { resolveConfig } from "./config";
import { handleDrive } from "./drive";
import { notFoundPage } from "./response";
import type { Env } from "./types";
import { handlePage } from "./page";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const config = resolveConfig(env);
		const hostname = new URL(request.url).hostname.toLowerCase();

		if (hostname === config.driveHost) {
			return handleDrive(request, env, config);
		}
		if (hostname.endsWith(config.pageHostSuffix)) {
			return handlePage(request, env, config);
		}
		return notFoundPage("Unknown host");
	},
};
