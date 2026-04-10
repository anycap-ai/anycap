import Image from "next/image";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export interface ModelVisualShowcaseEntry {
  modelName: string;
  href: string;
  sectionTitle: string;
  intro: string;
  promptLabel: string;
  prompt: string;
  caption: string;
  note?: string;
  signals: readonly string[];
  images: readonly {
    src: string;
    alt: string;
    width: number;
    height: number;
    label: string;
  }[];
}

export function ModelVisualShowcase({ entry }: { entry: ModelVisualShowcaseEntry }) {
  return <ModelVisualShowcaseWithLabels entry={entry} />;
}

export function ModelVisualShowcaseWithLabels({
  entry,
  generatedExampleLabel = "Generated example",
  signalsLabel = "Why it helps this page",
}: {
  entry: ModelVisualShowcaseEntry;
  generatedExampleLabel?: string;
  signalsLabel?: string;
}) {
  const imageGridClass =
    entry.images.length > 1
      ? "grid gap-4 md:grid-cols-2"
      : "grid gap-4";

  return (
    <section>
      <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
        {generatedExampleLabel}
      </p>
      <h2 className="mt-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
        {entry.sectionTitle}
      </h2>
      <p className="mt-4 max-w-[820px] text-base leading-7 text-[#4d5145]">
        {entry.intro}
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] xl:items-start">
        <div className={imageGridClass}>
          {entry.images.map((image) => (
            <figure
              key={image.src}
              className="overflow-hidden rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/80"
            >
              <div className="border-b border-[#d4dbb8] bg-[#f7f8ef] px-5 py-3">
                <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                  {image.label}
                </p>
              </div>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="h-auto w-full"
                unoptimized
              />
            </figure>
          ))}
        </div>

        <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f9faf5]/90 p-6">
          <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
            {entry.promptLabel}
          </p>
          <div className="mt-3 rounded-xl bg-[#1c1f17] px-4 py-4">
            <p
              className="text-[13px] leading-6 break-words text-[#d4e0a4]"
              style={mono}
            >
              {entry.prompt}
            </p>
          </div>

          {entry.note ? (
            <p className="mt-4 text-sm leading-6 text-[#4d5145]">{entry.note}</p>
          ) : null}

          <p className="mt-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
            {signalsLabel}
          </p>
          <ul className="mt-3 space-y-3">
            {entry.signals.map((signal) => (
              <li
                key={signal}
                className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 max-w-[860px] text-sm leading-6 text-[#4d5145]">
        {entry.caption}
      </p>
    </section>
  );
}
