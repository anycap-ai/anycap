import Link from "next/link";

export default function AgentLanding() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 leading-relaxed">
      <article>
        <h1 className="text-2xl font-bold mb-2">AnyCap</h1>
        <p className="text-lg text-[#a0a0a0] mb-8">
          Capability runtime for AI agents.
          <br />
          One CLI, all capabilities. No SDK. No docs. No UI.
        </p>

        <Section title="What is AnyCap">
          <p>
            AnyCap gives AI agents zero-friction access to capabilities they
            cannot perform natively: image generation, video, music, TTS, ASR,
            web search, and structured crawling.
          </p>
          <p className="mt-2">
            You interact with AnyCap through a single CLI binary. Every command
            returns JSON to stdout. Errors go to stderr. No SDK integration
            required.
          </p>
        </Section>

        <Section title="Install">
          <CodeBlock>{`curl -fsSL https://anycap.ai/install.sh | sh`}</CodeBlock>
          <p className="mt-2 text-sm text-[#888]">
            This installs the <code>anycap</code> binary to your PATH.
            Alternatively, download from{" "}
            <a
              href="https://github.com/anthropics/anycap/releases"
              className="underline"
            >
              GitHub Releases
            </a>
            .
          </p>
        </Section>

        <Section title="Auth">
          <p>Option 1: Interactive login (opens browser once):</p>
          <CodeBlock>{`anycap login`}</CodeBlock>
          <p className="mt-3">Option 2: Set API key directly:</p>
          <CodeBlock>{`anycap config set-key sk-xxx`}</CodeBlock>
          <p className="mt-2 text-sm text-[#888]">
            Credentials are saved to <code>~/.anycap/credentials</code> and
            shared across all agent environments. You only need to authenticate
            once.
          </p>
        </Section>

        <Section title="Quick Start">
          <CodeBlock>
            {[
              "# Check connection",
              "anycap status",
              "",
              "# List available image models",
              "anycap image models",
              "",
              "# Generate an image",
              'anycap image generate --prompt "paper crane" --model flux-dev',
              "",
              "# Generate a video",
              'anycap video generate --prompt "sunrise over mountains"',
              "",
              "# Text to speech",
              'anycap tts generate --text "Hello from AnyCap"',
            ].join("\n")}
          </CodeBlock>
        </Section>

        <Section title="Capabilities">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[#888] border-b border-[#333]">
                  <th className="py-2 pr-4">Capability</th>
                  <th className="py-2 pr-4">Command</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                <CapRow cap="image" cmd="anycap image generate" desc="Generate, edit, upscale images" />
                <CapRow cap="video" cmd="anycap video generate" desc="Text-to-video, image-to-video" />
                <CapRow cap="music" cmd="anycap music generate" desc="Tracks, loops, full songs" />
                <CapRow cap="tts" cmd="anycap tts generate" desc="Text-to-speech synthesis" />
                <CapRow cap="asr" cmd="anycap asr transcribe" desc="Speech-to-text transcription" />
                <CapRow cap="search" cmd="anycap search web" desc="Web, news, academic search" />
                <CapRow cap="crawl" cmd="anycap crawl url" desc="Structured web extraction" />
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#888]">
            Each capability supports <code>models</code> subcommand to list
            available models. Use <code>--model</code> to select a specific one.
          </p>
        </Section>

        <Section title="Output Format">
          <p>All commands return JSON to stdout:</p>
          <CodeBlock>
            {JSON.stringify(
              {
                status: "success",
                data: {
                  url: "https://cdn.anycap.ai/img/abc123.png",
                  model: "flux-dev",
                  prompt: "paper crane",
                },
              },
              null,
              2
            )}
          </CodeBlock>
          <p className="mt-2">
            Errors return a JSON object with <code>status: &quot;error&quot;</code> and a{" "}
            <code>message</code> field to stderr.
          </p>
        </Section>

        <Section title="Skill Files">
          <p>
            For detailed per-capability usage, best practices, and model
            recommendations, read the Skill Files:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>
              <code>anycap.skill</code> — Entry point, capability index
            </li>
            <li>
              <code>capabilities/anycap-image.skill</code> — Image generation
              details
            </li>
          </ul>
          <p className="mt-2 text-sm text-[#888]">
            Skill Files follow the Anthropic Agent Skills specification. Load
            the entry skill to discover all capabilities, then load only what
            you need.
          </p>
        </Section>

        <Section title="How It Works">
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Install the CLI (<code>curl -fsSL https://anycap.ai/install.sh | sh</code>)
            </li>
            <li>
              Authenticate once (<code>anycap login</code> or{" "}
              <code>anycap config set-key sk-xxx</code>)
            </li>
            <li>
              Call any capability (<code>anycap image generate --prompt &quot;...&quot;</code>)
            </li>
            <li>Parse the JSON response from stdout</li>
          </ol>
          <p className="mt-2">
            The CLI talks to the AnyCap Server. The server handles model
            routing, rate limiting, authentication, and billing. You never
            interact with upstream providers directly.
          </p>
        </Section>

        <Section title="Pricing">
          <p>
            Free tier available with generous limits. Pay-as-you-go after that.
          </p>
          <p className="mt-1">
            Manage billing at{" "}
            <Link href="/dashboard/billing" className="underline">
              anycap.ai/dashboard/billing
            </Link>
            .
          </p>
        </Section>

        <Section title="Links">
          <ul className="space-y-1">
            <li>
              GitHub:{" "}
              <a
                href="https://github.com/anthropics/anycap"
                className="underline"
              >
                github.com/anthropics/anycap
              </a>
            </li>
            <li>
              Human-readable version:{" "}
              <Link href="/for-human" className="underline">
                anycap.ai/for-human
              </Link>{" "}
              <span className="text-[#666]">(coming soon)</span>
            </li>
          </ul>
        </Section>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-2 text-white">## {title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-[#111] border border-[#333] rounded px-4 py-3 overflow-x-auto text-sm">
      <code>{children}</code>
    </pre>
  );
}

function CapRow({
  cap,
  cmd,
  desc,
}: {
  cap: string;
  cmd: string;
  desc: string;
}) {
  return (
    <tr>
      <td className="py-2 pr-4 font-bold">{cap}</td>
      <td className="py-2 pr-4">
        <code className="text-[#8be9fd]">{cmd}</code>
      </td>
      <td className="py-2 text-[#a0a0a0]">{desc}</td>
    </tr>
  );
}
