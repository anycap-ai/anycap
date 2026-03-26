type SearchParamReader = {
  get(name: string): string | null;
};

const tipMessageMap: Record<string, string> = {
  login_web_not_enabled: "Login is not available on this server yet (web flow not enabled).",
  login_failed: "Login failed. Please try again later.",
  login_callback_invalid: "Login callback is invalid or expired. Please retry login.",
  login_callback_failed: "Login callback failed. Please try again later.",
};

export function resolveTipMessage(params: SearchParamReader): string {
  const tip = params.get("tip");
  if (tip && tipMessageMap[tip]) {
    return tipMessageMap[tip];
  }

  // Backward compatibility for old URLs.
  const authError = params.get("auth_error");
  if (!authError) {
    return "";
  }
  if (authError.includes("invalid request")) {
    return tipMessageMap.login_web_not_enabled;
  }
  return tipMessageMap.login_failed;
}
