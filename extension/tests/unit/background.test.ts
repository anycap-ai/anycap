import { describe, it, expect, vi, beforeEach } from 'vitest';

const contextMenusCreate = vi.fn();
const tabsCreate = vi.fn();
const onInstalledAddListener = vi.fn();
const onClickedAddListener = vi.fn();
const onMessageAddListener = vi.fn();
const storageSessionSet = vi.fn();
const sidePanelOpen = vi.fn().mockResolvedValue(undefined);
const sidePanelSetOptions = vi.fn();
const sidePanelSetPanelBehavior = vi.fn().mockResolvedValue(undefined);

(globalThis as any).chrome = {
  runtime: {
    onInstalled: { addListener: onInstalledAddListener },
    onMessage: { addListener: onMessageAddListener },
  },
  contextMenus: {
    create: contextMenusCreate,
    onClicked: { addListener: onClickedAddListener },
  },
  tabs: {
    create: tabsCreate,
    sendMessage: vi.fn(),
  },
  storage: {
    session: { set: storageSessionSet },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  sidePanel: {
    open: sidePanelOpen,
    setOptions: sidePanelSetOptions,
    setPanelBehavior: sidePanelSetPanelBehavior,
  },
};

import {
  MENU_ID_VARIATION,
  MENU_ID_IMAGE_FROM_TEXT,
  MENU_ID_VIDEO_FROM_TEXT,
  MENU_ID_MUSIC_FROM_TEXT,
  MENU_ID_SEARCH_SELECTION,
  MENU_ID_CRAWL_PAGE,
  MENU_ID_CRAWL_LINK,
  WELCOME_URL,
} from '@/src/lib/constants';

import backgroundModule from '@/entrypoints/background';

describe('background', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof backgroundModule === 'function') {
      (backgroundModule as any)();
    } else if (backgroundModule && typeof (backgroundModule as any).main === 'function') {
      (backgroundModule as any).main();
    }
  });

  it('registers all 7 context menu entries on install', () => {
    expect(onInstalledAddListener).toHaveBeenCalledTimes(1);
    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'update' });

    const ids = contextMenusCreate.mock.calls.map((c) => c[0].id);
    expect(ids).toEqual(
      expect.arrayContaining([
        MENU_ID_VARIATION,
        MENU_ID_IMAGE_FROM_TEXT,
        MENU_ID_VIDEO_FROM_TEXT,
        MENU_ID_MUSIC_FROM_TEXT,
        MENU_ID_SEARCH_SELECTION,
        MENU_ID_CRAWL_PAGE,
        MENU_ID_CRAWL_LINK,
      ]),
    );
    // Image menu must use 'image' context.
    const imageMenu = contextMenusCreate.mock.calls.find(
      (c) => c[0].id === MENU_ID_VARIATION,
    );
    expect(imageMenu).toBeDefined();
    expect(imageMenu![0].contexts).toEqual(['image']);
  });

  it('configures side panel to open on action click', () => {
    expect(sidePanelSetPanelBehavior).toHaveBeenCalledWith({ openPanelOnActionClick: true });
  });

  it('opens welcome tab on install', () => {
    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'install' });
    expect(tabsCreate).toHaveBeenCalledWith({ url: WELCOME_URL });
  });

  it('does not open welcome tab on update', () => {
    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'update' });
    expect(tabsCreate).not.toHaveBeenCalled();
  });

  it('sends message to content script on image variation click', () => {
    const sendMessage = (globalThis as any).chrome.tabs.sendMessage;
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      { menuItemId: MENU_ID_VARIATION, srcUrl: 'https://example.com/img.png', pageUrl: 'https://example.com' },
      { id: 42, windowId: 7 },
    );
    expect(sendMessage).toHaveBeenCalledWith(
      42,
      { type: 'ANYCAP_INVOKE_VARIATION', srcUrl: 'https://example.com/img.png' },
      expect.any(Function),
    );
  });

  it('stores image-from-text pending request on selection menu click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      {
        menuItemId: MENU_ID_IMAGE_FROM_TEXT,
        selectionText: 'a paper crane on a wooden table',
        pageUrl: 'https://example.com',
      },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'image-from-text',
        prompt: 'a paper crane on a wooden table',
        pageUrl: 'https://example.com',
      },
    });
    expect(sidePanelOpen).toHaveBeenCalledWith({ windowId: 1 });
  });

  it('stores video-from-text pending request on selection menu click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      {
        menuItemId: MENU_ID_VIDEO_FROM_TEXT,
        selectionText: 'a serene lake at dawn with rising mist',
        pageUrl: 'https://example.com',
      },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'video-from-text',
        prompt: 'a serene lake at dawn with rising mist',
        pageUrl: 'https://example.com',
      },
    });
  });

  it('stores music-from-text pending request on selection menu click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      {
        menuItemId: MENU_ID_MUSIC_FROM_TEXT,
        selectionText: 'mellow lo-fi beats with vinyl crackle',
        pageUrl: 'https://example.com',
      },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'music-from-text',
        prompt: 'mellow lo-fi beats with vinyl crackle',
        pageUrl: 'https://example.com',
      },
    });
  });

  it('stores search pending request on search-selection click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      {
        menuItemId: MENU_ID_SEARCH_SELECTION,
        selectionText: 'agent capability runtime',
        pageUrl: 'https://example.com',
      },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'search',
        query: 'agent capability runtime',
        pageUrl: 'https://example.com',
      },
    });
  });

  it('stores crawl pending request on crawl-page click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      { menuItemId: MENU_ID_CRAWL_PAGE, pageUrl: 'https://example.com/article' },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'crawl',
        url: 'https://example.com/article',
        pageUrl: 'https://example.com/article',
      },
    });
  });

  it('stores crawl pending request on crawl-link click', () => {
    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      {
        menuItemId: MENU_ID_CRAWL_LINK,
        linkUrl: 'https://target.example/page',
        pageUrl: 'https://example.com',
      },
      { id: 9, windowId: 1 },
    );
    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'crawl',
        url: 'https://target.example/page',
        pageUrl: 'https://example.com',
      },
    });
  });

  it('handles ANYCAP_START_GENERATION runtime message', () => {
    const messageHandler = onMessageAddListener.mock.calls[0][0];
    const msg = {
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'https://example.com/img.png', width: 300, height: 300 },
      pageUrl: 'https://example.com',
    };
    const sendResponse = vi.fn();
    messageHandler(msg, {}, sendResponse);

    expect(storageSessionSet).toHaveBeenCalledWith({
      pendingRequest: {
        kind: 'vary',
        image: { srcUrl: 'https://example.com/img.png', width: 300, height: 300 },
        pageUrl: 'https://example.com',
      },
    });
    expect(sendResponse).toHaveBeenCalledWith({ ok: true });
  });

  it('ignores unknown messages', () => {
    const messageHandler = onMessageAddListener.mock.calls[0][0];
    messageHandler({ type: 'UNKNOWN' });
    expect(storageSessionSet).not.toHaveBeenCalled();
  });
});
