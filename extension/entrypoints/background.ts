import { defineBackground } from 'wxt/utils/define-background';
import {
  MENU_ID_VARIATION,
  MENU_TITLE,
  WELCOME_URL,
} from '@/src/lib/constants';
import { isStartGeneration } from '@/src/lib/messages';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    chrome.contextMenus.create({
      id: MENU_ID_VARIATION,
      title: MENU_TITLE,
      contexts: ['image'],
    });

    if (details.reason === 'install') {
      chrome.tabs.create({ url: WELCOME_URL });
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID_VARIATION && info.srcUrl && tab?.id != null) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'ANYCAP_INVOKE_VARIATION',
        srcUrl: info.srcUrl,
      });
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (isStartGeneration(msg)) {
      chrome.storage.session.set({ pendingRequest: msg });
      chrome.action.openPopup?.().catch(() => {
        // Fallback: Chrome < 127 can't programmatically open popup
      });
    }
  });
});
