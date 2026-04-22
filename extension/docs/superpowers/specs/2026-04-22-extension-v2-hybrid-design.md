# AnyCap Extension v2.0 — Hybrid Capability Architecture Design

> **Date**: 2026-04-22
> **Status**: Design approved, ready for implementation plan
> **Author**: Claude Code

## 1. Overview

This document specifies the v2.0 redesign of the AnyCap Chrome Extension from a single hardcoded capability (image variation) to a **multi-capability hybrid architecture** that exposes all AnyCap platform capabilities (image, video, music generation; image/video/audio understanding; web search/crawl; Drive/Page save) through a unified browser interface.

### Core Philosophy: Context-Aware, User-Controlled

- **High-frequency capabilities** appear directly in the browser context menu (one-click access)
- **All capabilities** are accessible through the popup's unified capability panel
- **User controls** which capabilities appear in the context menu via the settings page
- **Context detection** determines what capabilities are relevant to the current element/selection/page

## 2. Architecture

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CONTENT SCRIPT                           │
│  • Detects context (image / text-selection / page / video)   │
│  • Captures metadata (src, dimensions, selected text, URL)   │
│  • Reports context to background on contextmenu event        │
└──────────────────────┬──────────────────────────────────────┘
                       │ context + metadata
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKGROUND (Service Worker)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ContextAnalyzer│  │MenuBuilder   │  │Capability    │      │
│  │              │  │              │  │Registry      │      │
│  │ • element    │  │ • buildMenu  │  │ • register() │      │
│  │   type       │  │ • updateMenu │  │ • list()     │      │
│  │ • metadata   │  │              │  │ • get()      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                         │                                    │
│                    chrome.contextMenus                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ click
┌──────────────────────▼──────────────────────────────────────┐
│                      POPUP (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Router        │  │CapabilityForm│  │ResultsView   │      │
│  │              │  │              │  │              │      │
│  │ • select    │  │ • prompt     │  │ • image      │      │
│  │ • render    │  │ • model      │  │ • text       │      │
│  │   form      │  │ • params     │  │ • error      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │CapabilityPanel│  │SettingsPage  │                        │
│  │              │  │              │                        │
│  │ • grid of   │  │ • toggles   │                        │
│  │   cards     │  │ • defaults  │                        │
│  │ • categories│  │ • shortcuts │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     ANYCAP SERVER                            │
│  POST /v1/image/generate   POST /v1/video/generate          │
│  POST /v1/music/generate   POST /v1/capabilities/image/read │
│  POST /v1/capabilities/video/read                           │
│  GET  /v1/web/search       POST /v1/web/crawl               │
│  Drive/Page APIs...                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Module Structure

```
entrypoints/
  background.ts              # Menu registration + message routing
  content.ts                 # Context detection + element capture
  popup/
    App.tsx                  # Root router
    CapabilityPanel.tsx      # Grid of all available capabilities
    CapabilityForm.tsx       # Generic form renderer (prompt, model, params)
    ResultView.tsx           # Generic result renderer
    Settings.tsx             # Capability toggles + preferences
  options/
    App.tsx                  # Full settings page

src/core/
  capability-registry.ts     # Central capability definitions
  context-analyzer.ts        # Detect what's under cursor/selection
  menu-builder.ts            # Build dynamic context menus
  popup-router.ts            # Route to correct form/view

capabilities/
  _shared/
    types.ts                 # Shared capability types
    CapabilityFormBase.tsx   # Reusable form shell
    ModelSelector.tsx        # Model dropdown from server
  image/
    variation/               # Existing image variation
      form.tsx
      result.tsx
    generate/                # Text → Image
      form.tsx
    edit/                    # Image edit (inpaint etc.)
      form.tsx
    understand/              # Image understanding
      form.tsx
      result.tsx
  video/
    generate/                # Text/Image → Video
      form.tsx
  music/
    generate/                # Text → Music
      form.tsx
  web/
    search/                  # Selected text → search results
      form.tsx
      result.tsx
    crawl/                   # Current page → Markdown
      form.tsx
      result.tsx
  drive/
    save/                    # Image/Page → Drive
      form.tsx
  page/
    deploy/                  # Current page → static site
      form.tsx
```

## 3. Capability Registry

### 3.1 Capability Definition

```typescript
interface Capability {
  id: string;                    // e.g. 'image-variation'
  category: 'image' | 'video' | 'music' | 'web' | 'drive' | 'page';
  name: string;                  // Display name
  description: string;           // Short description
  icon: string;                  // SVG icon name

  // Context matching
  contexts: ContextType[];       // When is this capability available?
  priority: 'high' | 'normal';   // Default menu placement

  // API
  apiEndpoint: string;           // e.g. '/v1/image/generate'
  apiMethod: 'GET' | 'POST';
  defaultParams?: Record<string, any>;

  // UI
  formSchema: FormField[];       // Dynamic form fields
  resultType: 'image' | 'video' | 'audio' | 'text' | 'markdown' | 'link';
}

type ContextType =
  | 'image'           // Right-clicked an image
  | 'video'           // Right-clicked a video
  | 'audio'           // Right-clicked audio
  | 'text-selection'  // Text is selected
  | 'page'            // Right-clicked page background
  | 'link'            // Right-clicked a link
  | 'any';            // Always available
```

### 3.2 Registered Capabilities

| ID | Category | Name | Contexts | Priority | Result Type |
|----|----------|------|----------|----------|-------------|
| `image-variation` | image | Generate Variation | image | **high** | image |
| `image-generate` | image | Generate Image from Text | text-selection | **high** | image |
| `image-edit` | image | Edit Image | image | normal | image |
| `image-understand` | image | Analyze Image | image | normal | text |
| `video-generate` | video | Generate Video | image, text-selection | normal | video |
| `music-generate` | music | Generate Music | text-selection | normal | audio |
| `web-search` | web | Search Web | text-selection | **high** | text |
| `web-crawl` | web | Save Page as Markdown | page | normal | markdown |
| `drive-save-image` | drive | Save Image to Drive | image | normal | link |
| `drive-save-page` | drive | Save Page to Drive | page | normal | link |
| `page-deploy` | page | Deploy as Site | page | normal | link |

## 4. Context Menu System

### 4.1 Context Detection (Content Script)

When user right-clicks, content script analyzes the event target:

```typescript
interface DetectedContext {
  type: ContextType;
  element?: {
    tagName: string;
    src?: string;           // For images/videos/audio
    naturalWidth?: number;  // For images
    naturalHeight?: number;
    duration?: number;      // For videos
  };
  selection?: {
    text: string;
    length: number;
  };
  page: {
    url: string;
    title: string;
  };
}
```

**Detection rules** (priority order):
1. If `event.target` is `<img>` → `image`
2. If `event.target` is `<video>` → `video`
3. If `window.getSelection().toString()` is non-empty → `text-selection`
4. If `event.target` is `<a>` → `link`
5. Otherwise → `page`

### 4.2 Dynamic Menu Building

Background receives context from content script and builds the menu:

```typescript
// Menu structure
AnyCap (parent menu)
├── High-priority capabilities (direct children)
│   ├── "Generate variation"      (if context=image)
│   ├── "Generate image from text" (if context=text-selection)
│   └── "Search web"             (if context=text-selection)
└── "More AnyCap tools..."        (always present)
    └── Opens popup with CapabilityPanel
```

**Menu update flow**:
1. Content script sends `ANYCAP_REPORT_CONTEXT` on every `contextmenu` event
2. Background clears existing menu items and rebuilds based on:
   - Detected context type
   - User's enabled capabilities (from storage)
   - Capability priority levels

### 4.3 Storage: User Preferences

```typescript
// chrome.storage.local
{
  enabledCapabilities: {
    // true = show in context menu (high-priority only)
    // false = only accessible via popup panel
    'image-variation': true,
    'image-generate': true,
    'web-search': true,
    'web-crawl': false,
    'video-generate': false,
    // ...
  },
  // Per-capability defaults
  defaultModels: {
    'image-generate': 'nano-banana-2',
    'video-generate': 'veo-3-1',
  },
  defaultPrompts: {
    'image-variation': 'create a stylistic variation of this image',
  },
}
```

## 5. Popup Routing System

### 5.1 View State Machine

```
[capability-panel] ──select capability──▶ [capability-form]
                                              │
                                         submit
                                              │
                                              ▼
                                        [loading]
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              [result-success]    [result-error]
                                    │                   │
                                    └─────────┬─────────┘
                                              │
                                    new / retry
                                              │
                                              ▼
                                        [capability-form]
```

### 5.2 Popup Views

| View | Route | Description |
|------|-------|-------------|
| `capability-panel` | `/` default | Grid of all capabilities, grouped by category |
| `capability-form` | `/cap/:capabilityId` | Dynamic form for selected capability |
| `loading` | `/loading` | Full-screen loading with capability-specific copy |
| `result` | `/result` | Generic result renderer (image/video/audio/text/link) |
| `history` | `/history` | Recent generations across all capabilities |
| `settings` | `/settings` | Toggle capabilities, set defaults |

### 5.3 Capability Form Renderer

Each capability defines a `formSchema` that the generic renderer consumes:

```typescript
interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'hidden';
  label: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];  // For select
}

// Example: image-generate schema
const imageGenerateSchema: FormField[] = [
  { name: 'prompt', type: 'textarea', label: 'Prompt', required: true },
  { name: 'model', type: 'select', label: 'Model', required: true,
    options: [{ label: 'Nano Banana 2', value: 'nano-banana-2' }] },
  { name: 'aspect_ratio', type: 'select', label: 'Aspect Ratio',
    options: [{ label: '1:1', value: '1:1' }, { label: '16:9', value: '16:9' }] },
];
```

The generic form renderer:
1. Reads the schema from capability registry
2. Pre-fills context-derived values (e.g., selected text → prompt field)
3. Renders fields using the schema
4. On submit, validates and sends to API

## 6. API Integration

### 6.1 Unified API Client

```typescript
// src/lib/api.ts
async function invokeCapability(
  capabilityId: string,
  params: Record<string, any>
): Promise<ApiResult> {
  const cap = registry.get(capabilityId);

  if (cap.apiMethod === 'POST') {
    return fetchJson(cap.apiEndpoint, {
      method: 'POST',
      body: JSON.stringify({ ...cap.defaultParams, ...params }),
    });
  }
  // GET with query params...
}
```

### 6.2 Capability-Specific Params

| Capability | Required Params | Optional Params |
|------------|----------------|-----------------|
| `image-variation` | `images: [url]`, `prompt` | `model`, `watermark` |
| `image-generate` | `prompt` | `model`, `aspect_ratio`, `negative_prompt` |
| `image-understand` | `images: [url]`, `instructions` | `model` |
| `video-generate` | `prompt` | `model`, `duration`, `aspect_ratio`, `images: [url]` |
| `music-generate` | `prompt` | `model`, `duration`, `tags` |
| `web-search` | `query` | `grounding`, `domain_filter` |
| `web-crawl` | `url` | — |
| `drive-save-image` | `url`, `filename` | `parent_id` |
| `drive-save-page` | `url` | `parent_id` |
| `page-deploy` | `url` or `html` | `name`, `access_mode` |

## 7. Result Rendering

### 7.1 Result Types

```typescript
type ResultType = 'image' | 'video' | 'audio' | 'text' | 'markdown' | 'link';

interface CapabilityResult {
  type: ResultType;
  // One of:
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  text?: string;
  markdown?: string;
  linkUrl?: string;
  linkTitle?: string;
  // Common:
  creditsUsed?: number;
  model?: string;
  requestId?: string;
}
```

### 7.2 Generic Result View

The `ResultView` component switches on `result.type`:

- **image**: `<img>` with download button, open in new tab
- **video**: `<video controls>` with download
- **audio**: `<audio controls>` with download
- **text**: Scrollable text area with copy button
- **markdown**: Rendered markdown with copy raw button
- **link**: Link card with open/copy buttons

All results include:
- Credit cost display
- "New" button (reset to capability form)
- "Save to Drive" action (if result is media)

## 8. Settings Page

### 8.1 Capabilities Tab

- **Grid of all capabilities** with toggle switches
- Toggle label: "Show in context menu"
- Capabilities grouped by category (Image, Video, Music, Web, Drive, Page)
- **Defaults** button: Reset to recommended defaults
- Recommended defaults ON: image-variation, image-generate, web-search
- Recommended defaults OFF: everything else

### 8.2 Defaults Tab

- Default model per capability category
- Default prompt templates (editable)
- Default folder for Drive saves

### 8.3 Account Tab

- Login status + credit balance
- Logout
- Trial status

## 9. Data Flow: Full Example

**User right-clicks an image → wants variation**

1. **Content script** detects `target.tagName === 'IMG'`
2. Sends `ANYCAP_REPORT_CONTEXT` to background with `{ type: 'image', src, width, height }`
3. **Background** queries registry: capabilities matching `context: 'image'`
4. Builds menu: `image-variation` (high priority, top level), `image-edit`, `image-understand`, `drive-save-image`, `video-generate` (normal priority, under "More...")
5. User clicks "Generate variation"
6. Background stores `{ pendingRequest: { capabilityId: 'image-variation', context, params } }`
7. Badge shows "1", popup opens
8. **Popup** reads pending request, router renders `image-variation/form`
9. Form pre-fills: `images: [src]`, prompt from defaults
10. User clicks Generate → API call `POST /v1/image/generate`
11. Loading state → Result state → Render image result
12. User clicks "Save to Drive" → secondary API call `POST /v1/drive/upload`

## 10. Testing Strategy

### 10.1 Unit Tests

| Module | Tests |
|--------|-------|
| `context-analyzer` | Detect image/video/text/page/link correctly |
| `menu-builder` | Build correct menu for each context type |
| `capability-registry` | Register/list/get capabilities, validate schemas |
| `popup-router` | Route correctly based on capability ID |
| `form-renderer` | Render fields from schema, validate required |
| `result-view` | Render correct component per result type |

### 10.2 E2E Tests

| Test | Description |
|------|-------------|
| Context detection | Right-click image → menu has variation; right-click text → menu has generate image |
| Menu customization | Disable variation in settings → menu no longer shows it |
| Capability flow | Select each capability, submit, verify result type |
| Settings persistence | Toggle capability, reload popup, toggle persists |
| History aggregation | Multiple capability results appear in unified history |
| Visual regression | Screenshot capability panel, each form, each result type |

## 11. Implementation Phases

### Phase 1: Foundation (week 1)
- Capability registry + types
- Context analyzer
- Menu builder
- Settings storage + UI
- Refactor existing variation into capability module

### Phase 2: Image Capabilities (week 2)
- Image variation (migrate existing)
- Image generate (text → image)
- Image understand (analysis)
- Image edit (basic)

### Phase 3: Video + Music (week 3)
- Video generate
- Music generate
- Result renderers for video/audio

### Phase 4: Web + Storage (week 4)
- Web search + crawl
- Drive save (image + page)
- Page deploy

### Phase 5: Polish (week 5)
- History unification
- Visual regression tests
- Performance optimization
- Documentation

## 12. Open Questions

1. **Model discovery**: Should popup fetch model list dynamically from `/v1/image/models` or use a bundled list?
2. **Schema-driven forms**: Should we fetch capability schemas from server (`/v1/image/models/{model}/schema`) to generate forms dynamically?
3. **Page deploy**: Does the server support URL-based page deployment, or does the extension need to extract HTML/CSS?
4. **Rate limiting**: Should the extension show credit costs before invocation?
5. **Offline capabilities**: Should any capabilities work offline (e.g., annotate, draw)? These are local-only tools in the CLI.

## 13. Appendix: File Size Budget

Current v1 build: **248 KB**

v2 estimated additions:
- Capability modules: +30 KB
- Settings page: +10 KB
- Result renderers: +15 KB
- Registry + router: +10 KB

**Target**: < 400 KB total
