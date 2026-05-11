# AnyCap Extension v2.0 Phase 1 — 基础架构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现能力注册中心、上下文检测器、动态菜单构建器、设置存储、Popup 状态机，为后续多能力扩展奠定基础。

**Architecture:** 采用"注册中心 + 上下文驱动"架构：Content Script 检测右键目标类型并上报 Background；Background 查询能力注册中心，根据当前上下文和用户设置动态构建右键菜单；Popup 从统一的状态机路由到对应视图。

**Tech Stack:** TypeScript, WXT, Chrome Extension MV3, Zustand, Tailwind CSS v4, Vitest

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/capabilities.ts` | 能力注册中心 — 定义所有能力元数据、上下文匹配、优先级排序 |
| `src/lib/context.ts` | 上下文类型定义 + Content Script 检测逻辑 |
| `src/lib/settings.ts` | 用户设置读写（哪些能力显示在右键菜单、默认值缓存） |
| `src/lib/messages.ts` | 扩展消息协议（新增 `ANYCAP_REPORT_CONTEXT` 等） |
| `src/lib/store.ts` | Popup Zustand store — 新增视图路由和 capability-form 状态 |
| `entrypoints/content.ts` | 上下文检测器 — 识别 image/selected-text/page，上报 Background |
| `entrypoints/background.ts` | 菜单构建器 — 接收上下文报告，动态构建右键菜单，存储 pendingRequest |
| `entrypoints/popup/App.tsx` | 能力面板 + 表单 + 结果视图 + 历史 + 设置的统一路由 |
| `entrypoints/popup/style.css` | Tailwind v4 主题扩展（品牌色已在上一阶段配置） |

---

## 当前架构快照（供参考）

当前 v0.1 只有单一硬编码能力：
- `background.ts` 在 `onInstalled` 中静态创建一条 `contextMenus.create({id: MENU_ID_VARIATION, contexts: ['image']})`
- `content.ts` 只监听 `contextmenu` 事件记录 `IMG` 元素信息
- 点击菜单后 Background 通过 `sendMessage` 问 Content Script 要尺寸，然后 `storePendingRequest` 写入 `chrome.storage.session`
- Popup 打开时从 session storage 读取 `pendingRequest`，显示生成表单

Phase 1 的目标是把这套硬编码流程改造成"上下文上报 → 动态菜单 → 能力选择 → 预填充表单"的通用流程。

---

### Task 1: 能力注册中心 (`src/lib/capabilities.ts`)

**Files:**
- Create: `src/lib/capabilities.ts`
- Test: `tests/unit/capabilities.test.ts`

**设计决策：**
- 能力元数据是静态配置（TypeScript 常量数组），不需要从服务器拉取 — 能力的存在是扩展的功能边界，不是数据
- 模型列表和 schema 才是动态从服务器拉的（Phase 2 实现）
- 每个能力定义：id、displayName、category、applicableContexts、priority、resultType

- [ ] **Step 1: 写失败测试 — 能力注册表基础查询**

```typescript
import { describe, it, expect } from 'vitest';
import { getCapabilitiesForContext, CAPABILITY_REGISTRY } from '@/src/lib/capabilities';

describe('capability registry', () => {
  it('returns image capabilities for image context', () => {
    const caps = getCapabilitiesForContext('image');
    expect(caps.some(c => c.id === 'image-variation')).toBe(true);
    expect(caps.some(c => c.id === 'image-generate')).toBe(false);
  });

  it('returns selected-text capabilities for text context', () => {
    const caps = getCapabilitiesForContext('selected-text');
    expect(caps.some(c => c.id === 'image-generate')).toBe(true);
    expect(caps.some(c => c.id === 'web-search')).toBe(true);
  });

  it('returns page capabilities for page context', () => {
    const caps = getCapabilitiesForContext('page');
    expect(caps.some(c => c.id === 'web-crawl')).toBe(true);
    expect(caps.some(c => c.id === 'drive-save-page')).toBe(true);
  });

  it('sorts by priority descending', () => {
    const caps = getCapabilitiesForContext('image');
    const priorities = caps.map(c => c.priority === 'high' ? 2 : 1);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeLessThanOrEqual(priorities[i - 1]);
    }
  });
});
```

Run: `cd /Users/shwang/projects/anycap/extension && pnpm vitest run tests/unit/capabilities.test.ts`
Expected: FAIL — `getCapabilitiesForContext` not defined

- [ ] **Step 2: 实现能力注册中心**

```typescript
export type CapabilityContext = 'image' | 'selected-text' | 'page';
export type Priority = 'high' | 'normal' | 'low';
export type ResultType = 'image' | 'video' | 'audio' | 'text' | 'markdown' | 'link';
export type CapabilityCategory = 'image' | 'video' | 'music' | 'web' | 'storage' | 'site';

export interface Capability {
  id: string;
  displayName: string;
  category: CapabilityCategory;
  applicableContexts: CapabilityContext[];
  priority: Priority;
  resultType: ResultType;
}

export const CAPABILITY_REGISTRY: Capability[] = [
  { id: 'image-variation', displayName: 'Generate Variation', category: 'image', applicableContexts: ['image'], priority: 'high', resultType: 'image' },
  { id: 'image-generate', displayName: 'Generate Image', category: 'image', applicableContexts: ['selected-text'], priority: 'high', resultType: 'image' },
  { id: 'image-edit', displayName: 'Edit Image', category: 'image', applicableContexts: ['image'], priority: 'normal', resultType: 'image' },
  { id: 'image-understand', displayName: 'Analyze Image', category: 'image', applicableContexts: ['image'], priority: 'normal', resultType: 'text' },
  { id: 'video-generate', displayName: 'Generate Video', category: 'video', applicableContexts: ['image', 'selected-text'], priority: 'normal', resultType: 'video' },
  { id: 'music-generate', displayName: 'Generate Music', category: 'music', applicableContexts: ['selected-text'], priority: 'normal', resultType: 'audio' },
  { id: 'web-search', displayName: 'Search Web', category: 'web', applicableContexts: ['selected-text'], priority: 'high', resultType: 'text' },
  { id: 'web-crawl', displayName: 'Save as Markdown', category: 'web', applicableContexts: ['page'], priority: 'normal', resultType: 'markdown' },
  { id: 'drive-save-image', displayName: 'Save Image to Drive', category: 'storage', applicableContexts: ['image'], priority: 'normal', resultType: 'link' },
  { id: 'drive-save-page', displayName: 'Save Page to Drive', category: 'storage', applicableContexts: ['page'], priority: 'normal', resultType: 'link' },
  { id: 'page-deploy', displayName: 'Deploy as Site', category: 'site', applicableContexts: ['page'], priority: 'normal', resultType: 'link' },
];

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, normal: 2, low: 1 };

export function getCapabilitiesForContext(context: CapabilityContext): Capability[] {
  return CAPABILITY_REGISTRY
    .filter(c => c.applicableContexts.includes(context))
    .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
}

export function getCapabilityById(id: string): Capability | undefined {
  return CAPABILITY_REGISTRY.find(c => c.id === id);
}
```

Run: `pnpm vitest run tests/unit/capabilities.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/capabilities.ts tests/unit/capabilities.test.ts
git commit -m "feat(capabilities): capability registry with context filtering and priority sorting"
```

---

### Task 2: 上下文类型与检测 (`src/lib/context.ts` + `entrypoints/content.ts`)

**Files:**
- Create: `src/lib/context.ts`
- Modify: `entrypoints/content.ts`
- Test: `tests/unit/context.test.ts`

**设计决策：**
- Content Script 在 `contextmenu` 事件时检测目标类型，记录到 `lastContext`，但不直接发消息给 Background（避免每条右键都发消息）
- 只有当用户实际点击了菜单项时，Background 才通过 `sendMessage` 向 Content Script 索取当前上下文
- 这样减少消息流量，也避免在普通右键（不选 AnyCap 菜单）时产生副作用

- [ ] **Step 1: 写失败测试 — 上下文检测**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectContext } from '@/src/lib/context';

describe('context detection', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('detects image context when target is IMG', () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/photo.jpg';
    document.body.appendChild(img);

    const event = new MouseEvent('contextmenu', { bubbles: true });
    img.dispatchEvent(event);

    const ctx = detectContext(event);
    expect(ctx.type).toBe('image');
    expect(ctx.image?.src).toBe('https://example.com/photo.jpg');
  });

  it('detects selected-text context when text is selected', () => {
    const p = document.createElement('p');
    p.textContent = 'Hello world';
    document.body.appendChild(p);

    const selection = window.getSelection();
    selection?.selectAllChildren(p);

    const event = new MouseEvent('contextmenu', { bubbles: true });
    p.dispatchEvent(event);

    const ctx = detectContext(event);
    expect(ctx.type).toBe('selected-text');
    expect(ctx.text).toBe('Hello world');

    selection?.removeAllRanges();
  });

  it('falls back to page context when no image or selection', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const event = new MouseEvent('contextmenu', { bubbles: true });
    div.dispatchEvent(event);

    const ctx = detectContext(event);
    expect(ctx.type).toBe('page');
    expect(ctx.pageUrl).toBe(window.location.href);
  });
});
```

Run: `pnpm vitest run tests/unit/context.test.ts`
Expected: FAIL — `detectContext` not defined

- [ ] **Step 2: 实现上下文检测模块**

```typescript
// src/lib/context.ts
import { shouldShowMenu, type ImageInfo } from './image-filter';

export type CapabilityContext = 'image' | 'selected-text' | 'page';

export interface DetectedContext {
  type: CapabilityContext;
  pageUrl: string;
  image?: ImageInfo;
  text?: string;
}

export function detectContext(event: MouseEvent): DetectedContext {
  const pageUrl = location.href;

  // 1. Check if target is an image
  const target = event.target as HTMLElement;
  if (target.tagName === 'IMG') {
    const img = target as HTMLImageElement;
    const info: ImageInfo = {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      src: img.src,
    };
    if (shouldShowMenu(info)) {
      return { type: 'image', pageUrl, image: info };
    }
  }

  // 2. Check for selected text
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 0) {
    return { type: 'selected-text', pageUrl, text: selection };
  }

  // 3. Default to page context
  return { type: 'page', pageUrl };
}
```

Run: `pnpm vitest run tests/unit/context.test.ts`
Expected: PASS

- [ ] **Step 3: 更新 Content Script 使用新检测逻辑**

把 `entrypoints/content.ts` 从「只记录图片」改为「记录完整上下文」：

```typescript
import { defineContentScript } from 'wxt/utils/define-content-script';
import { detectContext, type DetectedContext } from '@/src/lib/context';

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['file://*/*'],
  main() {
    let lastContext: DetectedContext | null = null;

    document.addEventListener('contextmenu', (event) => {
      lastContext = detectContext(event);
    });

    // Clean up on navigation (SPA)
    const observer = new MutationObserver(() => {
      lastContext = null;
    });
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'ANYCAP_GET_CONTEXT') {
        sendResponse({
          type: 'ANYCAP_REPORT_CONTEXT',
          context: lastContext ?? { type: 'page', pageUrl: location.href },
        });
        return true;
      }
      return false;
    });
  },
});
```

**注意：** 旧消息 `ANYCAP_INVOKE_VARIATION` 在此阶段不再使用，Phase 1 完成后删除。

- [ ] **Step 4: 更新 Content Script 测试**

`tests/unit/content.test.ts` 当前测试 `ANYCAP_INVOKE_VARIATION` 响应，需要更新为测试 `ANYCAP_GET_CONTEXT`：

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('content script context detection', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('responds to ANYCAP_GET_CONTEXT with detected context', async () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    img.naturalWidth = 512;
    img.naturalHeight = 512;
    document.body.appendChild(img);

    // Simulate right-click
    const event = new MouseEvent('contextmenu', { bubbles: true });
    img.dispatchEvent(event);

    // Trigger message handler (test helper sends message to content script mock)
    const response = await sendMessage({ type: 'ANYCAP_GET_CONTEXT' });
    expect(response.type).toBe('ANYCAP_REPORT_CONTEXT');
    expect(response.context.type).toBe('image');
    expect(response.context.image?.src).toBe('https://example.com/test.jpg');
  });
});
```

Run: `pnpm vitest run tests/unit/content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/context.ts tests/unit/context.test.ts entrypoints/content.ts tests/unit/content.test.ts
git commit -m "feat(context): detect image/selected-text/page context in content script"
```

---

### Task 3: 设置存储 (`src/lib/settings.ts`)

**Files:**
- Create: `src/lib/settings.ts`
- Test: `tests/unit/settings.test.ts`

**设计决策：**
- 用 `chrome.storage.sync` 存设置（跨设备同步）
- 默认：所有 `priority: 'high'` 的能力自动显示在右键菜单，其余默认关闭但用户可手动开启
- 设置键名：`contextMenuCapabilities` — 能力 id 字符串数组

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getContextMenuCapabilities, setContextMenuCapabilities, DEFAULT_CONTEXT_MENU_CAPS } from '@/src/lib/settings';

describe('settings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    chrome.storage.sync.get.mockResolvedValue({});
  });

  it('returns default high-priority capabilities when nothing is set', async () => {
    const caps = await getContextMenuCapabilities();
    expect(caps).toEqual(DEFAULT_CONTEXT_MENU_CAPS);
    expect(caps).toContain('image-variation');
    expect(caps).toContain('image-generate');
    expect(caps).toContain('web-search');
  });

  it('returns user-configured capabilities', async () => {
    chrome.storage.sync.get.mockResolvedValue({ contextMenuCapabilities: ['image-variation', 'web-crawl'] });
    const caps = await getContextMenuCapabilities();
    expect(caps).toEqual(['image-variation', 'web-crawl']);
  });

  it('saves capabilities', async () => {
    await setContextMenuCapabilities(['image-variation']);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ contextMenuCapabilities: ['image-variation'] });
  });
});
```

Run: `pnpm vitest run tests/unit/settings.test.ts`
Expected: FAIL

- [ ] **Step 2: 实现设置存储**

```typescript
// src/lib/settings.ts
import { CAPABILITY_REGISTRY } from './capabilities';

const STORAGE_KEY = 'contextMenuCapabilities';

export const DEFAULT_CONTEXT_MENU_CAPS: string[] = CAPABILITY_REGISTRY
  .filter(c => c.priority === 'high')
  .map(c => c.id);

export async function getContextMenuCapabilities(): Promise<string[]> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? DEFAULT_CONTEXT_MENU_CAPS;
}

export async function setContextMenuCapabilities(capabilityIds: string[]): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: capabilityIds });
}

export async function isCapabilityEnabled(id: string): Promise<boolean> {
  const enabled = await getContextMenuCapabilities();
  return enabled.includes(id);
}

export async function toggleCapability(id: string): Promise<void> {
  const enabled = await getContextMenuCapabilities();
  const idx = enabled.indexOf(id);
  if (idx >= 0) {
    enabled.splice(idx, 1);
  } else {
    enabled.push(id);
  }
  await setContextMenuCapabilities(enabled);
}
```

Run: `pnpm vitest run tests/unit/settings.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/settings.ts tests/unit/settings.test.ts
git commit -m "feat(settings): user-configurable context menu capabilities with sync storage"
```

---

### Task 4: 动态菜单构建器 (`src/lib/menu-builder.ts` + `entrypoints/background.ts`)

**Files:**
- Create: `src/lib/menu-builder.ts`
- Modify: `entrypoints/background.ts`
- Test: `tests/unit/menu-builder.test.ts`
- Test: `tests/unit/background.test.ts`（已有，需大幅更新）

**关键设计修正：**
Chrome 的 `contextMenus` API 不支持在每次右键时动态创建菜单（菜单是全局注册的）。正确做法是：
1. `onInstalled` 中**一次性注册所有能力菜单项**，按 `contexts` 分类（image、selection、page）
2. 高优先级直接显示，低优先级挂在 "More tools" 子菜单下
3. 用户设置决定哪些能力被启用 — 通过 `chrome.contextMenus.update(id, { visible: true/false })` 控制显隐
4. 设置变更时调用 `updateMenuVisibility()` 更新

这样 Chrome 会自动根据右键目标类型（图片/选中文本/页面）显示对应菜单，不需要每次右键都重建。

- [ ] **Step 1: 写失败测试 — 菜单构建器**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeMenus, updateMenuVisibility, parseMenuItemId, createPendingRequest } from '@/src/lib/menu-builder';

describe('menu builder', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    chrome.contextMenus.create.mockClear();
    chrome.contextMenus.removeAll.mockClear();
    chrome.storage.sync.get.mockResolvedValue({});
  });

  it('creates all capability menu items on initialize', async () => {
    await initializeMenus();
    expect(chrome.contextMenus.removeAll).toHaveBeenCalled();
    expect(chrome.contextMenus.create.mock.calls.length).toBeGreaterThan(5);
  });

  it('parses menu item id correctly', () => {
    expect(parseMenuItemId('anycap-image-variation')).toBe('image-variation');
    expect(parseMenuItemId('anycap-more-tools')).toBeNull();
    expect(parseMenuItemId(123)).toBeNull();
  });

  it('creates pending request from raw context', () => {
    const raw = {
      type: 'image',
      pageUrl: 'https://example.com',
      image: { src: 'https://example.com/img.jpg', naturalWidth: 512, naturalHeight: 512 },
    };
    const pending = createPendingRequest('image-variation', raw);
    expect(pending.capabilityId).toBe('image-variation');
    expect(pending.context.image?.srcUrl).toBe('https://example.com/img.jpg');
    expect(pending.context.image?.width).toBe(512);
  });
});
```

Run: `pnpm vitest run tests/unit/menu-builder.test.ts`
Expected: FAIL

- [ ] **Step 2: 实现菜单构建核心模块**

```typescript
// src/lib/menu-builder.ts
import { CAPABILITY_REGISTRY, type CapabilityContext } from './capabilities';
import { getContextMenuCapabilities } from './settings';

export const MENU_PREFIX = 'anycap-';
export const MENU_MORE_TOOLS = `${MENU_PREFIX}more-tools`;

export interface PendingRequest {
  capabilityId: string;
  context: {
    type: CapabilityContext;
    pageUrl: string;
    image?: { srcUrl: string; width: number; height: number };
    text?: string;
  };
}

function toChromeContexts(capContexts: CapabilityContext[]): chrome.contextMenus.ContextType[] {
  const result = new Set<chrome.contextMenus.ContextType>();
  for (const c of capContexts) {
    if (c === 'image') result.add('image');
    if (c === 'selected-text') result.add('selection');
    if (c === 'page') result.add('page');
  }
  return Array.from(result);
}

export async function initializeMenus(): Promise<void> {
  await chrome.contextMenus.removeAll();

  // Create "More tools" parent menu
  const allNormal = CAPABILITY_REGISTRY.filter(c => c.priority !== 'high');
  const allContexts = Array.from(new Set(allNormal.flatMap(c => c.applicableContexts)));
  if (allNormal.length > 0) {
    chrome.contextMenus.create({
      id: MENU_MORE_TOOLS,
      title: 'More tools',
      contexts: toChromeContexts(allContexts),
    });
  }

  // Create each capability menu item
  for (const cap of CAPABILITY_REGISTRY) {
    const contexts = toChromeContexts(cap.applicableContexts);
    const isNormal = cap.priority !== 'high';

    chrome.contextMenus.create({
      id: `${MENU_PREFIX}${cap.id}`,
      title: cap.displayName,
      contexts,
      parentId: isNormal ? MENU_MORE_TOOLS : undefined,
    });
  }
}

export async function updateMenuVisibility(): Promise<void> {
  const enabledIds = await getContextMenuCapabilities();
  for (const cap of CAPABILITY_REGISTRY) {
    const menuId = `${MENU_PREFIX}${cap.id}`;
    const visible = enabledIds.includes(cap.id);
    chrome.contextMenus.update(menuId, { visible });
  }
}

export function parseMenuItemId(menuItemId: string | number): string | null {
  if (typeof menuItemId !== 'string') return null;
  if (!menuItemId.startsWith(MENU_PREFIX)) return null;
  return menuItemId.slice(MENU_PREFIX.length);
}

export function createPendingRequest(capabilityId: string, rawContext: any): PendingRequest {
  const context: PendingRequest['context'] = {
    type: rawContext.type,
    pageUrl: rawContext.pageUrl,
  };
  if (rawContext.image) {
    context.image = {
      srcUrl: rawContext.image.src,
      width: rawContext.image.naturalWidth ?? rawContext.image.width ?? 256,
      height: rawContext.image.naturalHeight ?? rawContext.image.height ?? 256,
    };
  }
  if (rawContext.text) {
    context.text = rawContext.text;
  }
  return { capabilityId, context };
}
```

Run: `pnpm vitest run tests/unit/menu-builder.test.ts`
Expected: PASS

- [ ] **Step 3: 重写 background.ts**

```typescript
import { defineBackground } from 'wxt/utils/define-background';
import { WELCOME_URL } from '@/src/lib/constants';
import { initializeMenus, updateMenuVisibility, parseMenuItemId, createPendingRequest, type PendingRequest } from '@/src/lib/menu-builder';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async (details) => {
    await initializeMenus();
    await updateMenuVisibility();

    if (details.reason === 'install') {
      chrome.tabs.create({ url: WELCOME_URL });
    }
  });

  // When settings change, update menu visibility
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.contextMenuCapabilities) {
      updateMenuVisibility();
    }
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const capabilityId = parseMenuItemId(info.menuItemId);
    if (!capabilityId || !tab?.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'ANYCAP_GET_CONTEXT' });
    if (!response?.context) return;

    const pending = createPendingRequest(capabilityId, response.context);
    await storePendingRequest(pending);
  });

  async function storePendingRequest(pending: PendingRequest) {
    await chrome.storage.session.set({ pendingRequest: pending });
    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7d3a' });
    chrome.action.openPopup?.().catch(() => {});
  }
});
```

- [ ] **Step 4: 更新消息协议**

在 `src/lib/messages.ts` 中追加（保留旧类型以兼容）：

```typescript
export type GetContextMsg = {
  type: 'ANYCAP_GET_CONTEXT';
};

export type ReportContextMsg = {
  type: 'ANYCAP_REPORT_CONTEXT';
  context: {
    type: 'image' | 'selected-text' | 'page';
    pageUrl: string;
    image?: { src: string; naturalWidth: number; naturalHeight: number };
    text?: string;
  };
};

export function isReportContext(m: unknown): m is ReportContextMsg {
  if (!m || typeof m !== 'object') return false;
  const msg = m as Record<string, unknown>;
  return msg.type === 'ANYCAP_REPORT_CONTEXT' && !!msg.context;
}
```

- [ ] **Step 5: 更新 Background 测试**

重写 `tests/unit/background.test.ts` 测试 `initializeMenus` 和菜单点击后的 pending request 存储。保持现有的 mock 策略（mock `wxt/utils/define-background` 导出 identity 函数，然后 import 并调用 background module）。

Run: `pnpm vitest run tests/unit/background.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/menu-builder.ts tests/unit/menu-builder.test.ts entrypoints/background.ts tests/unit/background.test.ts src/lib/messages.ts tests/unit/messages.test.ts
git commit -m "feat(menu): dynamic context menu builder with capability registry and settings-driven visibility"
```

---

### Task 5: Popup 状态机与路由 (`src/lib/store.ts` + `entrypoints/popup/App.tsx`)

**Files:**
- Modify: `src/lib/store.ts`
- Modify: `entrypoints/popup/App.tsx`
- Test: `tests/unit/store.test.ts`（已有，需更新）

**设计决策：**
- Store 新增视图：`capability-panel`（默认）、`capability-form`、`loading`、`result-success`、`result-error`、`history`、`settings`、`paywall`
- `pendingRequest` 类型改为新格式（含 `capabilityId` + `context`）
- Phase 1 中 `capability-form` 只渲染 `image-variation` 的现有表单，其他能力显示「Coming soon」占位

- [ ] **Step 1: 更新 Store 测试**

```typescript
import { describe, it, expect } from 'vitest';
import { useStore } from '@/src/lib/store';

describe('store', () => {
  it('defaults to capability-panel view', () => {
    const state = useStore.getState();
    expect(state.view).toBe('capability-panel');
  });

  it('sets pending request with capabilityId', () => {
    useStore.getState().setPendingRequest({
      capabilityId: 'image-variation',
      context: { type: 'image', pageUrl: 'https://example.com', image: { srcUrl: 'https://example.com/img.jpg', width: 512, height: 512 } },
    });
    expect(useStore.getState().pendingRequest?.capabilityId).toBe('image-variation');
  });

  it('can navigate to capability-form', () => {
    useStore.getState().setView('capability-form');
    expect(useStore.getState().view).toBe('capability-form');
  });
});
```

Run: `pnpm vitest run tests/unit/store.test.ts`
Expected: FAIL（接口已变）

- [ ] **Step 2: 重写 Store**

```typescript
import { create } from 'zustand';
import { AnyCapError } from './errors';

export type PopupView =
  | 'capability-panel'
  | 'capability-form'
  | 'loading'
  | 'result-success'
  | 'result-error'
  | 'history'
  | 'settings'
  | 'paywall';

export type GenerationState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success'; resultUrl: string }
  | { phase: 'error'; error: AnyCapError };

export interface PendingRequest {
  capabilityId: string;
  context: {
    type: 'image' | 'selected-text' | 'page';
    pageUrl: string;
    image?: { srcUrl: string; width: number; height: number };
    text?: string;
  };
}

type Store = {
  view: PopupView;
  generation: GenerationState;
  pendingRequest: PendingRequest | null;
  remainingTrials: number;
  isAuthed: boolean;

  setView: (v: PopupView) => void;
  setGeneration: (g: GenerationState) => void;
  setPendingRequest: (r: PendingRequest | null) => void;
  setAuthState: (isAuthed: boolean, remainingTrials: number) => void;
  reset: () => void;
};

export const useStore = create<Store>((set) => ({
  view: 'capability-panel',
  generation: { phase: 'idle' },
  pendingRequest: null,
  remainingTrials: 0,
  isAuthed: false,

  setView: (v) => set({ view: v }),
  setGeneration: (g) => set({ generation: g }),
  setPendingRequest: (r) => set({ pendingRequest: r }),
  setAuthState: (isAuthed, remainingTrials) => set({ isAuthed, remainingTrials }),
  reset: () =>
    set({
      view: 'capability-panel',
      generation: { phase: 'idle' },
      pendingRequest: null,
    }),
}));
```

Run: `pnpm vitest run tests/unit/store.test.ts`
Expected: PASS

- [ ] **Step 3: 重写 Popup App.tsx（Phase 1 兼容版）**

保持现有所有业务逻辑不变，只做以下调整：
1. `useEffect` 中读取 `pendingRequest` 时，兼容旧格式（没有 `capabilityId` 的）和新格式
2. 当没有 `pendingRequest` 时，默认显示 `capability-panel` 视图（品牌文案 + 提示）
3. 当 `pendingRequest.capabilityId === 'image-variation'` 时，渲染现有生成表单
4. 当 `pendingRequest.capabilityId` 是其他值时，显示「Coming soon」占位
5. Header 增加「Settings」按钮，可切换到设置视图
6. 设置视图显示能力开关列表

由于 App.tsx 当前已有完整业务逻辑（约 280 行），修改时建议：
- 保留 `handleGenerate`、结果视图、Paywall 视图、历史记录等全部逻辑
- 新增 `SettingsView` 和 `CapabilityPanelView` 子组件
- 在 `return` 前增加 view 路由

**具体修改点（以 diff 方式描述）：**

```tsx
// 1. pendingRequest 兼容读取
useEffect(() => {
  (async () => {
    const session = await chrome.storage.session.get('pendingRequest');
    if (session.pendingRequest && typeof session.pendingRequest === 'object') {
      const pr = session.pendingRequest as any;
      // 兼容旧格式：旧格式只有 image/pageUrl，没有 capabilityId
      if (!pr.capabilityId && pr.image) {
        pr.capabilityId = 'image-variation';
        pr.context = {
          type: 'image',
          pageUrl: pr.pageUrl ?? '',
          image: { srcUrl: pr.image.srcUrl, width: pr.image.width, height: pr.image.height },
        };
      }
      store.setPendingRequest(pr);
      store.setView('capability-form');
      await chrome.storage.session.remove('pendingRequest');
    }
    // ... rest of useEffect unchanged ...
  })();
}, []);

// 2. return 前增加路由
if (store.view === 'settings') {
  return <SettingsView onBack={() => store.setView('capability-panel')} />;
}

if (store.view === 'capability-panel' && !store.pendingRequest) {
  return (
    <div className="p-5 w-80">
      <div className="flex items-center gap-2">
        <AnycapMark size={28} />
        <h1 className="text-base font-bold text-olive">AnyCap</h1>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-text-body">
          Right-click any image, text selection, or page to use AnyCap.
        </p>
      </div>
      <button
        onClick={() => store.setView('settings')}
        className="mt-4 w-full bg-surface-input border border-border-input text-text-body text-sm font-medium py-2.5 rounded-xl hover:bg-surface-hover"
      >
        Settings
      </button>
    </div>
  );
}

// 3. capability-form 路由
if (store.pendingRequest) {
  if (store.pendingRequest.capabilityId !== 'image-variation') {
    return (
      <div className="p-5 w-80 text-center">
        <h2 className="text-base font-bold text-text-primary">Coming Soon</h2>
        <p className="text-sm text-text-body mt-1">
          {store.pendingRequest.capabilityId} will be available in a future update.
        </p>
        <button
          onClick={() => { store.reset(); store.setView('capability-panel'); }}
          className="mt-3 bg-olive text-white text-sm font-medium py-2.5 rounded-xl hover:bg-olive-hover"
        >
          Back
        </button>
      </div>
    );
  }
  // 现有的 generate 表单逻辑...
}
```

- [ ] **Step 4: 更新 E2E 测试**

`tests/e2e/popup.spec.ts` 和 `tests/e2e/visual.spec.ts` 中的选择器需要根据新 className 更新（颜色类名已在上一个阶段改为 `text-olive` 等，已在运行中）。需要额外更新：
- 默认视图断言：从检查 `Right-click any image...` 改为检查 `AnyCap` + `Settings` 按钮
- pendingRequest mock 数据需要包含新格式 `capabilityId` 和 `context`

- [ ] **Step 5: 运行全部测试**

Run: `pnpm test`
Expected: 61 unit tests PASS

Run: `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e`
Expected: E2E tests PASS（需要显式批准，因为该命令会打开 headed Chromium）

- [ ] **Step 6: Commit**

```bash
git add src/lib/store.ts entrypoints/popup/App.tsx tests/unit/store.test.ts tests/e2e/
git commit -m "feat(popup): capability-panel view, settings page, and capability-form routing"
```

---

## 测试策略汇总

| 模块 | 单元测试文件 | 覆盖点 |
|------|-------------|--------|
| capabilities | `tests/unit/capabilities.test.ts` | 上下文过滤、优先级排序、id 查询 |
| context | `tests/unit/context.test.ts` | 图片/选中文本/页面检测 |
| settings | `tests/unit/settings.test.ts` | 默认设置读写、toggle、跨标签同步 |
| menu-builder | `tests/unit/menu-builder.test.ts` | menu id 解析、pending request 组装、初始化 |
| messages | `tests/unit/messages.test.ts` | 新消息 type guard |
| store | `tests/unit/store.test.ts` | 新视图路由、pending request 格式 |
| background | `tests/unit/background.test.ts` | 菜单初始化、显隐更新、点击存储 |
| content | `tests/unit/content.test.ts` | 上下文检测消息响应 |

---

## Spec 覆盖自查

对照 v2.0 设计文档检查：

| 设计文档要求 | 实现任务 | 状态 |
|-------------|---------|------|
| 能力注册中心 | Task 1 `src/lib/capabilities.ts` | 覆盖 |
| 上下文检测器 | Task 2 `src/lib/context.ts` + `entrypoints/content.ts` | 覆盖 |
| 菜单构建器 | Task 4 `src/lib/menu-builder.ts` + `entrypoints/background.ts` | 覆盖 |
| 设置存储 | Task 3 `src/lib/settings.ts` | 覆盖 |
| Popup 状态机 | Task 5 `src/lib/store.ts` + `entrypoints/popup/App.tsx` | 覆盖 |
| 数据流：ANYCAP_REPORT_CONTEXT | Task 4 消息协议 + background 监听 | 覆盖 |
| 用户控制哪些能力显示在右键菜单 | Task 3 settings + Task 4 updateMenuVisibility | 覆盖 |

**未在 Phase 1 实现的（后续 Phase）：**
- 从服务器实时拉取模型列表 `/v1/{cap}/models` → Phase 2
- Schema 驱动表单 → Phase 2
- 视频/音乐/网页/存储能力 → Phase 3-4
- 历史统一 → Phase 5
- 信用预览 → Phase 2

---

## 执行方式选择

**Plan complete and saved to `docs/superpowers/plans/2026-04-22-extension-v2-phase1.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints for review

**Which approach?**
