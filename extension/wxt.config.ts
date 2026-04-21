import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'AnyCap — Turn anything you see into new content',
    short_name: 'AnyCap',
    description: 'Right-click any image to generate AI variations. Powered by AnyCap.',
    permissions: ['contextMenus', 'activeTab', 'storage', 'identity', 'downloads'],
    host_permissions: ['https://api.anycap.ai/*', 'https://anycap.ai/*'],
    icons: { '16': 'icons/16.png', '48': 'icons/48.png', '128': 'icons/128.png' },
    action: { default_popup: 'popup.html', default_title: 'AnyCap' },
    minimum_chrome_version: '118',
  },
});
