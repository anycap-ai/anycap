# Chrome Web Store Permission Justifications

Paste these into the Chrome Web Store submission form for v0.2.0.

| Permission | Justification |
|---|---|
| `contextMenus` | Adds AnyCap actions to Chrome's right-click menu so users can generate variations, create media from selected text, search selected text, and crawl pages or links only after an explicit user action. |
| `activeTab` | Reads the current tab URL only when the user clicks "Use current tab URL" in the Crawl panel or triggers a page-level crawl from the context menu. |
| `storage` | Stores local extension preferences, first-run onboarding state, anonymous trial state, cached extension config, and per-capability local history in Chrome storage. |
| `downloads` | Lets users save generated images, videos, and music files to their local Downloads folder from the side panel. |
| `sidePanel` | Displays the AnyCap capability interface in Chrome's side panel and opens it after a toolbar or context-menu action. |
| `identity` (optional) | Used only when the user chooses to sign in to an AnyCap account; anonymous users are never prompted for this optional permission. |
