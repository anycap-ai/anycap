export type ModelShowcaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
};

export type ModelShowcaseEntry = {
  modelName: string;
  href: string;
  sectionTitle: string;
  intro: string;
  promptLabel: string;
  prompt: string;
  caption: string;
  note?: string;
  signals: string[];
  images: ModelShowcaseImage[];
};

const MODEL_SHOWCASE_CDN_BASE = "https://cdn.anycap.ai/page_resource/models";

export const modelShowcaseEntries: Record<string, ModelShowcaseEntry> = {
  "seedream-5": {
    modelName: "Seedream 5",
    href: "/models/seedream-5",
    sectionTitle: "Generated example for a polished first pass",
    intro:
      "This page now shows a real Seedream 5 output generated through AnyCap. The brief aims for the kind of launch-ready product framing teams usually want before revision loops start.",
    promptLabel: "Prompt used with AnyCap",
    prompt:
      "premium SaaS product hero scene, matte graphite laptop on a warm off-white pedestal, floating translucent interface cards, subtle olive green accents, soft studio shadows, editorial lighting, crisp composition, premium marketing art, no readable text, no watermark",
    caption:
      "This visual was generated with Seedream 5 through AnyCap for this page, giving the guide a first-party example instead of stock art.",
    signals: [
      "Shows the cleaner first-pass composition Seedream 5 is meant to deliver from a prompt alone.",
      "Makes the page's main claim visually testable: polished output without a separate provider workflow.",
      "Adds original multimedia that supports E-E-A-T and makes the page easier for readers to scan.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/seedream-5-showcase.jpg`,
        alt: "Premium product hero scene with a graphite laptop on an off-white pedestal and floating translucent interface cards in soft studio lighting.",
        width: 2560,
        height: 1440,
        label: "Seedream 5 output",
      },
    ],
  },
  "nano-banana-pro": {
    modelName: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    sectionTitle: "Before-and-after proof for the revision workflow",
    intro:
      "Nano Banana Pro makes the most sense after a draft already exists. This pair shows that idea directly: a rough base image first, then a cleaner launch-ready revision through an image-to-image edit.",
    promptLabel: "Edit prompt used with AnyCap",
    prompt:
      "replace the cluttered desk with a warm cream studio gradient and a minimal pedestal, center the wearable device, add soft rim light and cleaner composition, preserve the device shape, make it look launch-ready, premium product marketing photo, no text, no watermark",
    caption:
      "The left image is a rough Nano Banana 2 draft. The right image is the Nano Banana Pro revision generated through AnyCap from that source asset.",
    signals: [
      "Turns the abstract idea of a revision loop into a visual before-and-after sequence.",
      "Demonstrates background cleanup, subject centering, and lighting improvements without swapping the product itself.",
      "Creates a stronger experience signal than a page that only says the model is good at editing.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/nano-banana-pro-before.jpg`,
        alt: "Rough tabletop product shot of a wearable device on a cluttered desk with mixed lighting.",
        width: 1376,
        height: 768,
        label: "Before",
      },
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/nano-banana-pro-after.jpg`,
        alt: "Refined product marketing shot of the same wearable device centered on a minimal pedestal with a warm cream studio background.",
        width: 1376,
        height: 768,
        label: "After",
      },
    ],
  },
  "nano-banana-2": {
    modelName: "Nano Banana 2",
    href: "/models/nano-banana-2",
    sectionTitle: "Generated example for high-volume iteration",
    intro:
      "The example below leans into Nano Banana 2's speed story. Instead of a single hero shot, it shows a multi-variant board that feels closer to how teams review fast batches of marketing concepts.",
    promptLabel: "Prompt used with AnyCap",
    prompt:
      "triptych of the same matte graphite laptop product hero in three visual directions, off-white studio background, three side-by-side panels, clear variation in accent lighting and card styling, clean review board layout, no labels, no sticky notes, no text, no typography, no watermark",
    caption:
      "This three-variant review board was generated with Nano Banana 2 through AnyCap to show how the model fits fast variation and review loops.",
    signals: [
      "Reinforces throughput and ideation speed in one glance rather than only as copy.",
      "Matches the model's role in real workflows where multiple usable drafts matter more than one perfect frame.",
      "Adds a more distinctive multimedia asset than a generic stock illustration would.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/nano-banana-2-showcase.jpg`,
        alt: "Clean three-panel review board showing a matte graphite laptop in three visual directions on an off-white studio background.",
        width: 1376,
        height: 768,
        label: "Nano Banana 2 output",
      },
    ],
  },
  "veo-3-1": {
    modelName: "Veo 3.1",
    href: "/models/veo-3-1",
    sectionTitle: "Illustrative keyframe for a premium text-to-video brief",
    intro:
      "Video output is time-based, so this page uses a companion still to anchor the brief visually. The image reflects the kind of cinematic scene planning teams often do before sending a premium text-to-video request.",
    promptLabel: "Illustrative still prompt",
    prompt:
      "cinematic aerial keyframe of a futuristic city at dawn, a drone gliding between towers, soft haze, warm sunrise rim light, premium sci-fi film still, no text, no watermark",
    caption:
      "This still was generated through AnyCap as a visual proxy for the kind of premium scene brief that pairs well with Veo 3.1.",
    note:
      "Because Veo 3.1 outputs motion, this is not presented as the video result itself. It is a companion still that makes the page's use case easier to understand and cite.",
    signals: [
      "Gives readers a concrete visual anchor next to the CLI example and workflow explanation.",
      "Supports the page's positioning of Veo 3.1 as the premium first-pass lane in the current video stack.",
      "Improves multimedia coverage without pretending a static image is the full video output.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/veo-3-1-keyframe.jpg`,
        alt: "Cinematic aerial still of a futuristic city at dawn with a drone moving between tall towers in warm sunrise light.",
        width: 2560,
        height: 1440,
        label: "Companion keyframe",
      },
    ],
  },
  "kling-3-0": {
    modelName: "Kling 3.0",
    href: "/models/kling-3-0",
    sectionTitle: "Illustrative keyframe for realistic motion and scene continuity",
    intro:
      "Kling 3.0 is often chosen for realistic motion and cinematic image-to-video work. This still is there to show the kind of moody, motion-ready scene brief that fits that job.",
    promptLabel: "Illustrative still prompt",
    prompt:
      "rain-soaked cinematic street scene at night, lone person under a transparent umbrella, reflective pavement, abstract light streaks, realistic moody still with strong motion implication, no storefront signs, no billboards, no text, no watermark",
    caption:
      "This companion still was generated through AnyCap to make the Kling 3.0 page feel more grounded in a real scene brief instead of only listing features.",
    note:
      "Kling 3.0 produces video, not a single frame. The image below works as a visual proxy for the kind of cinematic source scene teams may animate.",
    signals: [
      "Makes the realistic-motion positioning more tangible than text alone.",
      "Helps the image-to-video explanation land by starting from a scene that already implies movement.",
      "Adds first-party multimedia that separates the page from thinner model roundups.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/kling-3-0-keyframe.jpg`,
        alt: "Rainy neon street scene at night with a lone person under a transparent umbrella and reflections on wet pavement.",
        width: 1376,
        height: 768,
        label: "Companion keyframe",
      },
    ],
  },
  "seedance-1-5-pro": {
    modelName: "Seedance 1.5 Pro",
    href: "/models/seedance-1-5-pro",
    sectionTitle: "Illustrative still for a steadier production workflow",
    intro:
      "Seedance 1.5 Pro is described on this page as a dependable default for repeatable team work. This still uses a cleaner commercial storyboard setup to match that production-friendly positioning.",
    promptLabel: "Illustrative still prompt",
    prompt:
      "clean product reveal stage with a smartphone floating above layered cards, parallax-friendly composition, soft studio lighting, steady commercial storyboard still, off-white and charcoal palette, no text, no watermark",
    caption:
      "This companion still was generated through AnyCap to show the kind of stable product-visual brief that fits Seedance 1.5 Pro's role in a team workflow.",
    note:
      "The image acts as a planning artifact, not as a claim about the final video itself. It is there to make the page's image-to-video use cases more concrete.",
    signals: [
      "Visually supports the page's message about repeatable, production-friendly motion briefs.",
      "Makes the screenshot-to-video and product-demo use cases easier to understand at a glance.",
      "Adds original multimedia without over-claiming what a static frame can prove about motion quality.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/seedance-1-5-pro-keyframe.jpg`,
        alt: "Clean product reveal still with a floating smartphone above layered cards in soft studio lighting.",
        width: 1376,
        height: 768,
        label: "Companion keyframe",
      },
    ],
  },
  "elevenlabs-music": {
    modelName: "ElevenLabs Music",
    href: "/models/elevenlabs-music",
    sectionTitle: "Illustrative cover art for a soundtrack-first workflow",
    intro:
      "Music generation pages can feel especially thin because the output is audio, not something a crawler can see. This companion cover visual gives the page a stronger mood anchor around the soundtrack brief.",
    promptLabel: "Illustrative cover prompt",
    prompt:
      "ambient electronic soundtrack cover art, glowing waveform ribbon over warm paper grain with soft green-blue haze, elegant abstract motion, premium album-art composition, no readable text, no watermark",
    caption:
      "This abstract cover visual was generated through AnyCap to give the ElevenLabs Music page a first-party multimedia asset tied to the soundtrack prompt.",
    note:
      "The image is a companion mood visual for the audio workflow. It is not presented as music output, but it helps the page communicate tone and use case faster.",
    signals: [
      "Adds an original visual anchor to an otherwise text-heavy audio page.",
      "Matches the soundtrack-draft positioning better than a generic stock music icon would.",
      "Improves scanability and AI citation readiness by pairing the prompt with a concrete artifact.",
    ],
    images: [
      {
        src: `${MODEL_SHOWCASE_CDN_BASE}/elevenlabs-music-cover.jpg`,
        alt: "Abstract ambient music cover art with a glowing waveform ribbon over warm paper grain and soft green-blue haze.",
        width: 2560,
        height: 1440,
        label: "Companion cover visual",
      },
    ],
  },
};
