import { describe, it, expect, vi, beforeEach } from 'vitest';

const contextMenusCreate = vi.fn();
const tabsCreate = vi.fn();
const onInstalledAddListener = vi.fn();
const onClickedAddListener = vi.fn();

(globalThis as any).chrome = {
  runtime: {
    onInstalled: {
      addListener: onInstalledAddListener,
    },
  },
  contextMenus: {
    create: contextMenusCreate,
    onClicked: {
      addListener: onClickedAddListener,
    },
  },
  tabs: {
    create: tabsCreate,
    sendMessage: vi.fn(),
  },
};

import {
  MENU_ID_VARIATION,
  MENU_TITLE,
  WELCOME_URL,
} from '@/src/lib/constants';

// Import the background module
import backgroundModule from '@/entrypoints/background';

describe('background', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // WXT's defineBackground returns { main: fn } without executing it.
    // We manually invoke main so the side effects register listeners.
    if (typeof backgroundModule === 'function') {
      (backgroundModule as any)();
    } else if (backgroundModule && typeof (backgroundModule as any).main === 'function') {
      (backgroundModule as any).main();
    }
  });

  it('registers context menu with correct id, title, and contexts', () => {
    expect(onInstalledAddListener).toHaveBeenCalledTimes(1);

    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'update' });

    expect(contextMenusCreate).toHaveBeenCalledTimes(1);
    expect(contextMenusCreate).toHaveBeenCalledWith({
      id: MENU_ID_VARIATION,
      title: MENU_TITLE,
      contexts: ['image'],
    });
  });

  it('opens welcome tab on install', () => {
    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'install' });

    expect(tabsCreate).toHaveBeenCalledTimes(1);
    expect(tabsCreate).toHaveBeenCalledWith({ url: WELCOME_URL });
  });

  it('does not open welcome tab on update', () => {
    const installedHandler = onInstalledAddListener.mock.calls[0][0];
    installedHandler({ reason: 'update' });

    expect(tabsCreate).not.toHaveBeenCalled();
  });

  it('sends message to content script on context menu click with srcUrl', () => {
    const sendMessage = (globalThis as any).chrome.tabs.sendMessage;

    const clickedHandler = onClickedAddListener.mock.calls[0][0];
    clickedHandler(
      { menuItemId: MENU_ID_VARIATION, srcUrl: 'https://example.com/img.png' },
      { id: 42 }
    );

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith(42, {
      type: 'ANYCAP_INVOKE_VARIATION',
      srcUrl: 'https://example.com/img.png',
    });
  });
});
