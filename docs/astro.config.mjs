import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

const site = 'https://docs.anycap.ai';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'AnyCap Docs',
      description:
        'Install AnyCap and give AI agents image, video, audio, web, storage, and publishing capabilities through one CLI or MCP server.',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/anycap-logo.svg',
        alt: 'AnyCap',
        replacesTitle: true,
      },
      social: [
        {
          icon: 'github',
          label: 'AnyCap on GitHub',
          href: 'https://github.com/anycap-ai/anycap',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/anycap-ai/anycap/edit/main/docs/',
      },
      lastUpdated: true,
      disable404Route: true,
      customCss: ['./src/styles/custom.css'],
      components: {
        Head: './src/components/Head.astro',
      },
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#f9faf5' } },
        { tag: 'meta', attrs: { name: 'color-scheme', content: 'light dark' } },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${site}/assets/social-card.png` },
        },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'AnyCap gives coding agents real-world capabilities',
          },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: `${site}/assets/social-card.png` },
        },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
      ],
      sidebar: [
        { label: 'Overview', link: '/' },
        {
          label: 'Get started',
          items: [
            { label: 'Quickstart', link: '/getting-started/' },
            { label: 'Install the CLI', link: '/getting-started/install/' },
            { label: 'Authentication', link: '/getting-started/authentication/' },
            { label: 'Agent Skill', link: '/getting-started/agent-skill/' },
            { label: 'MCP', link: '/getting-started/mcp/' },
            { label: 'Configuration', link: '/getting-started/configuration/' },
            { label: 'Troubleshooting', link: '/getting-started/troubleshooting/' },
          ],
        },
        {
          label: 'Capabilities',
          items: [
            { label: 'Overview', link: '/capabilities/' },
            { label: 'Image', link: '/capabilities/image/' },
            { label: 'Video', link: '/capabilities/video/' },
            { label: 'Media understanding', link: '/capabilities/media-understanding/' },
            { label: 'Web search and crawl', link: '/capabilities/web/' },
            { label: 'Music and audio', link: '/capabilities/audio/' },
            { label: 'Drive and Page', link: '/capabilities/delivery/' },
            { label: 'Annotate and Draw', link: '/capabilities/collaboration/' },
            { label: 'Snapshots', link: '/capabilities/snapshots/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Generate and share an image', link: '/guides/generate-and-share-image/' },
            { label: 'Generate video from an image', link: '/guides/image-to-video/' },
            { label: 'Review with human feedback', link: '/guides/human-feedback/' },
            { label: 'Research the web', link: '/guides/web-research/' },
            { label: 'Publish a static site', link: '/guides/publish-site/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI', link: '/reference/cli/' },
            { label: 'MCP tools', link: '/reference/mcp-tools/' },
            { label: 'JSON output', link: '/reference/output/' },
            { label: 'Environment variables', link: '/reference/environment-variables/' },
            { label: 'Security', link: '/reference/security/' },
            { label: 'Feedback and diagnostics', link: '/reference/feedback/' },
          ],
        },
      ],
    }),
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
});
