import Image from "next/image";

const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export type LearnProofImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  frameVariant?: "plain" | "checkerboard";
};

type LearnProofShowcaseProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  promptLabel: string;
  prompt: string;
  signalsLabel?: string;
  signals: readonly string[];
  caption: string;
  images: readonly LearnProofImage[];
  priorityFirstImage?: boolean;
};

function ProofFrame({
  image,
  priority = false,
}: {
  image: LearnProofImage;
  priority?: boolean;
}) {
  const checkerboardStyle =
    image.frameVariant === "checkerboard"
      ? {
          backgroundColor: "#f7f8ef",
          backgroundImage:
            "linear-gradient(45deg, rgba(212,219,184,0.42) 25%, transparent 25%), linear-gradient(-45deg, rgba(212,219,184,0.42) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(212,219,184,0.42) 75%), linear-gradient(-45deg, transparent 75%, rgba(212,219,184,0.42) 75%)",
          backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0px",
          backgroundSize: "28px 28px",
        }
      : { backgroundColor: "#f7f8ef" };

  return (
    <figure className="overflow-hidden rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/80">
      <div className="border-b border-[#d4dbb8] bg-[#f7f8ef] px-5 py-3">
        <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
          {image.label}
        </p>
      </div>
      <div className="p-4" style={checkerboardStyle}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-auto w-full rounded-[18px]"
          priority={priority}
          unoptimized
        />
      </div>
    </figure>
  );
}

export function LearnProofShowcase({
  eyebrow = "Generated proof",
  title,
  intro,
  promptLabel,
  prompt,
  signalsLabel = "Why this proof matters",
  signals,
  caption,
  images,
  priorityFirstImage = false,
}: LearnProofShowcaseProps) {
  return (
    <section>
      <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={{ fontFamily: "var(--font-geist-pixel-square), monospace" }}>
        {title}
      </h2>
      <p className="mt-4 max-w-[840px] text-base leading-7 text-[#4d5145]">{intro}</p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)] xl:items-start">
        <div className={`grid gap-4 ${images.length > 1 ? "md:grid-cols-2" : ""}`}>
          {images.map((image, index) => (
            <ProofFrame
              key={image.src}
              image={image}
              priority={priorityFirstImage && index === 0}
            />
          ))}
        </div>

        <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f9faf5]/90 p-6">
          <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
            {promptLabel}
          </p>
          <div className="mt-3 rounded-xl bg-[#1c1f17] px-4 py-4">
            <p className="text-[13px] leading-6 break-words text-[#d4e0a4]" style={mono}>
              {prompt}
            </p>
          </div>

          <p className="mt-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
            {signalsLabel}
          </p>
          <ul className="mt-3 space-y-3">
            {signals.map((signal) => (
              <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 max-w-[900px] text-sm leading-6 text-[#4d5145]">{caption}</p>
    </section>
  );
}
