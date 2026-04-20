# Drive Storage

Cloud file storage for sharing files with humans. Upload, organize, and generate share links that people can open in a browser.

**Drive is NOT for passing files between commands.** If you need to feed a local file into an action (image-read, video-read, audio-read) or a generation command (image edit, video i2v), use `--file` or `--param` directly -- those commands auto-upload internally. Drive is for when the human needs a link to view or download a result.

## Do You Need Multiple Targets?

Most tasks need only one folder tree. If you are uploading files to a single project folder, just use the commands directly -- the drive works with paths (`--parent-path`) and does not require any config.

Use **named targets** only when you need to switch between different drive folder bindings from the same directory (e.g., a production folder and an archive folder). This is an advanced pattern.

---

## Quick Start (No Config Needed)

Drive commands work immediately with paths. No `anycap.toml` setup required.

### Upload

```bash
# Upload a file to root
anycap drive upload report.pdf

# Upload to a specific folder by path
anycap drive upload data.csv --parent-path /results

# Upload to a folder by ID
anycap drive upload data.csv --parent dn_aBcDeFg
```

Output:

```json
{
  "status": "success",
  "file_id": "dn_xYzAbCdE",
  "name": "data.csv",
  "size": 1024,
  "request_id": "req_abc123"
}
```

### Folder Management

```bash
# Create a folder at root
anycap drive mkdir --name "results"

# Create nested folders
anycap drive mkdir --name "images" --parent-path /results
```

### List Files

```bash
# List root contents
anycap drive ls

# List a folder by path
anycap drive ls --parent-path /results
```

### Move and Delete

```bash
# Move/rename by ID
anycap drive mv <node-id> --name "new-name.pdf"
anycap drive mv <node-id> --dst-parent dn_newParent

# Move by path
anycap drive mv --src-path /old/file.txt --name "renamed.txt"

# Delete
anycap drive rm <node-id>
anycap drive rm --src-path /results/old-data.csv
```

### Sharing

```bash
# Create a public share link (default: 7 days)
anycap drive share <node-id>
anycap drive share --src-path /results/report.pdf --expires 30d

# Remove share link
anycap drive unshare <node-id>
```

Output:

```json
{
  "status": "success",
  "url": "https://drive.anycap.dev/s/abc123",
  "expires_at": "2026-04-06T14:00:00Z",
  "request_id": "req_abc123"
}
```

---

## Named Targets (Multiple Folder Bindings)

When you need to manage multiple folder contexts from the same directory, bind them in `anycap.toml`:

```toml
[drive]
folder_id = "dn_xxx"
path = "/project-files"

[drive.targets.archive]
folder_id = "dn_yyy"
path = "/archive"
```

This is an advanced pattern. For most workflows, path-based access (`--parent-path`) is sufficient and simpler.

---

## Typical Agent Workflow

Use drive when the human needs a shareable link to view or download a file:

```bash
# Generate an image, upload to drive, share with the human
anycap image generate --prompt "product hero" --model seedream-5 -o hero.png
anycap drive upload hero.png --parent-path /campaign-assets
SHARE=$(anycap drive share --src-path /campaign-assets/hero.png | jq -r '.url')
echo "Shareable link: $SHARE"
```

Do NOT use drive to get a URL for other AnyCap commands. For example, to analyze a local image:

```bash
# WRONG: upload to drive, then pass URL to image-read
# anycap drive upload photo.png && anycap actions image-read --url <drive-url>

# RIGHT: pass the file directly
anycap actions image-read --file ./photo.png
```
