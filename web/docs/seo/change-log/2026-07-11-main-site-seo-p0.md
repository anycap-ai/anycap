# Main-site SEO P0 build gate

## Changed

- Added a focused SEO foundation test script, strict P0 locale rollout check,
  P0 source-contract check, and one composed `check:seo-p0` package gate.
- Inserted `check:seo-p0` into the production and Cloudflare build command
  chains immediately before sitemap-lastmod generation.
- Synchronized localized SEO routes without creating, updating, or removing a
  wrapper. The public SEO route inventory remains 102 routes.
- Regenerated sitemap-lastmod evidence with the same 229 source entries. Only
  the four P0 page dependencies advanced: Codex, video generation, video
  analysis, and the video-generation agent guide.

## Product facts used

- Generation uses `anycap video generate`.
- Analysis uses `anycap actions video-read`.
- Model discovery uses `anycap video models` plus live schema discovery before
  an agent supplies model-specific parameters.
- Every successful video-read costs 10 credits and includes `status`, `content`,
  and `credit_cost: 10`. `request_id` appears when the server supplies one, the
  top-level CLI normally injects `trace_id`, and additional operational fields
  may appear.

## Verification

- Focused Go tests passed for video model discovery, live model schema,
  generation, video read, and server-content JSON output.
- Locale synchronization passed with `base=102`, `created=0`, `updated=0`,
  `removed=0`, and `manual=81`.
- The composed P0 gate passed: 10 SEO foundation tests, strict rollout for
  `pt-br`, `id`, and `de` across the four P0 paths, and all P0 source contracts.
- Edge-runtime, breadcrumb, information-architecture, full locale rollout, and
  hub locale rollout checks passed. Information architecture reported 102 SEO
  routes and 112 nodes.
- Non-incremental TypeScript checking passed.
- Sitemap-lastmod generation passed with 229 entries and no key additions or
  removals.
- The production `pnpm run build` completed successfully and re-ran the new P0
  gate before sitemap generation. It emitted existing Auth0/Jose Edge-runtime
  compatibility warnings and a webpack cache serialization warning, but no
  build error.

## Measurement boundary

This change establishes build-time correctness and records the verified page
cluster; it does not prove installation, activation, revenue, or Google Search
Console lift. Those outcomes must not be claimed until analytics are deployed
and post-deploy product and search data demonstrate them.
