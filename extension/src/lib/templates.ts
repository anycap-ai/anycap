// Curated prompt templates surfaced as click-to-fill chips on each gen tab.
// Keep titles short (≤14 chars) — they render as compact pill chips.

export type Template<T> = {
  id: string;
  title: string;
  emoji: string;
  prompt: string;
  // Optional per-tab params filled when the user picks the chip.
  params?: T;
};

export const IMAGE_TEMPLATES: Template<{ aspectRatio?: string; model?: string }>[] = [
  {
    id: 'studio-portrait',
    title: 'Studio portrait',
    emoji: '📸',
    prompt:
      'A studio portrait of a young woman, soft beauty-dish lighting, neutral grey backdrop, sharp focus on the eyes, 85mm lens, magazine cover aesthetic',
    params: { aspectRatio: '4:5', model: 'nano-banana-2' },
  },
  {
    id: 'watercolor',
    title: 'Watercolor',
    emoji: '🎨',
    prompt:
      'A watercolor painting of a coastal town at sunrise, pastel sky, loose brush strokes, paper texture visible, hand-drawn feel',
    params: { aspectRatio: '4:3', model: 'flux-dev' },
  },
  {
    id: 'product-flatlay',
    title: 'Product flat-lay',
    emoji: '🪴',
    prompt:
      'Top-down flat-lay product photography of a ceramic coffee mug on warm oak wood, natural daylight, scattered coffee beans, minimal styling',
    params: { aspectRatio: '1:1', model: 'seedream-5' },
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk city',
    emoji: '🌃',
    prompt:
      'A cyberpunk Tokyo back-alley at night after rain, neon kanji signs reflected in puddles, lone figure under an umbrella, cinematic, 35mm anamorphic',
    params: { aspectRatio: '16:9', model: 'flux-dev' },
  },
  {
    id: 'logo-mark',
    title: 'Logo mark',
    emoji: '✨',
    prompt:
      'Minimalist vector logo mark, single olive-green geometric shape on white, balanced negative space, suitable for SaaS product, no text',
    params: { aspectRatio: '1:1', model: 'nano-banana-2' },
  },
];

export const VIDEO_TEMPLATES: Template<{ durationSeconds?: number; model?: string }>[] = [
  {
    id: 'drone-coast',
    title: 'Drone, coastline',
    emoji: '🚁',
    prompt:
      'Slow drone shot pulling back from a rocky coastline at golden hour, gentle waves, soft warm light, cinematic color grade',
    params: { durationSeconds: 5, model: 'veo-3-1' },
  },
  {
    id: 'product-spin',
    title: 'Product 360°',
    emoji: '📦',
    prompt:
      'Smooth 360° rotation of a glossy white product on a soft grey turntable, studio lighting, shallow depth of field',
    params: { durationSeconds: 5, model: 'kling-2' },
  },
  {
    id: 'anime-hero',
    title: 'Anime hero',
    emoji: '⚔️',
    prompt:
      'Anime-style action sequence, cherry-blossom petals swirling around a swordsman, slow motion, vibrant cel-shaded colors, 24fps',
    params: { durationSeconds: 8, model: 'sora-1' },
  },
  {
    id: 'food-pour',
    title: 'Food, pour',
    emoji: '🍯',
    prompt:
      'Macro shot of golden honey pouring slowly onto a crisp pancake stack, sunlight, breakfast advertisement aesthetic',
    params: { durationSeconds: 3, model: 'veo-3-1' },
  },
];

export const MUSIC_TEMPLATES: Template<{ durationSeconds?: number; model?: string }>[] = [
  {
    id: 'lofi-study',
    title: 'Lo-fi study',
    emoji: '☕',
    prompt:
      'Mellow lo-fi hip-hop, soft piano chords, vinyl crackle, jazz brushes on drums, ~80 BPM, perfect for studying',
    params: { durationSeconds: 30, model: 'lyria-2' },
  },
  {
    id: 'cinematic',
    title: 'Cinematic',
    emoji: '🎬',
    prompt:
      'Epic cinematic orchestral piece, swelling strings, soft choir, building to a triumphant brass finale, film-trailer pacing',
    params: { durationSeconds: 60, model: 'lyria-2' },
  },
  {
    id: 'acoustic',
    title: 'Acoustic',
    emoji: '🎸',
    prompt:
      'Warm fingerpicked acoustic guitar with light brushed percussion, mid-tempo folk feel, intimate coffee-shop atmosphere',
    params: { durationSeconds: 30, model: 'suno-v4' },
  },
  {
    id: 'synthwave',
    title: 'Synthwave',
    emoji: '🌆',
    prompt:
      'Retro synthwave with arpeggiated synths, gated reverb drums, neon-lit driving feel, 110 BPM, 80s color palette',
    params: { durationSeconds: 60, model: 'udio-1' },
  },
];

export const SEARCH_TEMPLATES: Template<{}>[] = [
  { id: 's1', title: 'GPU pricing', emoji: '🧮', prompt: 'cheapest a100 gpu cloud rental 2026' },
  { id: 's2', title: 'AI tools', emoji: '🛠', prompt: 'best AI coding agent for python' },
  { id: 's3', title: 'Latest news', emoji: '📰', prompt: 'OpenAI announcements this week' },
];

export const CRAWL_TEMPLATES: Template<{}>[] = [
  { id: 'c1', title: 'Wikipedia', emoji: '📖', prompt: 'https://en.wikipedia.org/wiki/Large_language_model' },
  { id: 'c2', title: 'Hacker News', emoji: '🗞', prompt: 'https://news.ycombinator.com/' },
  { id: 'c3', title: 'arXiv paper', emoji: '🔬', prompt: 'https://arxiv.org/abs/2310.06825' },
];
