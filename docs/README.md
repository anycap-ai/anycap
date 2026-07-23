# AnyCap Documentation Site

The documentation site is an Astro Starlight static build deployed through Cloudflare Workers Static Assets.

## Local development

Run the root-level Make targets:

```bash
make docs-install
make docs-dev
```

Production checks and previews:

```bash
make docs-check
make docs-build
make docs-audit
make docs-production-seo
make docs-preview
make docs-worker-preview
```

Override local ports when needed:

```bash
DOCS_PORT=4400 make docs-preview
WORKER_PORT=8800 make docs-worker-preview
```

The canonical site URL is `https://docs.anycap.ai`.

`make docs-production-seo` compares the live Docs sitemap, robots, and
self-canonicals with the just-built release output, then checks the legacy
redirects. Run it after a production deployment; it is expected to fail while
production still serves an older release.

## Deployment

`.github/workflows/docs.yml` validates pull requests and deploys `main` through the GitHub Environment named `docs`.

Configure these environment-scoped GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The API token needs permission to edit Workers Scripts for the target account. `wrangler deploy` creates the `anycap-docs` Worker on the first deployment and updates it on later deployments.

## Bind the custom domain

After the first successful workflow run:

1. Open Cloudflare Dashboard.
2. Select **Workers & Pages**.
3. Open the `anycap-docs` Worker.
4. Open **Settings → Domains & Routes**.
5. Add the custom domain `docs.anycap.ai`.

No domain route is committed to `wrangler.jsonc`, so deployment does not require zone-level DNS permissions and cannot overwrite domain routing.

## Source layout

- `src/content/docs/` — documentation pages
- `src/styles/custom.css` — AnyCap visual system
- `src/components/Head.astro` — JSON-LD and shared metadata
- `public/` — robots, redirects, headers, manifest, and LLM discovery
- `wrangler.jsonc` — Worker Static Assets configuration
- `../Makefile` — local development, build, preview, and deployment shortcuts
- `../assets/hero.png` — repository-level artwork used to generate a 1200×630 social card during the build

## SEO baseline

The build includes canonical URLs, page descriptions, Open Graph and Twitter metadata, TechArticle/WebSite JSON-LD, sitemap generation, `robots.txt`, `llms.txt`, semantic Starlight layouts, Pagefind search, a custom 404 page, and permanent redirects for short legacy paths.
