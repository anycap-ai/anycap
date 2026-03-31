# Page Hosting

Deploy static sites and single HTML files to AnyCap's edge network. Each site gets a unique URL with versioning, rollback, and access control.

## Do You Need Multiple Targets?

Most tasks need only one site. If you are deploying a single project (docs, dashboard, report), use the **default target** flow below -- it is the fastest path. The CLI auto-saves the site binding to `anycap.toml`, so subsequent deploys need zero flags.

Use **named targets** only when you explicitly need to manage multiple sites from the same directory (e.g., preview + release environments, or a series of independent reports).

______________________________________________________________________

## Default Target (Single Site -- Fast Path)

### First deploy

```bash
anycap page deploy ./dist --name "My Docs" --publish
```

This creates a site, deploys, publishes, and saves the binding to `anycap.toml`:

```toml
[page]
site_id = "pg_aBcDeFg"
name = "My Docs"
```

### Every subsequent deploy

```bash
anycap page deploy ./dist --publish
```

No flags needed -- reads `site_id` from `anycap.toml`.

### One-shot deploy (disposable URL)

When you just need a URL fast and do not plan to redeploy:

```bash
anycap page deploy report.html --new --publish
```

Returns `page_url` immediately. The `--new` flag always creates a fresh site.

### Manage the default site

```bash
anycap page info                    # site details (reads from anycap.toml)
anycap page versions                # version history
anycap page publish --version 3     # publish a specific version
anycap page unpublish               # take offline
anycap page rollback --version 1    # clone + publish a historical version
anycap page set --name "New Name"   # update settings
anycap page delete                  # delete the site
```

All commands auto-resolve the site from `anycap.toml` when no `<page-id>`, `--page-id`, or `--target` is given.

______________________________________________________________________

## Named Targets (Multiple Sites)

When you need multiple sites from the same directory, use `--target` to create and reference named bindings.

### Setup targets

```bash
anycap page create --name "App Preview" --target preview
anycap page create --name "App Release" --target release
```

This writes to `anycap.toml`:

```toml
[page]
site_id = "pg_aBcDeFg"
name = "My Docs"

[page.targets.preview]
site_id = "pg_xYzAbC"
name = "App Preview"

[page.targets.release]
site_id = "pg_dEfGhI"
name = "App Release"
```

### Deploy to a target

```bash
anycap page deploy ./dist --target preview --publish
anycap page deploy ./dist --target release --publish
```

### One-shot with auto-target

```bash
anycap page deploy ./report-q1.html --new --name "Q1 Report" --publish
anycap page deploy ./report-q2.html --new --name "Q2 Report" --publish
```

Each `--new` deploy auto-generates a target name (`deploy-YYYYMMDD-HHMM`) and saves it.

### Manage a specific target

```bash
anycap page info --target preview
anycap page versions --target release
anycap page publish --target release --version 3
anycap page rollback --target release --version 1
anycap page delete --target preview
```

### List local targets

```bash
anycap page list --local
```

______________________________________________________________________

## Site Resolution Priority

When multiple identification methods are available, the CLI resolves in this order:

1. `<page-id>` positional argument
2. `--page-id pg_xxx` flag
3. `--target <name>` flag (lookup from `anycap.toml`)
4. `[page]` default section in `anycap.toml`
5. Auto-create (deploy only)

## Deploy Details

### Flags

| Flag              | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `--name`          | Site display name (find existing or create new)           |
| `--page-id`       | Existing page site ID                                     |
| `--target`        | Named target from `anycap.toml`                           |
| `--new`           | Force create a new site (cannot combine with `--page-id`) |
| `--publish`       | Publish the version immediately after upload              |
| `--concurrency N` | Parallel upload workers, 1-20 (default: 6)                |

### Output

```json
{
  "status": "success",
  "page_id": "pg_aBcDeFg",
  "page_name": "my-docs-a1b2c3",
  "page_url": "https://page-my-docs-a1b2c3.anycap.dev",
  "version": 1,
  "published": true,
  "files_uploaded": 12,
  "total_size_bytes": 245760,
  "request_id": "req_abc123"
}
```

## Site Settings

```bash
anycap page set [page-id] --name "New Name"
anycap page set [page-id] --access public|password
anycap page set [page-id] --password "secret"
anycap page set [page-id] --no-password
anycap page set [page-id] --spa-fallback        # enable SPA mode
anycap page set [page-id] --no-spa-fallback
anycap page set [page-id] --badge               # show AnyCap badge
anycap page set [page-id] --no-badge            # hide badge
```

## Typical Agent Workflow

```bash
# Generate a report, deploy it, get the URL
echo "<html><body><h1>Report</h1></body></html>" > report.html
URL=$(anycap page deploy report.html --publish | jq -r '.page_url')
echo "Published at: $URL"
```
