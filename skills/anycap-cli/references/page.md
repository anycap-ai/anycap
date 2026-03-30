# Page Hosting

Deploy static sites and single HTML files to AnyCap's edge network. Each site gets a unique URL.

## Deploy

```bash
# Deploy a directory (must contain index.html)
anycap page deploy ./dist --name "My Docs" --publish

# Deploy a single HTML file (auto-renamed to index.html)
anycap page deploy report.html --publish

# Deploy to an existing site by ID
anycap page deploy ./dist --site pg_aBcDeFg --publish
```

### Flags

| Flag | Description |
|------|-------------|
| `--name` | Site display name (find existing or create new) |
| `--site` | Existing site ID to deploy to (mutually exclusive with `--name`) |
| `--publish` | Publish the version immediately after upload |
| `--concurrency N` | Parallel upload workers, 1-20 (default: 6) |

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

### Project Config (anycap.toml)

After a successful deploy, the CLI writes `anycap.toml` in the current directory:

```toml
[page]
site_id = "pg_aBcDeFg"
name = "My Docs"
```

Subsequent deploys from the same directory automatically target the same site -- no flags needed:

```bash
# First time
anycap page deploy ./dist --name "My Docs" --publish

# Every time after (reads site_id from anycap.toml)
anycap page deploy ./dist --publish
```

The file is safe to commit to git. It contains only opaque external IDs.

## Manage Sites

```bash
# List all sites
anycap page list

# Get site details
anycap page info <page-id>

# Update site settings
anycap page set <page-id> --name "New Name"
anycap page set <page-id> --badge         # enable badge (default)
anycap page set <page-id> --no-badge      # disable badge

# Delete a site
anycap page delete <page-id>
```

## Version Management

```bash
# List versions
anycap page versions <page-id>

# Publish a specific version
anycap page publish <page-id> --version 3

# Unpublish (take offline)
anycap page unpublish <page-id>

# Rollback to a previous version
anycap page rollback <page-id> --version 1
```

## Typical Agent Workflow

```bash
# Generate a report, deploy it, get the URL
echo "<html><body><h1>Report</h1></body></html>" > report.html
URL=$(anycap page deploy report.html --name "Status Report" --publish | jq -r '.page_url')
echo "Published at: $URL"
```
