# Drive Storage

Cloud file storage for agents. Upload, organize, and share files via AnyCap's drive.

## Upload

```bash
# Upload a file to root
anycap drive upload report.pdf

# Upload to a specific folder by path
anycap drive upload data.csv --parent-path /results

# Upload to a folder by ID
anycap drive upload data.csv --parent dn_aBcDeFg
```

### Output

```json
{
  "status": "success",
  "file_id": "dn_xYzAbCdE",
  "name": "data.csv",
  "size": 1024,
  "request_id": "req_abc123"
}
```

## Folder Management

```bash
# Create a folder at root
anycap drive mkdir --name "results"

# Create a folder under a parent path
anycap drive mkdir --name "images" --parent-path /results

# Create a folder under a parent ID
anycap drive mkdir --name "images" --parent dn_aBcDeFg
```

## List Files

```bash
# List root contents
anycap drive ls

# List a folder by path
anycap drive ls --parent-path /results

# List by folder ID
anycap drive ls --parent dn_aBcDeFg
```

## Move and Delete

```bash
# Move/rename a file or folder (by ID)
anycap drive mv <node-id> --name "new-name.pdf"
anycap drive mv <node-id> --to dn_newParent

# Move by path
anycap drive mv --src-path /old/file.txt --name "renamed.txt"

# Delete a file or folder
anycap drive rm <node-id>
anycap drive rm --src-path /results/old-data.csv
```

## Sharing

```bash
# Create a public share link (default: 7 days)
anycap drive share <node-id>
anycap drive share --src-path /results/report.pdf --expires 30d

# Remove share link
anycap drive unshare <node-id>
```

### Share Output

```json
{
  "status": "success",
  "share_url": "https://drive.anycap.dev/s/abc123",
  "expires_at": "2026-04-06T14:00:00Z",
  "request_id": "req_abc123"
}
```

## Typical Agent Workflow

```bash
# Generate an image, upload it, share the link
anycap image generate --prompt "product hero" --model seedream-5 -o hero.png
anycap drive mkdir --name "campaign-assets"
anycap drive upload hero.png --parent-path /campaign-assets
SHARE=$(anycap drive share --src-path /campaign-assets/hero.png | jq -r '.share_url')
echo "Shareable link: $SHARE"
```
