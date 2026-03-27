export const runtime = "edge";

const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export default function PlaygroundPage() {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <p
        className="text-[12px] tracking-[0.3px] text-[#707468] mb-4"
        style={mono}
      >
        Playground
      </p>
      <p className="text-base text-[#4d5145] leading-[1.7]">
        Interactive capability playground is coming soon.
      </p>
    </div>
  );
}
