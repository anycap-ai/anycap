import { defineBackground } from 'wxt/utils/define-background';
import {
  MENU_ID_VARIATION,
  MENU_TITLE,
  WELCOME_URL,
  MIN_IMAGE_DIMENSION,
} from '@/src/lib/constants';
import { isStartGeneration } from '@/src/lib/messages';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    chrome.contextMenus.create(
      {
        id: MENU_ID_VARIATION,
        title: MENU_TITLE,
        contexts: ['image'],
      },
      () => {
        // Ignore "duplicate id" error on update
        if (chrome.runtime.lastError) {
          // no-op
        }
      }
    );

    if (details.reason === 'install') {
      chrome.tabs.create({ url: WELCOME_URL });
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID_VARIATION && info.srcUrl && tab?.id != null) {
      // Try to get image dimensions from the page via content script
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'ANYCAP_INVOKE_VARIATION', srcUrl: info.srcUrl },
        (response) => {
          if (chrome.runtime.lastError) {
            // Content script not ready or no response — store directly from background
            storePendingRequest(info.srcUrl);
            return;
          }
          if (response?.type === 'ANYCAP_START_GENERATION') {
            storePendingRequest(response.image.srcUrl, response.image.width, response.image.height, response.pageUrl);
          }
        }
      );
    }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (isStartGeneration(msg)) {
      storePendingRequest(msg.image.srcUrl, msg.image.width, msg.image.height, msg.pageUrl);
      sendResponse?.({ ok: true });
      return true;
    }
    return false;
  });

  function storePendingRequest(srcUrl: string, width?: number, height?: number, pageUrl?: string) {
    const payload = {
      type: 'ANYCAP_START_GENERATION',
      image: {
        srcUrl,
        width: width ?? MIN_IMAGE_DIMENSION,
        height: height ?? MIN_IMAGE_DIMENSION,
      },
      pageUrl: pageUrl ?? '',
    };
    chrome.storage.session.set({ pendingRequest: payload });

    // Badge indicator — tells user to click the toolbar icon
    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });

    // Try to open popup (Chrome 127+ only); most browsers ignore this
    chrome.action.openPopup?.().catch(() => {
      // Fallback: rely on badge + user clicking icon
    });
  }
});
