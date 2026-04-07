import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 7, 2026";
const lastUpdatedIso = "2026-04-07";

export const metadata: Metadata = {
  title: "How to add multimodal capabilities to a SaaS chatbot",
  description:
    "A practical guide for SaaS teams adding image, video, web, and file workflows to an AI chatbot without rebuilding the whole product from scratch.",
  alternates: { canonical: "/learn/add-multimodal-capabilities-to-saas-chatbot" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/add-multimodal-capabilities-to-saas-chatbot",
    siteName: siteConfig.siteName,
    title: "How to add multimodal capabilities to a SaaS chatbot",
    description:
      "See the stack pattern, rollout order, and capability layer that help a SaaS chatbot move beyond text-only workflows.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "How to add multimodal capabilities to a SaaS chatbot",
  description:
    "Implementation-focused guide for SaaS teams extending a chatbot with image, video, web, and delivery workflows through a capability runtime.",
  path: "/learn/add-multimodal-capabilities-to-saas-chatbot",
  about: [
    "Multimodal AI",
    "AI chatbot SaaS",
    "SaaS architecture",
    "AI agents",
    "Agent capability runtime",
  ],
  keywords: [
    "multimodal chatbot",
    "saas chatbot",
    "add multimodal capabilities to chatbot",
    "multimodal ai chatbot saas",
    "chatbot with image and video support",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const quickTakeaways = [
  "Add multimodal capability in layers, not as random one-off provider calls.",
  "Start with the user inputs and outputs that create the most friction: screenshots, web context, media generation, and shareable deliverables.",
  "The clean pattern is chat interface plus orchestration plus a capability runtime plus an output layer.",
] as const;

const modalityCards = [
  {
    title: "Image understanding",
    body: "The chatbot can inspect screenshots, diagrams, product UI states, and visual references instead of forcing the user to describe everything in text.",
  },
  {
    title: "Video understanding",
    body: "The system can reason over screen recordings, demos, and short clips when the problem is temporal rather than static.",
  },
  {
    title: "Media generation",
    body: "The workflow can return images or videos as outputs when the user wants assets, not only written advice about what to create.",
  },
  {
    title: "Web context",
    body: "The assistant can pull in live external information through search and crawl instead of relying only on your internal knowledge layer.",
  },
] as const;

const stackLayers = [
  {
    title: "Chat surface",
    body: "Keep the interface your users already understand. The chat layer gathers the request, clarifies intent, and shows progress and outputs.",
  },
  {
    title: "Orchestration layer",
    body: "This is where you decide which tool or capability to call, how to keep state, and when to ask follow-up questions before the task runs.",
  },
  {
    title: "Capability runtime",
    body: "This layer handles the actual powers around the model: image and video generation, image and video understanding, web search, crawl, and output delivery.",
  },
  {
    title: "Delivery layer",
    body: "The final output often needs to leave the chat thread as a file, a share link, or a published page. Plan for that from the start instead of treating it as an afterthought.",
  },
] as const;

const rolloutSteps = [
  {
    step: "Step 1",
    title: "Start with the highest-friction user input",
    body: "For many SaaS assistants, the first broken experience is a screenshot. Users upload a UI image or error screen, and the chatbot cannot see what they mean. That makes image understanding the cleanest first capability to add.",
  },
  {
    step: "Step 2",
    title: "Add live web retrieval for changing information",
    body: "If the answer depends on current docs, pricing, competitor pages, or external references, static retrieval is not enough. Add search and crawl before you add more prompt engineering.",
  },
  {
    step: "Step 3",
    title: "Add generation only when the product must return assets",
    body: "Image and video generation are powerful, but they should come after you know the user really expects media output. Otherwise you add cost and complexity before the product needs it.",
  },
  {
    step: "Step 4",
    title: "Add a real output path",
    body: "Once the assistant returns richer results, users need links, files, or hosted pages. Plan the delivery layer early so the workflow can end in something usable instead of a long chat transcript.",
  },
] as const;

const tradeoffRows = [
  {
    dimension: "Integration pattern",
    boltOn: "Each new modality becomes its own provider-specific exception.",
    runtime: "Capabilities sit behind one consistent runtime surface.",
  },
  {
    dimension: "Prompt design",
    boltOn: "Prompts keep absorbing system complexity and edge cases.",
    runtime: "Prompts stay focused on intent while the runtime handles tool execution.",
  },
  {
    dimension: "Operational overhead",
    boltOn: "Teams manage separate APIs, auth flows, and response formats.",
    runtime: "The assistant can reuse one capability layer across workflows.",
  },
  {
    dimension: "Product consistency",
    boltOn: "The user experience feels different every time a new tool path appears.",
    runtime: "The assistant behaves like one system even as capabilities expand.",
  },
  {
    dimension: "Output delivery",
    boltOn: "Results often die inside the chat thread.",
    runtime: "Results can move into files, links, or publishable artifacts.",
  },
] as const;

const useCaseCards = [
  {
    title: "Support screenshot triage",
    body: "Users send screenshots of broken UI states. The assistant reads the image, matches it to known product patterns, and returns a grounded answer instead of generic troubleshooting text.",
  },
  {
    title: "Customer success research assistant",
    body: "The workflow searches live help docs or external resources, crawls the useful pages, and summarizes what changed for the operator who asked the question.",
  },
  {
    title: "Growth or launch assistant",
    body: "The product turns requests into launch visuals, demo clips, and shareable deliverables rather than stopping at a list of recommendations.",
  },
] as const;

const capabilityCards = [
  {
    title: "Image understanding",
    href: "/capabilities/image-understanding",
    body: "Read screenshots, diagrams, and visual references through the same workflow.",
  },
  {
    title: "Video analysis",
    href: "/capabilities/video-analysis",
    body: "Inspect recordings when the problem depends on sequence and motion.",
  },
  {
    title: "Web search",
    href: "/capabilities/web-search",
    body: "Pull in live information when the knowledge layer alone is not enough.",
  },
  {
    title: "Web crawl",
    href: "/capabilities/web-crawl",
    body: "Convert web pages into usable markdown or structured agent context.",
  },
  {
    title: "Image generation",
    href: "/capabilities/image-generation",
    body: "Return visual assets when the product must create rather than only explain.",
  },
  {
    title: "Drive",
    href: "/capabilities/drive",
    body: "Turn rich outputs into shareable files and links a human can actually use.",
  },
] as const;

const nextMoveCards = [
  {
    title: "See the architecture decision first",
    href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
    body: "Use this page if you still need to clarify whether the product is really a chatbot or an agent workflow.",
  },
  {
    title: "Map the capability gap",
    href: "/learn/what-agents-cant-do",
    body: "Use this page if you want the shortest explanation of what breaks first when chat alone is not enough.",
  },
  {
    title: "Browse capability surfaces",
    href: "/capabilities",
    body: "Use Capabilities when you want the concrete product pages behind the stack pattern described here.",
  },
  {
    title: "Take the install path",
    href: "/guides/install-anycap",
    body: "Use the install guide when you are ready to move from architecture planning into setup.",
  },
] as const;

const faqItems = [
  {
    question: "What does multimodal mean for a SaaS chatbot?",
    answer:
      "It means the system can work with more than text. In practice that usually includes screenshots, images, videos, live web pages, and richer output formats such as files or shared links.",
  },
  {
    question: "Should I add every modality at once?",
    answer:
      "No. Start with the input or output that creates the most user friction. For many SaaS products that means screenshot understanding first, then live web context, then media generation if the product truly needs it.",
  },
  {
    question: "Can I keep my current chatbot experience and still add these capabilities?",
    answer:
      "Yes. That is usually the best route. Keep the interface and orchestration you already like, then add a runtime that gives the system the missing capabilities around it.",
  },
  {
    question: "Where does AnyCap fit in this implementation pattern?",
    answer:
      "AnyCap fits as the capability runtime. It gives the assistant image, video, web, storage, and delivery workflows through one capability surface instead of many unrelated integrations.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AddMultimodalCapabilitiesToSaaSChatbotPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "Add multimodal capabilities to a SaaS chatbot" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Learn
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(30px, 5.4vw, 68px)" }}
            >
              Add multimodal capabilities
              <br />
              to a SaaS chatbot
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              Many SaaS chatbots feel useful until the user drops in a screenshot, asks for live
              external context, or expects the system to return an actual asset instead of a text
              answer. That is the point where prompt tuning stops being enough. You need a cleaner
              capability layer around the chatbot workflow.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Answer-first summary
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  The cleanest path is not more prompt complexity. It is a runtime that adds the missing powers.
                </h2>
                <p className="mt-5 max-w-[740px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  In practice, most teams should keep the chat experience they already have and add
                  capabilities around it in a sane order: visual understanding first, live web
                  retrieval second, media generation only when the product truly needs it, and a
                  delivery layer so outputs can leave the chat thread. That is where a capability
                  runtime becomes more useful than another patchwork provider integration.
                </p>
              </div>

              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#f7f8ef]/80 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Key points
                </p>
                <div className="mt-5">
                  <BulletList items={quickTakeaways} />
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                What multimodal means
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                A multimodal chatbot does not just talk. It can inspect, retrieve, create, and deliver.
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {modalityCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Stack pattern
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                The implementation pattern is simple: keep the chat layer and upgrade the system around it
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                SaaS teams often over-focus on the interface and under-plan the execution path. A
                cleaner system separates the visible conversation from the orchestration logic, the
                capability runtime, and the output layer. That gives you a product that can grow
                without turning every new modality into another exception branch.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stackLayers.map((layer) => (
                  <div
                    key={layer.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {layer.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {layer.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Rollout order
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Add capabilities in the order that removes the most user friction
              </h2>
              <div className="mt-8 space-y-4">
                {rolloutSteps.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.step}
                    </p>
                    <h3 className="mt-3 text-base text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                What to avoid
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Random bolt-on integrations create product debt faster than they create value
              </h2>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Dimension
                      </th>
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Bolt-on pattern
                      </th>
                      <th
                        className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]"
                        style={mono}
                      >
                        Capability runtime pattern
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeoffRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 align-top text-sm font-medium text-[#1c1f17]">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 align-top text-sm leading-6 text-[#4d5145]">
                          {row.boltOn}
                        </td>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {row.runtime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Product examples
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Three common places the feature request becomes an architecture change
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {useCaseCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Where AnyCap fits
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                AnyCap gives the chatbot or agent the capability layer around the model
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                That is the practical implementation point for this page. You do not need to rename
                your product or rebuild the interface just to add richer behavior. You need a
                runtime that can handle multimodal input, multimodal output, live web tasks, and
                delivery workflows through one consistent surface.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Best next moves
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Keep moving from architecture into product pages and setup
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                FAQ
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Common implementation questions
              </h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
