# Phase 5: Deliver

Choose a delivery format based on the user's needs. You can combine multiple options.

## Option A: Local Markdown File (Default)

Write the report to a local file. This is the simplest path and always appropriate.

```bash
# The report is already written as a local file during synthesis
# e.g., research-topic/report.md
```

Present the file path to the user.

## Option B: Drive Upload (Single-File Sharing)

Drive is best for sharing **standalone files** -- a single PDF, a data export, or individual images. Upload and share:

```bash
# Upload the report
anycap drive upload research-topic/report.pdf --parent-path /research

# Generate a shareable link
anycap drive share --src-path /research/report.pdf --expires 30d
```

Present the share URL to the user.

**Drive limitation: do not embed Drive share links inside Drive-shared markdown.** When a Drive-hosted markdown file references images via other Drive share URLs, the nested links may fail to load (especially with access controls). For reports with embedded images, diagrams, or mermaid charts, use Page (Option C) instead.

## Option C: Published Web Page (Polished Presentation)

For a professional presentation, convert the report to HTML and publish:

```bash
# Write the report as an HTML file with clean typography
# (wrap the markdown content in a minimal HTML template)

# Deploy as a published page
anycap page deploy research-topic/report.html --new --name "Research: Topic Name" --publish
```

The output includes a `page_url` that anyone can visit.

### HTML Template

When publishing as a page, wrap the report in a clean HTML template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Report Title]</title>
  <style>
    body {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
      color: #1c1f17;
    }
    h1 { font-size: 2rem; margin-top: 2rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; border-bottom: 1px solid #d8dcd0; padding-bottom: 0.3rem; }
    h3 { font-size: 1.2rem; margin-top: 1.5rem; }
    blockquote { border-left: 3px solid #6b7d3a; padding-left: 1rem; color: #4d5145; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #d8dcd0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f4f6f0; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    a { color: #6b7d3a; }
    code { background: #f4f6f0; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
    .source-note { font-size: 0.85rem; color: #6b7068; font-style: italic; }
  </style>
</head>
<body>
  <!-- Convert your markdown report to HTML here -->
</body>
</html>
```

## Option D: Both Drive and Page

Upload the raw Markdown to Drive (for download and reference) and publish the full report directory as a Page (for reading and sharing).

```bash
# Drive: raw markdown for reference/download
anycap drive upload research-topic/report.md --parent-path /research
anycap drive share --src-path /research/report.md --expires 30d

# Page: full report with images and mermaid rendering
anycap page deploy research-topic/ --new --name "Research: Topic Name" --publish
```

Present both the Drive link (for downloading the raw markdown) and the Page URL (for reading the rendered report with images and diagrams) to the user.

## Choosing a Delivery Format

| User need | Recommended format |
|-----------|-------------------|
| Just needs the content | Local file (Option A) |
| Single file to share (PDF, data export) | Drive link (Option B) |
| Report with images, diagrams, or mermaid | Published page (Option C) |
| Wants both raw and polished | Drive + Page (Option D) |

If the user does not specify, use this rule of thumb:
- **Short, text-only reports** (under ~200 lines, no images or mermaid) -- local file + offer Drive for the single markdown file
- **Reports with any visual content** (mermaid diagrams, images, tables with images, 200+ lines) -- **recommend Page hosting**. Deploy the report directory (markdown + assets) as a Page. A published web page renders mermaid diagrams, displays images inline, and provides clean typography. Optionally upload the raw markdown to Drive as a backup.
- **Multiple files to deliver** (report + data files + images) -- **use Page for the rendered report**, Drive for supplementary raw files (datasets, source code, etc.)

When recommending Page, frame it as: "This report has enough visual content that it would look much better as a web page. I can publish it to a URL you can share with anyone."

**Key rule: never embed Drive share links as images inside other Drive-shared files.** For anything with embedded images or linked assets, always use Page.
