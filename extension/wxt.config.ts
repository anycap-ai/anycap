import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

const isRelease = process.env.WXT_RELEASE === 'true';

// Localhost permissions are useful only when running against a local
// `make dev` server. Strip them from production zips so CWS reviewers don't
// ask why a published extension talks to localhost.
const hostPermissions = [
  'https://api.anycap.ai/*',
  'https://anycap.ai/*',
  ...(isRelease ? [] : ['http://127.0.0.1/*', 'http://localhost/*']),
];

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'AnyCap — Image, Video, Music, Search, Crawl in your browser',
    short_name: 'AnyCap',
    description:
      'Side-panel access to AI capabilities — generate images, videos, music; search the web; extract pages to markdown. Right-click anything to start.',
    version: '0.2.0',
    permissions: ['contextMenus', 'activeTab', 'storage', 'downloads', 'sidePanel'],
    // Identity is requested on-demand when the user signs in. Anonymous users
    // never trigger the prompt, which is friendlier for CWS first-run review.
    optional_permissions: ['identity'],
    host_permissions: hostPermissions,
    icons: { '16': 'icons/16.png', '48': 'icons/48.png', '128': 'icons/128.png' },
    // Toolbar click opens the side panel (background.ts wires this via
    // chrome.sidePanel.setPanelBehavior). No default_popup.
    action: { default_title: 'AnyCap' },
    side_panel: { default_path: 'sidepanel.html' },
    minimum_chrome_version: '118',
  },
});
