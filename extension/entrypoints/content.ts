import { defineContentScript } from 'wxt/utils/define-content-script';
import { shouldShowMenu, type ImageInfo } from '@/src/lib/image-filter';

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['file://*/*'],
  main() {
    let lastImage: ImageInfo | null = null;

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const info: ImageInfo = {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          src: img.src,
        };
        if (shouldShowMenu(info)) {
          lastImage = info;
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Clean up on navigation (SPA)
    const observer = new MutationObserver(() => {
      lastImage = null;
    });
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'ANYCAP_INVOKE_VARIATION') {
        const target = lastImage ?? { src: message.srcUrl, naturalWidth: 256, naturalHeight: 256 };
        if (target) {
          sendResponse({
            type: 'ANYCAP_START_GENERATION',
            image: {
              srcUrl: target.src,
              width: target.naturalWidth,
              height: target.naturalHeight,
            },
            pageUrl: location.href,
          });
        }
        return true;
      }
      return false;
    });
  },
});
