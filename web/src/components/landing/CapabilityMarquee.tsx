import Image from "next/image";
import {
  ArrowSquareOut,
  Browser,
  CloudArrowUp,
  Eye,
  FilmSlate,
  ImageSquare,
  MagicWand,
  MagnifyingGlass,
  Microphone,
  MusicNotes,
  RocketLaunch,
  VideoCamera,
} from "@phosphor-icons/react/ssr";

import { CapabilityMarqueeActivityController } from "@/components/landing/CapabilityMarqueeActivityController";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { homeCapabilityMarqueeItems } from "@/lib/capability-inventory";
import { modelHubModels } from "@/lib/model-hub";

import styles from "./capability-marquee.module.css";

const featuredModelIds = [
  "gpt-image-2",
  "gemini-omni-flash-preview",
  "seedance-2",
  "kling-3.0",
  "suno-v5.5",
  "sora-2-pro",
  "veo-3.1",
  "nano-banana-pro",
  "seedream-5",
  "flux-kontext-max",
  "qwen-image",
  "mureka-v8",
  "elevanlabs-music",
  "doubao-seed-audio-1-0",
] as const;

const modelIcons: Partial<Record<(typeof featuredModelIds)[number], string>> = {
  "gpt-image-2": "/visuals/model-brands/openai.png",
  "gemini-omni-flash-preview": "/visuals/model-brands/gemini.png",
  "seedance-2": "/visuals/model-brands/seedance.png",
  "kling-3.0": "/visuals/model-brands/kling.png",
  "suno-v5.5": "/visuals/model-brands/suno.png",
  "sora-2-pro": "/visuals/model-brands/openai.png",
  "veo-3.1": "/visuals/model-brands/gemini.png",
  "nano-banana-pro": "/visuals/model-brands/gemini.png",
  "seedream-5": "/visuals/model-brands/seedance.png",
  "doubao-seed-audio-1-0": "/visuals/model-brands/seedance.png",
};

const modelProviders: Record<(typeof featuredModelIds)[number], string> = {
  "gpt-image-2": "OpenAI",
  "gemini-omni-flash-preview": "Google",
  "seedance-2": "ByteDance",
  "kling-3.0": "Kling AI",
  "suno-v5.5": "Suno",
  "sora-2-pro": "OpenAI",
  "veo-3.1": "Google",
  "nano-banana-pro": "Google",
  "seedream-5": "ByteDance",
  "flux-kontext-max": "Black Forest Labs",
  "qwen-image": "Alibaba Qwen",
  "mureka-v8": "Mureka",
  "elevanlabs-music": "ElevenLabs",
  "doubao-seed-audio-1-0": "ByteDance",
};

type ScenarioIcon =
  (typeof homeCapabilityMarqueeItems)[number]["icon"];

const scenarioIcons: Record<ScenarioIcon, typeof RocketLaunch> = {
  campaign: RocketLaunch,
  video: VideoCamera,
  image: ImageSquare,
  edit: MagicWand,
  music: MusicNotes,
  vision: Eye,
  review: FilmSlate,
  audio: Microphone,
  research: MagnifyingGlass,
  crawl: Browser,
  drive: CloudArrowUp,
  publish: ArrowSquareOut,
};

const featuredModels = featuredModelIds.flatMap((modelId) => {
  const model = modelHubModels.find((candidate) => candidate.modelId === modelId);

  return model
    ? [
        {
          label: model.model,
          href: model.href,
          brandIcon: modelIcons[modelId],
          provider: modelProviders[modelId],
        },
      ]
    : [];
});

type MarqueeItem = {
  label: string;
  href: string;
  icon?: ScenarioIcon;
  brandIcon?: string;
  provider?: string;
};

function MarqueeGroup({
  items,
  duplicate = false,
  modelRow = false,
}: {
  items: readonly MarqueeItem[];
  duplicate?: boolean;
  modelRow?: boolean;
}) {
  return (
    <div
      className={styles.group}
      role={duplicate ? undefined : "list"}
      aria-hidden={duplicate ? "true" : undefined}
    >
      {items.map((item) => {
        const ScenarioIcon = item.icon ? scenarioIcons[item.icon] : null;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.item} ${modelRow ? styles.modelItem : ""}`}
            role={duplicate ? undefined : "listitem"}
            tabIndex={duplicate ? -1 : undefined}
            aria-label={
              item.provider ? `${item.label} by ${item.provider}` : undefined
            }
            data-marquee-item
          >
            {ScenarioIcon ? (
              <ScenarioIcon
                size={18}
                weight="regular"
                aria-hidden="true"
                className={styles.scenarioIcon}
              />
            ) : null}
            {item.brandIcon ? (
              <Image
                src={item.brandIcon}
                alt=""
                width={18}
                height={18}
                className={styles.modelIcon}
              />
            ) : item.provider ? (
              <span className={styles.providerName}>{item.provider}</span>
            ) : null}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  modelRow = false,
}: {
  items: readonly MarqueeItem[];
  reverse?: boolean;
  modelRow?: boolean;
}) {
  return (
    <div className={styles.viewport} data-capability-marquee-viewport>
      <div
        className={`${styles.track} ${
          reverse ? styles.trackReverse : styles.trackForward
        }`}
      >
        <MarqueeGroup items={items} modelRow={modelRow} />
        <MarqueeGroup items={items} duplicate modelRow={modelRow} />
      </div>
    </div>
  );
}

export function CapabilityMarquee() {
  return (
    <section
      id="capability-marquee"
      className={styles.marquee}
      aria-labelledby="capability-marquee-title"
      data-capability-marquee
    >
      <h2 id="capability-marquee-title" className="sr-only">
        What AnyCap lets your agent do
      </h2>
      <MarqueeRow items={homeCapabilityMarqueeItems} />
      <MarqueeRow items={featuredModels} reverse modelRow />
      <CapabilityMarqueeActivityController />
    </section>
  );
}
