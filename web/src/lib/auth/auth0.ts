import { Auth0Client } from "@auth0/nextjs-auth0/server";

function resolveDomain(): string | undefined {
  const explicitDomain = process.env.AUTH0_DOMAIN?.trim();
  if (explicitDomain) {
    return explicitDomain;
  }

  const issuer = process.env.AUTH0_ISSUER_BASE_URL?.trim();
  if (!issuer) {
    return undefined;
  }

  try {
    return new URL(issuer).host;
  } catch {
    return issuer.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}

function resolveAppBaseURL(): string | string[] | undefined {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) {
    return undefined;
  }

  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length <= 1) {
    return values[0];
  }
  return values;
}

const audience = process.env.AUTH0_AUDIENCE?.trim();

export const auth0 = new Auth0Client({
  domain: resolveDomain(),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: resolveAppBaseURL(),
  authorizationParameters: {
    scope: "openid profile email",
    ...(audience ? { audience } : {}),
  },
  routes: {
    login: "/api/auth/login",
    callback: "/api/auth/callback",
    logout: "/api/auth/logout",
  },
});
