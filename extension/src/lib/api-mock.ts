// Mock implementation of the AnyCap server API for demo / offline use.
// Activated by WXT_MOCK=true at build time. See `pnpm demo` script.

import type {
  GenerateRequest,
  GenerateResult,
  ExtensionConfig,
  GenerateImageRequest,
  GenerateVideoRequest,
  GenerateVideoResult,
  GenerateMusicRequest,
  GenerateMusicResult,
  SearchWebRequest,
  SearchWebResult,
  CrawlPageRequest,
  CrawlPageResult,
} from './api';

const seed = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function pickResultUrl(prompt: string): string {
  const size = prompt && prompt.length > 80 ? 1024 : 768;
  return `https://picsum.photos/seed/${encodeURIComponent(seed())}/${size}/${size}`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.floor(Math.random() * spread);

// ───────────────────── image variation (right-click image) ──────────────────

export async function generateVariationMock(req: GenerateRequest): Promise<GenerateResult> {
  await wait(jitter(2400, 800));
  return {
    id: `mock_gen_${seed()}`,
    status: 'completed',
    model: req.model || 'nano-banana-2',
    outputs: [{ type: 'image', url: pickResultUrl(req.prompt), mime_type: 'image/png' }],
    credit_cost: 1,
  };
}

// ─────────────────── text-to-image (free-form prompt tab) ───────────────────

export async function generateImageMock(req: GenerateImageRequest): Promise<GenerateResult> {
  await wait(jitter(2200, 700));
  return {
    id: `mock_img_${seed()}`,
    status: 'completed',
    model: req.model || 'nano-banana-2',
    outputs: [{ type: 'image', url: pickResultUrl(req.prompt), mime_type: 'image/png' }],
    credit_cost: 1,
  };
}

// ─────────────────────────── text-to-video ───────────────────────────────────

// Public sample MP4s that load reliably in <video> tags. Picked at random.
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

export async function generateVideoMock(req: GenerateVideoRequest): Promise<GenerateVideoResult> {
  // Video generation is slower in real life; mock for ~5 s.
  await wait(jitter(4500, 1500));
  const url = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
  return {
    id: `mock_vid_${seed()}`,
    status: 'completed',
    model: req.model || 'veo-3-1',
    outputs: [
      {
        type: 'video',
        url,
        mime_type: 'video/mp4',
        poster: `https://picsum.photos/seed/${encodeURIComponent(seed())}/640/360`,
      },
    ],
  };
}

// ─────────────────────────── text-to-music ───────────────────────────────────

// Public ogg/mp3 hosted by archive.org / W3C — small files.
const SAMPLE_TRACKS = [
  'https://www.w3.org/2010/05/sound/sound_90.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/BWV_543-fugue.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/8/85/CSIRAC_Girl_with_the_Flaxen_Hair.ogg',
];

export async function generateMusicMock(req: GenerateMusicRequest): Promise<GenerateMusicResult> {
  await wait(jitter(3000, 1200));
  const url = SAMPLE_TRACKS[Math.floor(Math.random() * SAMPLE_TRACKS.length)];
  return {
    id: `mock_msc_${seed()}`,
    status: 'completed',
    model: req.model || 'lyria-2',
    outputs: [
      {
        type: 'audio',
        url,
        mime_type: 'audio/ogg',
        duration_seconds: req.durationSeconds ?? 30,
      },
    ],
  };
}

// ─────────────────────────── web search ──────────────────────────────────────

const SEARCH_TEMPLATES = [
  {
    title: '{Q} — Wikipedia',
    url: 'https://en.wikipedia.org/wiki/{slug}',
    snippet:
      '{Q} is a topic of broad interest. The Wikipedia entry covers history, definitions, examples, and notable applications across multiple fields.',
    source: 'wikipedia.org',
  },
  {
    title: 'A practical introduction to {Q}',
    url: 'https://www.example.com/intro-{slug}',
    snippet:
      "We walk through the fundamentals of {Q}, what it's good for, and the most common mistakes people make when getting started.",
    source: 'example.com',
  },
  {
    title: '{Q}: 2026 state of the field — Hacker News',
    url: 'https://news.ycombinator.com/item?id=mock-{slug}',
    snippet:
      "Discussion thread on the current state of {Q}. Top comments highlight where the technology actually delivers and where it doesn't.",
    source: 'news.ycombinator.com',
  },
  {
    title: 'Five things you might be wrong about — {Q}',
    url: 'https://blog.example.dev/five-myths-{slug}',
    snippet:
      'Common misconceptions about {Q}, with citations from primary sources, and what the actual research shows.',
    source: 'blog.example.dev',
  },
  {
    title: '{Q} in production: lessons from a year of operation',
    url: 'https://engineering.example.io/{slug}-postmortem',
    snippet:
      'A retrospective on running {Q} at scale: the surprises, the wins, and the things we wish we had known on day one.',
    source: 'engineering.example.io',
  },
  {
    title: 'Awesome {Q} — curated resources',
    url: 'https://github.com/awesome/{slug}',
    snippet:
      'A community-curated list of tools, libraries, articles, and tutorials about {Q}. PRs welcome.',
    source: 'github.com',
  },
];

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40) || 'topic'
  );
}

export async function searchWebMock(req: SearchWebRequest): Promise<SearchWebResult> {
  await wait(jitter(700, 600));
  const slug = slugify(req.query);
  const q = req.query.trim() || 'AnyCap';
  const top = req.topK ?? 6;
  const results = SEARCH_TEMPLATES.slice(0, top).map((t) => ({
    title: t.title.replace(/\{Q\}/g, q),
    url: t.url.replace(/\{slug\}/g, slug),
    snippet: t.snippet.replace(/\{Q\}/g, q),
    source: t.source,
  }));
  return { query: q, results };
}

// ─────────────────────────── web crawl ───────────────────────────────────────

export async function crawlPageMock(req: CrawlPageRequest): Promise<CrawlPageResult> {
  await wait(jitter(1500, 800));
  let host = '';
  try {
    host = new URL(req.url).hostname;
  } catch {
    host = 'unknown.host';
  }
  const title = `${host} — extracted content`;
  const summary =
    `This page from ${host} discusses three to five core points across roughly 1,200 words. ` +
    `The main argument is structured around concrete examples, followed by counter-points and a brief conclusion. ` +
    `Citations link out to primary sources and one academic paper.`;
  const markdown =
    `# ${title}\n\n` +
    `Source: <${req.url}>\n\n` +
    `## Summary\n\n${summary}\n\n` +
    `## Key points\n\n` +
    `- Authoritative framing of the topic with definitions up front\n` +
    `- Concrete walk-through of two examples, one technical and one social\n` +
    `- Quantitative claims grounded in cited research from the last 18 months\n` +
    `- A short caveats section identifying when the framing breaks down\n\n` +
    `## First paragraph\n\n` +
    `This is a mock excerpt of the article body. In production, AnyCap returns the page's main content as clean markdown — ` +
    `stripped of nav, ads, and boilerplate — ready to feed straight into an LLM.\n`;
  return {
    url: req.url,
    title,
    summary,
    markdown,
    word_count: 1200 + Math.floor(Math.random() * 600),
    language: 'en',
  };
}

// ─────────────────────────── extension config ───────────────────────────────

export async function fetchExtensionConfigMock(): Promise<ExtensionConfig> {
  await wait(80);
  return {
    default_prompt: 'create a stylistic variation of this image',
    default_model: 'nano-banana-2',
    min_image_dim: 256,
  };
}
