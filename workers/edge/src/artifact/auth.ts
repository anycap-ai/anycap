export function hasValidBearerToken(request: Request, expectedToken: string | undefined): boolean {
	const token = (expectedToken || "").trim();
	if (!token) {
		return false;
	}

	const authHeader = request.headers.get("authorization") || "";
	if (!authHeader.toLowerCase().startsWith("bearer ")) {
		return false;
	}
	const providedToken = authHeader.slice(7).trim();
	return providedToken !== "" && providedToken === token;
}
