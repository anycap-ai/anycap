---
title: Drive Storage and Page Hosting
description: Share generated files with humans through AnyCap Drive or publish static sites through AnyCap Page.
---

## Choose a delivery method

| Need | Use |
| --- | --- |
| A human needs a file link | Drive |
| A human needs to browse a report or static app | Page |
| Another command needs a local file | Pass the local path directly |
| Another agent needs a recoverable project | Snapshot |

## Drive

```bash
anycap drive upload result.png --parent-path /deliverables
anycap drive share --src-path /deliverables/result.png --expires 7d
```

Drive supports folders, path- or ID-based addressing, move, delete, share, and unshare operations. Share expiration defaults to seven days.

Drive is not an intermediate upload service for image, video, or audio commands. Those commands accept local paths directly.

## Page

Deploy a static directory and publish the first version:

```bash
anycap page deploy ./dist --name "Launch Report" --publish
```

The CLI saves the site binding in `anycap.toml`:

```toml
[page]
site_id = "pg_aBcDeFg"
name = "Launch Report"
```

Subsequent releases need no site identifier:

```bash
anycap page deploy ./dist --publish
```

Page supports version history, publish, unpublish, rollback, password access, and SPA fallback. Use named targets only when one working directory intentionally manages multiple sites.
