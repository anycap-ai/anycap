interface DemoVideoProps {
  src: string;
  title: string;
  description?: string;
  autoLoop?: boolean;
}

export function DemoVideo({ src, title, description, autoLoop }: DemoVideoProps) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#d4dbb8]">
        <video
          className="w-full"
          playsInline
          preload={autoLoop ? "auto" : "metadata"}
          aria-label={title}
          {...(autoLoop
            ? { autoPlay: true, muted: true, loop: true }
            : { controls: true })}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{description}</p>
      ) : null}
    </div>
  );
}
