import { defineBackground } from 'wxt/utils/define-background';
import {
  MENU_ID_VARIATION,
  MENU_TITLE,
  MENU_ID_IMAGE_FROM_TEXT,
  MENU_TITLE_IMAGE_FROM_TEXT,
  MENU_ID_VIDEO_FROM_TEXT,
  MENU_TITLE_VIDEO_FROM_TEXT,
  MENU_ID_MUSIC_FROM_TEXT,
  MENU_TITLE_MUSIC_FROM_TEXT,
  MENU_ID_SEARCH_SELECTION,
  MENU_TITLE_SEARCH_SELECTION,
  MENU_ID_CRAWL_PAGE,
  MENU_TITLE_CRAWL_PAGE,
  MENU_ID_CRAWL_LINK,
  MENU_TITLE_CRAWL_LINK,
  WELCOME_URL,
  MIN_IMAGE_DIMENSION,
} from '@/src/lib/constants';
import { isStartGeneration } from '@/src/lib/messages';

export default defineBackground(() => {
  // Toolbar click opens the side panel on the active tab.
  // setPanelBehavior is supported on Chrome 116+; we ignore failures.
  chrome.sidePanel
    ?.setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch(() => {
      // no-op — extension still works via fallback (chrome.action.onClicked)
    });

  chrome.runtime.onInstalled.addListener((details) => {
    // Image right-click — image variation
    safeCreateMenu({
      id: MENU_ID_VARIATION,
      title: MENU_TITLE,
      contexts: ['image'],
    });

    // Selection (text) right-click — generate image from selection / search selection
    safeCreateMenu({
      id: MENU_ID_IMAGE_FROM_TEXT,
      title: MENU_TITLE_IMAGE_FROM_TEXT,
      contexts: ['selection'],
    });
    safeCreateMenu({
      id: MENU_ID_VIDEO_FROM_TEXT,
      title: MENU_TITLE_VIDEO_FROM_TEXT,
      contexts: ['selection'],
    });
    safeCreateMenu({
      id: MENU_ID_MUSIC_FROM_TEXT,
      title: MENU_TITLE_MUSIC_FROM_TEXT,
      contexts: ['selection'],
    });
    safeCreateMenu({
      id: MENU_ID_SEARCH_SELECTION,
      title: MENU_TITLE_SEARCH_SELECTION,
      contexts: ['selection'],
    });

    // Page right-click (anywhere) — crawl current page
    safeCreateMenu({
      id: MENU_ID_CRAWL_PAGE,
      title: MENU_TITLE_CRAWL_PAGE,
      contexts: ['page'],
    });

    // Link right-click — crawl that link
    safeCreateMenu({
      id: MENU_ID_CRAWL_LINK,
      title: MENU_TITLE_CRAWL_LINK,
      contexts: ['link'],
    });

    if (details.reason === 'install') {
      chrome.tabs.create({ url: WELCOME_URL });
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID_VARIATION && info.srcUrl && tab?.id != null) {
      // Ask the content script for image dimensions; fall back if unavailable.
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'ANYCAP_INVOKE_VARIATION', srcUrl: info.srcUrl },
        (response) => {
          if (chrome.runtime.lastError) {
            storeVaryRequest(info.srcUrl!, undefined, undefined, info.pageUrl ?? '');
          } else if (response?.type === 'ANYCAP_START_GENERATION') {
            storeVaryRequest(
              response.image.srcUrl,
              response.image.width,
              response.image.height,
              response.pageUrl,
            );
          }
          openSidePanel(tab);
        },
      );
      return;
    }

    if (info.menuItemId === MENU_ID_IMAGE_FROM_TEXT && info.selectionText) {
      storePendingRequest(
        {
          kind: 'image-from-text',
          prompt: info.selectionText,
          pageUrl: info.pageUrl ?? '',
        },
        tab,
      );
      return;
    }

    if (info.menuItemId === MENU_ID_VIDEO_FROM_TEXT && info.selectionText) {
      storePendingRequest(
        {
          kind: 'video-from-text',
          prompt: info.selectionText,
          pageUrl: info.pageUrl ?? '',
        },
        tab,
      );
      return;
    }

    if (info.menuItemId === MENU_ID_MUSIC_FROM_TEXT && info.selectionText) {
      storePendingRequest(
        {
          kind: 'music-from-text',
          prompt: info.selectionText,
          pageUrl: info.pageUrl ?? '',
        },
        tab,
      );
      return;
    }

    if (info.menuItemId === MENU_ID_SEARCH_SELECTION && info.selectionText) {
      storePendingRequest(
        {
          kind: 'search',
          query: info.selectionText,
          pageUrl: info.pageUrl ?? '',
        },
        tab,
      );
      return;
    }

    if (info.menuItemId === MENU_ID_CRAWL_PAGE && info.pageUrl) {
      storePendingRequest(
        { kind: 'crawl', url: info.pageUrl, pageUrl: info.pageUrl },
        tab,
      );
      return;
    }

    if (info.menuItemId === MENU_ID_CRAWL_LINK && info.linkUrl) {
      storePendingRequest(
        { kind: 'crawl', url: info.linkUrl, pageUrl: info.pageUrl ?? '' },
        tab,
      );
      return;
    }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (isStartGeneration(msg)) {
      storeVaryRequest(msg.image.srcUrl, msg.image.width, msg.image.height, msg.pageUrl);
      sendResponse?.({ ok: true });
      return true;
    }
    return false;
  });

  function safeCreateMenu(props: chrome.contextMenus.CreateProperties) {
    chrome.contextMenus.create(props, () => {
      // Ignore "duplicate id" errors on update.
      if (chrome.runtime.lastError) {
        // no-op
      }
    });
  }

  function storeVaryRequest(
    srcUrl: string,
    width: number | undefined,
    height: number | undefined,
    pageUrl: string,
  ) {
    storePendingRequest(
      {
        kind: 'vary',
        image: {
          srcUrl,
          width: width ?? MIN_IMAGE_DIMENSION,
          height: height ?? MIN_IMAGE_DIMENSION,
        },
        pageUrl,
      },
      undefined,
    );
  }

  function storePendingRequest(
    payload:
      | {
          kind: 'vary';
          image: { srcUrl: string; width: number; height: number };
          pageUrl: string;
        }
      | { kind: 'image-from-text'; prompt: string; pageUrl: string }
      | { kind: 'video-from-text'; prompt: string; pageUrl: string }
      | { kind: 'music-from-text'; prompt: string; pageUrl: string }
      | { kind: 'search'; query: string; pageUrl: string }
      | { kind: 'crawl'; url: string; pageUrl: string },
    tab: chrome.tabs.Tab | undefined,
  ) {
    chrome.storage.session.set({ pendingRequest: payload });
    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7d3a' });
    openSidePanel(tab);
  }

  function openSidePanel(tab: chrome.tabs.Tab | undefined) {
    if (!tab?.windowId) return;
    // Try to show panel on this window. setOptions ensures it's enabled for
    // this tab; open is best-effort (Chrome 116+ in user-gesture).
    try {
      chrome.sidePanel.setOptions?.({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true,
      });
    } catch {}
    try {
      chrome.sidePanel.open?.({ windowId: tab.windowId }).catch(() => {});
    } catch {}
  }
});
