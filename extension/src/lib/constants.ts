export const MENU_ID_VARIATION = 'anycap-generate-variation';
export const MENU_TITLE = '✨ Generate variation with AnyCap';

// Selection (text) menus
export const MENU_ID_IMAGE_FROM_TEXT = 'anycap-image-from-text';
export const MENU_TITLE_IMAGE_FROM_TEXT = '🎨 Generate image from this text';
export const MENU_ID_VIDEO_FROM_TEXT = 'anycap-video-from-text';
export const MENU_TITLE_VIDEO_FROM_TEXT = '🎬 Generate video from this text';
export const MENU_ID_MUSIC_FROM_TEXT = 'anycap-music-from-text';
export const MENU_TITLE_MUSIC_FROM_TEXT = '🎵 Generate music from this text';
export const MENU_ID_SEARCH_SELECTION = 'anycap-search-selection';
export const MENU_TITLE_SEARCH_SELECTION = '🔍 Search with AnyCap';

// Page / link menus
export const MENU_ID_CRAWL_PAGE = 'anycap-crawl-page';
export const MENU_TITLE_CRAWL_PAGE = '📄 Crawl this page with AnyCap';
export const MENU_ID_CRAWL_LINK = 'anycap-crawl-link';
export const MENU_TITLE_CRAWL_LINK = '📄 Crawl link with AnyCap';

export const MIN_IMAGE_DIMENSION = 256;
export const MAX_ANON_TRIALS = 3;
export const DEFAULT_PROMPT = 'create a stylistic variation of this image';
// API_BASE can be overridden at build time:
//   WXT_API_BASE=http://127.0.0.1:8080 pnpm build
// Useful when prod hasn't been redeployed with the latest extension routes.
const envApiBase =
  typeof import.meta !== 'undefined' && (import.meta as any).env?.WXT_API_BASE
    ? ((import.meta as any).env.WXT_API_BASE as string)
    : '';
export const API_BASE = envApiBase || 'https://api.anycap.ai';

// MOCK_MODE swaps the API client for an in-memory mock so the entire flow
// (right-click → generate → result) works without any server. Activated by:
//   WXT_MOCK=true pnpm build
// or via the `pnpm demo` script.
const envMock =
  typeof import.meta !== 'undefined' && (import.meta as any).env?.WXT_MOCK
    ? String((import.meta as any).env.WXT_MOCK).toLowerCase()
    : '';
export const MOCK_MODE = envMock === 'true' || envMock === '1';
export const OAUTH_AUTHORIZE_URL = 'https://anycap.ai/oauth/authorize';
export const WELCOME_URL = 'https://anycap.ai/welcome-extension';
export const PRICING_URL = 'https://anycap.ai/pricing';
