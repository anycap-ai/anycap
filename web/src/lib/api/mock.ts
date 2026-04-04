/**
 * SWR mock middleware for pagination preview.
 *
 * Activate:  add ?mock=1 to any dashboard URL
 * Deactivate: remove the param — zero residual effect
 *
 * This file is self-contained. Nothing imports it except SWRProvider.
 */

import type {
  DriveNode,
  DriveNodeListResult,
  LogsResult,
  PageSite,
  PageSiteListResult,
  TimelineItem,
} from "./types";

// ── totals (enough to exercise multi-page) ──────────────────────────
const DRIVE_TOTAL = 73;
const PAGES_TOTAL = 45;
const LOGS_TOTAL = 96;

// ── deterministic generators ────────────────────────────────────────

function isoAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const FILE_NAMES = [
  "presentation.pdf", "budget.xlsx", "notes.md", "photo.png",
  "diagram.svg", "report.docx", "data.csv", "archive.zip",
  "logo.png", "video.mp4", "readme.txt", "invoice.pdf",
  "screenshot.png", "design.fig", "backup.tar.gz", "slides.pptx",
];

const FOLDER_NAMES = [
  "Documents", "Images", "Reports", "Projects",
  "Archive", "Shared", "Drafts", "Templates",
];

const CAPABILITIES = [
  "image.generate", "image.edit", "image.read",
  "video.generate", "video.read", "audio.read",
];

const MODELS = [
  "seedream-5", "flux-1.1-pro", "nano-banana-pro",
  "gemini-2.0-flash", "veo-3-1",
];

function mockDriveNode(index: number): DriveNode {
  const isFolder = index % 7 === 0;
  const names = isFolder ? FOLDER_NAMES : FILE_NAMES;
  const baseName = names[index % names.length];
  const name = index < names.length ? baseName : `${baseName.split(".")[0]}-${index}.${baseName.split(".").pop()}`;
  return {
    id: `dn_mock_${index}`,
    space_id: "sp_mock_1",
    kind: isFolder ? "folder" : "file",
    name,
    size: isFolder ? null : 1024 * ((index * 137 + 42) % 10000),
    mime: isFolder ? null : "application/octet-stream",
    edge_version: 1,
    created_by: "u_mock_1",
    created_at: isoAgo(index + 1),
    updated_at: isoAgo(index),
    has_share: index % 5 === 0,
  };
}

function mockPageSite(index: number): PageSite {
  const names = [
    "Landing Page", "Blog", "Docs", "Portfolio",
    "Dashboard Preview", "API Reference", "Changelog",
    "Pricing", "Status Page", "Support",
  ];
  const baseName = names[index % names.length];
  const name = index < names.length ? baseName : `${baseName} ${index}`;
  const pageName = name.toLowerCase().replace(/\s+/g, "-");
  const hasVersion = index % 3 !== 0;
  return {
    id: `pg_mock_${index}`,
    space_id: "sp_mock_1",
    name,
    page_name: pageName,
    page_url: hasVersion ? `https://${pageName}.pages.anycap.ai` : undefined,
    current_version_id: hasVersion ? `pv_mock_${index}` : null,
    access_mode: "public",
    spa_fallback: false,
    edge_version: 1,
    created_at: isoAgo(index + 5),
    updated_at: isoAgo(index),
  };
}

function mockTimelineItem(index: number): TimelineItem {
  const isTopup = index % 8 === 0;
  if (isTopup) {
    return {
      type: "credit_transaction",
      occurred_at: isoAgo(index),
      transaction_id: `txn_mock_${index}`,
      credit_cent_amount: [5000, 10000, 20000][index % 3],
      description: "Credit top-up",
    };
  }
  const cap = CAPABILITIES[index % CAPABILITIES.length];
  const model = MODELS[index % MODELS.length];
  return {
    type: "capability_call",
    occurred_at: isoAgo(index),
    request_id: `req_mock_${index}`,
    capability: cap,
    model,
    status: index % 11 === 0 ? "error" : "success",
    credit_cost: (index * 23 + 7) % 500,
  };
}

// ── paginate helper ─────────────────────────────────────────────────

function paginate<T>(
  generator: (i: number) => T,
  total: number,
  limit: number,
  offset: number,
): { items: T[]; total: number } {
  const start = Math.min(offset, total);
  const end = Math.min(start + limit, total);
  const items: T[] = [];
  for (let i = start; i < end; i++) items.push(generator(i));
  return { items, total };
}

// ── route matcher ───────────────────────────────────────────────────

function parseParams(key: string) {
  const url = new URL(key, "http://localhost");
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  return { pathname: url.pathname, limit, offset };
}

function mockFetch(key: string): unknown {
  const { pathname, limit, offset } = parseParams(key);

  if (pathname === "/v1/drive/nodes") {
    return paginate<DriveNode>(mockDriveNode, DRIVE_TOTAL, limit, offset);
  }
  if (pathname === "/v1/pages") {
    return paginate<PageSite>(mockPageSite, PAGES_TOTAL, limit, offset);
  }
  if (pathname === "/v1/logs") {
    const result = paginate<TimelineItem>(mockTimelineItem, LOGS_TOTAL, limit, offset);
    return { ...result } satisfies LogsResult;
  }
  if (pathname === "/v1/credits/balance") {
    return { available: 4200, currency: "USD", credit_cent_balance: 420000 };
  }
  if (pathname === "/v1/pricing/credit-packs") {
    return { packs: [] };
  }
  if (pathname === "/v1/dashboard/summary") {
    return {
      user: { id: "u_mock_1", email: "mock@anycap.ai", name: "Mock User" },
      balance: { available: 4200, currency: "USD", credit_cent_balance: 420000 },
      recent_activity: [],
    };
  }
  return null;
}

// ── SWR middleware ───────────────────────────────────────────────────

export function isMockEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("mock") === "1";
}

export const mockMiddleware = ((useSWRNext: any) => (key: any, _fetcher: any, config: any) => {
  const mockFetcher = (k: string) => mockFetch(k);
  return useSWRNext(key, mockFetcher, config);
}) as any;
