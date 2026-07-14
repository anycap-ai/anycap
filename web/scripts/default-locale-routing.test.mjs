import assert from "node:assert/strict";
import test from "node:test";

import { isInternalDefaultLocaleRewrite } from "../src/lib/default-locale-routing.ts";

test("recognizes a default-locale request produced by an internal rewrite", () => {
  assert.equal(
    isInternalDefaultLocaleRewrite({
      locale: "en",
      defaultLocale: "en",
      forwardedLocale: "en",
      forwardedPathname: "/for/codex",
      pathname: "/for/codex",
    }),
    true,
  );
});

test("does not treat an explicit default-locale URL as an internal rewrite", () => {
  assert.equal(
    isInternalDefaultLocaleRewrite({
      locale: "en",
      defaultLocale: "en",
      forwardedLocale: null,
      forwardedPathname: null,
      pathname: "/for/codex",
    }),
    false,
  );
});

test("does not trust a forwarded path for a different locale", () => {
  assert.equal(
    isInternalDefaultLocaleRewrite({
      locale: "pt-br",
      defaultLocale: "en",
      forwardedLocale: "en",
      forwardedPathname: "/for/codex",
      pathname: "/for/codex",
    }),
    false,
  );
});

test("requires the forwarded default locale marker", () => {
  assert.equal(
    isInternalDefaultLocaleRewrite({
      locale: "en",
      defaultLocale: "en",
      forwardedLocale: null,
      forwardedPathname: "/for/codex",
      pathname: "/for/codex",
    }),
    false,
  );
});
