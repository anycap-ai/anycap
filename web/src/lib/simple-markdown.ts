function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(raw: string): string {
  const escaped = escapeHtml(raw);

  return escaped
    .replace(/`([^`]+)`/g, (_match, code: string) => `<code>${code}</code>`)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_match, label: string, href: string) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`,
    );
}

function isTableSeparatorLine(line: string): boolean {
  const normalized = line.trim();
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(normalized);
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[], start: number): { html: string; next: number } | null {
  const headerLine = lines[start];
  const separatorLine = lines[start + 1];

  if (!headerLine || !separatorLine || !headerLine.includes("|") || !isTableSeparatorLine(separatorLine)) {
    return null;
  }

  const headers = parseTableRow(headerLine);
  let cursor = start + 2;
  const rows: string[][] = [];

  while (cursor < lines.length) {
    const rowLine = lines[cursor];
    if (!rowLine || !rowLine.includes("|") || rowLine.trim().startsWith("```")) {
      break;
    }
    rows.push(parseTableRow(rowLine));
    cursor += 1;
  }

  const thead = `<thead><tr>${headers
    .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead>`;

  const tbody = rows.length
    ? `<tbody>${rows
        .map(
          (cells) =>
            `<tr>${cells.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody>`
    : "";

  return {
    html: `<table>${thead}${tbody}</table>`,
    next: cursor,
  };
}

export function renderSimpleMarkdown(markdown: string): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const htmlChunks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === "---") {
      htmlChunks.push("<hr />");
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1;
      }
      const codeClass = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      htmlChunks.push(`<pre><code${codeClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const table = renderTable(lines, i);
    if (table) {
      htmlChunks.push(table.html);
      i = table.next;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      htmlChunks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const candidate = (lines[i] ?? "").trim();
        if (!candidate.startsWith("- ")) {
          break;
        }
        items.push(`<li>${renderInlineMarkdown(candidate.slice(2))}</li>`);
        i += 1;
      }
      htmlChunks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const candidate = (lines[i] ?? "").trim();
      if (!candidate) {
        break;
      }
      if (
        candidate === "---" ||
        candidate.startsWith("```") ||
        candidate.startsWith("- ") ||
        /^(#{1,6})\s+/.test(candidate)
      ) {
        break;
      }
      const maybeTableSeparator = lines[i + 1] ? isTableSeparatorLine(lines[i + 1]) : false;
      if (candidate.includes("|") && maybeTableSeparator) {
        break;
      }
      paragraphLines.push(candidate);
      i += 1;
    }
    htmlChunks.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
  }

  return htmlChunks.join("\n");
}
