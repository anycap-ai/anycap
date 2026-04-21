import { defineContentScript } from 'wxt/utils/define-content-script';
import { shouldShowMenu, type ImageInfo } from '@/src/lib/image-filter';

export default defineContentScript({
  matches: ['<all_urls>'],
  excludeMatches: ['file://*/*'],
  main() {
    let lastImage: ImageInfo | null = null;

    document.addEventListener('contextmenu', (event) => {
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
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === 'ANYCAP_INVOKE_VARIATION' && lastImage) {
        chrome.runtime.sendMessage({
          type: 'ANYCAP_START_GENERATION',
          image: {
            srcUrl: lastImage.src,
            width: lastImage.naturalWidth,
            height: lastImage.naturalHeight,
          },
          pageUrl: location.href,
        });
      }
    });
  },
});
