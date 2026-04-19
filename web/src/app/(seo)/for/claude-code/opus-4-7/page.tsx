import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PAGE_PATH = "/for/claude-code/opus-4-7";
const PAGE_PUBLISHED_ISO = "2026-04-17";
const PAGE_LAST_MODIFIED_ISO = "2026-04-17";

type Scenario = {
  index: string;
  title: string;
  body: string;
  whyOpus: string;
  command?: string;
};

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  ctas: { primary: string; secondary: string };
  thesisLabel: string;
  thesisTitle: string;
  thesisBody: string;
  scenariosTitle: string;
  scenariosIntro: string;
  scenarios: readonly Scenario[];
  reasoningTaxTitle: string;
  reasoningTaxIntro: string;
  reasoningTaxRows: readonly { task: string; sonnet: string; opus47: string }[];
  installTitle: string;
  installIntro: string;
  installSteps: readonly string[];
  installNote: string;
  ctaTitle: string;
  ctaCards: readonly { title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  articleJsonLd: Record<string, unknown>;
};

const enContent: PageContent = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Equip Agents", href: "/for", unlinkable: true },
    { name: "Claude Code", href: "/for/claude-code" },
    { name: "Opus 4.7" },
  ],
  eyebrow: "Claude Code x Opus 4.7",
  lastUpdatedLabel: "Updated April 17, 2026",
  heroTitle: [
    "Claude Code on Opus 4.7 + AnyCap.",
    "The first agent strong enough to run a full creative production pipeline.",
  ],
  heroIntro:
    "Most agents can call an image API. Opus 4.7 is the first one with the reasoning depth to pick the right model out of seven, hold a multi-asset brief across hours of work, look at the output and decide it is wrong, chain image into video without losing the plan, and ship the result back into the codebase. AnyCap exposes Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, image understanding, and video analysis through a single CLI. Opus 4.7 turns that fleet into a working production line.",
  ctas: {
    primary: "Install in 90 seconds",
    secondary: "See the workflow",
  },
  thesisLabel: "The thesis",
  thesisTitle:
    "AnyCap is the model fleet. Opus 4.7 is the only agent that can drive it without supervision.",
  thesisBody:
    "A weaker model can call any of the AnyCap commands. Tell it which model, which prompt, which parameters, and watch it carefully. Opus 4.7 is the first agent that does not need that supervision. It reads the brief, picks the model, generates, evaluates, refines, switches model when the first one was wrong, chains the still into image-to-video, and ships the asset into the repo. That last step — closing the loop — is where Opus 4.7 stops being a chatbot with tools and starts being a production-line operator.",
  scenariosTitle: "Five scenarios only Opus 4.7 unlocks on AnyCap",
  scenariosIntro:
    "Each of these is technically possible on a weaker agent. None of them is reliable enough to ship without a human in the loop. Opus 4.7 is the breakpoint where the human can leave the room.",
  scenarios: [
    {
      index: "01",
      title: "Auto-select the right model from a fleet of seven",
      body:
        "AnyCap exposes Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, and Kling 3.0. Opus 4.7 reads the brief, knows which model fits, and picks. \"Polished hero shot, off-white background\" → Seedream 5. \"Edit this mockup with softer shadows\" → Nano Banana Pro. \"Cinematic image-to-video\" → Kling 3.0. \"Repeatable production teaser\" → Seedance.",
      whyOpus:
        "Sonnet 4.6 will pick a model, but it will frequently default to whatever it saw most recently in context. Opus 4.7 reasons about model fit before calling.",
    },
    {
      index: "02",
      title: "Plan and ship a multi-asset launch in one run",
      body:
        "\"Produce a launch package: hero image, three social variants, a 6-second teaser, and a walkthrough video.\" Opus 4.7 holds the full brief, sequences six AnyCap calls, manages reference images between steps, and returns the package as a single delivery.",
      whyOpus:
        "This is the long-horizon agentic task that Sonnet 4.6 was not built for. The brief drifts after step three on lighter models. Opus 4.7 still remembers the social variants need to match the hero shot when it gets to step five.",
    },
    {
      index: "03",
      title: "Look at the output, decide it is wrong, fix it",
      body:
        "AnyCap returns the generated asset back into the conversation. Opus 4.7 looks at it, judges whether it matches the brief, identifies what is off (\"the lighting is too harsh, the brand color is missing\"), and either refines the prompt, switches model, or escalates from text-to-image to image-to-image.",
      whyOpus:
        "This is visual reasoning + tool-use recovery in the same loop. Opus 4.7's recovery from \"that did not work\" is the strongest in the Claude line, and it is what makes autonomous iteration possible.",
    },
    {
      index: "04",
      title: "Chain image into video without losing the brief",
      body:
        "Generate the still with Seedream 5. Reason about whether the still is launch-ready. If yes, promote it into image-to-video on Kling 3.0 with motion notes that came from the original brief. The visual identity carries through because the same agent held the plan across both calls.",
      whyOpus:
        "Cross-modality chaining requires the agent to remember what \"on brand\" means when the medium changes. Opus 4.7 holds that across modalities. Lighter models tend to forget the brand notes the moment the modality switches.",
      command:
        "anycap image generate --model seedream-5 --prompt \"...\" && anycap video generate --model kling-3.0 --mode image-to-video --param reference_image_urls='[\"./still.png\"]' --prompt \"...\"",
    },
    {
      index: "05",
      title: "Close the loop — ship the asset back into the codebase",
      body:
        "When the asset is approved, Claude Code on Opus 4.7 writes the file into the right directory, updates the page that needs it, runs the type checker, opens the PR, and writes the description. Same agent, same session, no handoff to a human or another tool.",
      whyOpus:
        "This is the part that turns a chatbot with tools into a production-line operator. Opus 4.7 is the agent that consistently does the boring last mile without being asked twice.",
    },
  ],
  reasoningTaxTitle: "Where the Opus 4.7 reasoning premium actually pays off",
  reasoningTaxIntro:
    "Sonnet 4.6 and AnyCap is a great pairing for high-volume work. Opus 4.7 and AnyCap is the pairing for tasks where the cost of getting it wrong is higher than the cost of the inference. The premium pays off the moment any of these enter the workflow.",
  reasoningTaxRows: [
    {
      task: "Single image, one shot, you'll review it anyway",
      sonnet: "Use Sonnet 4.6 — fast, cheap, good enough.",
      opus47: "Overkill. Save Opus 4.7 for the multi-asset run.",
    },
    {
      task: "Multi-asset launch package, end to end",
      sonnet: "Brief drifts halfway. You re-prompt twice.",
      opus47: "Holds the brief across all assets in one run.",
    },
    {
      task: "Pick the right model out of seven for an unfamiliar brief",
      sonnet: "Defaults to the most recent model in context.",
      opus47: "Reasons about model fit before calling.",
    },
    {
      task: "Look at output, judge if it matches the brand",
      sonnet: "Will say it looks good. Often wrong.",
      opus47: "Identifies what is off and proposes the fix.",
    },
    {
      task: "Chain image → image-to-video without losing identity",
      sonnet: "Brand notes drift when modality changes.",
      opus47: "Carries the brief across modalities cleanly.",
    },
    {
      task: "Ship the asset, update the page, open the PR",
      sonnet: "Stops at the file write. You finish manually.",
      opus47: "Closes the loop without prompting.",
    },
  ],
  installTitle: "Install once, then talk to Opus 4.7 normally",
  installIntro:
    "AnyCap installs into the same Claude Code session Opus 4.7 already runs in. No second SDK, no second login, no second agent surface.",
  installSteps: [
    "npx -y skills add anycap-ai/anycap -a claude-code -y",
    "curl -fsSL https://anycap.ai/install.sh | sh",
    "anycap login",
  ],
  installNote:
    "After install, brief Opus 4.7 in plain language. \"Generate a launch hero on off-white background, then a 6-second walkthrough from the same image.\" The agent picks the models, runs the chain, and returns the assets in the conversation.",
  ctaTitle: "Best next moves",
  ctaCards: [
    {
      title: "Multi-asset launch campaign with Opus 4.7",
      href: "/guides/multi-asset-launch-campaign-with-claude-opus-4-7",
      body: "End-to-end guide: six launch assets in one Opus 4.7 run.",
    },
    {
      title: "Opus 4.7 as creative director",
      href: "/learn/claude-opus-4-7-as-creative-director",
      body: "Why Opus 4.7 is the first agent that can direct a model fleet, not just call one.",
    },
    {
      title: "Image + video workflow on Opus 4.7",
      href: "/guides/claude-opus-4-7-image-video-workflow",
      body: "From a still launch visual to a finished walkthrough video, one terminal.",
    },
    {
      title: "Opus 4.7 vs Sonnet 4.6 for Claude Code",
      href: "/compare/claude-opus-4-7-vs-sonnet-4-6",
      body: "When the reasoning premium is worth the cost, and when it is not.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Why pair Opus 4.7 specifically with AnyCap?",
      answer:
        "Because the reasoning premium that Opus 4.7 commands only pays off when the task needs that reasoning. Routing across seven image and video models, holding a multi-asset brief, judging whether a generated asset matches the brand, and chaining image into video without losing identity are exactly those tasks. AnyCap is the surface that turns Opus 4.7's reasoning into shipped media.",
    },
    {
      question: "Does AnyCap require Opus 4.7?",
      answer:
        "No. AnyCap works with Sonnet 4.6 and any other Claude model in Claude Code. Opus 4.7 is the model that unlocks the autonomous, multi-step pipelines this page describes. Lighter models can still run the individual commands.",
    },
    {
      question: "What does \"close the loop\" actually mean here?",
      answer:
        "Generate the asset, write it to the right directory in the repo, update the page or doc that needs it, commit the change, open a PR with a written description. Opus 4.7 does that as one continuous session in Claude Code — no handoff to a human or to another tool.",
    },
    {
      question: "How is this different from calling image and video APIs directly?",
      answer:
        "Direct API calls put the model selection, parameter tuning, and chaining logic on the developer. AnyCap moves that into one CLI; Opus 4.7 moves the judgment of when and how to call it into the agent. Together they remove the human glue between intent and shipped asset.",
    },
    {
      question: "Will this work today, or is it a roadmap claim?",
      answer:
        "It works today. Claude Code on Opus 4.7 is generally available. AnyCap installs through one skill file and one CLI. Image generation, video generation, image understanding, and video analysis are all available as agent-callable commands now.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline:
      "Claude Code on Opus 4.7 + AnyCap — the first agent strong enough to run a full creative production pipeline",
    description:
      "Why Opus 4.7 is the breakpoint where an agent becomes capable of routing across seven image and video models, holding a multi-asset brief, self-correcting visual output, chaining image into video, and shipping the asset into the codebase — autonomously.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "AI agent", "Image generation", "Video generation", "AnyCap"],
    keywords: [
      "claude code opus 4.7",
      "claude opus 4.7 claude code",
      "opus 4.7 image generation",
      "opus 4.7 video generation",
      "opus 4.7 agent",
      "claude opus 4.7 anycap",
      "claude opus 4.7 creative pipeline",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const deContent: PageContent = {
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Agenten ausstatten", href: "/for", unlinkable: true },
    { name: "Claude Code", href: "/for/claude-code" },
    { name: "Opus 4.7" },
  ],
  eyebrow: "Claude Code x Opus 4.7",
  lastUpdatedLabel: "Aktualisiert am 17. April 2026",
  heroTitle: [
    "Claude Code auf Opus 4.7 + AnyCap.",
    "Der erste Agent, der stark genug ist, eine vollständige kreative Produktions-Pipeline zu betreiben.",
  ],
  heroIntro:
    "Die meisten Agenten können eine Bild-API aufrufen. Opus 4.7 ist der erste mit der Reasoning-Tiefe, das richtige Modell aus sieben auszuwählen, ein Multi-Asset-Briefing über Stunden hinweg zu halten, die Ausgabe zu betrachten und zu entscheiden, dass sie falsch ist, Bild in Video zu verketten, ohne den Plan zu verlieren, und das Ergebnis in die Codebasis zurückzuliefern. AnyCap stellt Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, Bildverständnis und Videoanalyse über eine einzige CLI bereit. Opus 4.7 macht aus dieser Modellflotte ein funktionierendes Fließband.",
  ctas: {
    primary: "In 90 Sekunden installieren",
    secondary: "Den Workflow ansehen",
  },
  thesisLabel: "Die These",
  thesisTitle:
    "AnyCap ist die Modellflotte. Opus 4.7 ist der einzige Agent, der sie ohne Aufsicht steuern kann.",
  thesisBody:
    "Ein schwächeres Modell kann jeden der AnyCap-Befehle aufrufen. Sagen Sie ihm, welches Modell, welcher Prompt, welche Parameter, und behalten Sie es im Auge. Opus 4.7 ist der erste Agent, der diese Aufsicht nicht braucht. Es liest das Briefing, wählt das Modell, generiert, evaluiert, verfeinert, wechselt das Modell, wenn das erste falsch war, verkettet das Standbild in Bild-zu-Video und liefert das Asset in das Repo. Genau dieser letzte Schritt – den Kreislauf zu schließen – ist der Punkt, an dem Opus 4.7 aufhört, ein Chatbot mit Tools zu sein, und zum Fließband-Operator wird.",
  scenariosTitle: "Fünf Szenarien, die nur Opus 4.7 auf AnyCap freischaltet",
  scenariosIntro:
    "Jedes davon ist technisch auf einem schwächeren Agenten möglich. Keines ist zuverlässig genug, um ohne Mensch im Loop ausgeliefert zu werden. Opus 4.7 ist der Wendepunkt, an dem der Mensch den Raum verlassen kann.",
  scenarios: [
    {
      index: "01",
      title: "Automatische Auswahl des richtigen Modells aus einer Flotte von sieben",
      body:
        "AnyCap stellt Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro und Kling 3.0 bereit. Opus 4.7 liest das Briefing, weiß, welches Modell passt, und wählt aus. \"Polierter Hero-Shot, gebrochen weißer Hintergrund\" → Seedream 5. \"Bearbeite dieses Mockup mit weicheren Schatten\" → Nano Banana Pro. \"Cinematisches Bild-zu-Video\" → Kling 3.0. \"Wiederholbarer Produktions-Teaser\" → Seedance.",
      whyOpus:
        "Sonnet 4.6 wird ein Modell auswählen, aber häufig auf das zurückgreifen, was es zuletzt im Kontext gesehen hat. Opus 4.7 reasoniert über die Modellpassung, bevor es aufruft.",
    },
    {
      index: "02",
      title: "Ein Multi-Asset-Launch in einem Lauf planen und ausliefern",
      body:
        "\"Erstelle ein Launch-Paket: Hero-Bild, drei Social-Varianten, ein 6-Sekunden-Teaser und ein Walkthrough-Video.\" Opus 4.7 hält das vollständige Briefing, sequenziert sechs AnyCap-Aufrufe, verwaltet Referenzbilder zwischen den Schritten und liefert das Paket als eine einzige Lieferung.",
      whyOpus:
        "Das ist die langfristige agentische Aufgabe, für die Sonnet 4.6 nicht gebaut wurde. Auf leichteren Modellen driftet das Briefing nach Schritt drei. Opus 4.7 erinnert sich auch in Schritt fünf noch daran, dass die Social-Varianten zum Hero-Shot passen müssen.",
    },
    {
      index: "03",
      title: "Die Ausgabe ansehen, entscheiden, dass sie falsch ist, sie korrigieren",
      body:
        "AnyCap liefert das generierte Asset zurück in die Konversation. Opus 4.7 sieht es sich an, beurteilt, ob es zum Briefing passt, identifiziert, was nicht stimmt (\"die Beleuchtung ist zu hart, die Markenfarbe fehlt\"), und verfeinert entweder den Prompt, wechselt das Modell oder eskaliert von Text-zu-Bild auf Bild-zu-Bild.",
      whyOpus:
        "Das ist visuelles Reasoning + Tool-Use-Recovery in derselben Schleife. Die Wiederherstellung von Opus 4.7 nach \"das hat nicht funktioniert\" ist die stärkste in der Claude-Reihe und macht autonomes Iterieren möglich.",
    },
    {
      index: "04",
      title: "Bild in Video verketten, ohne das Briefing zu verlieren",
      body:
        "Erzeugen Sie das Standbild mit Seedream 5. Reasonieren Sie, ob das Standbild launch-reif ist. Wenn ja, befördern Sie es in Bild-zu-Video auf Kling 3.0 mit Bewegungsanweisungen aus dem ursprünglichen Briefing. Die visuelle Identität bleibt erhalten, weil derselbe Agent den Plan über beide Aufrufe hinweg gehalten hat.",
      whyOpus:
        "Cross-Modalitäts-Verkettung erfordert, dass der Agent sich daran erinnert, was \"on brand\" bedeutet, wenn das Medium wechselt. Opus 4.7 hält das über Modalitäten hinweg. Leichtere Modelle vergessen die Markenanweisungen oft, sobald die Modalität wechselt.",
      command:
        "anycap image generate --model seedream-5 --prompt \"...\" && anycap video generate --model kling-3.0 --mode image-to-video --param reference_image_urls='[\"./still.png\"]' --prompt \"...\"",
    },
    {
      index: "05",
      title: "Den Kreislauf schließen — das Asset in die Codebasis zurückliefern",
      body:
        "Wenn das Asset freigegeben ist, schreibt Claude Code auf Opus 4.7 die Datei in das richtige Verzeichnis, aktualisiert die Seite, die es benötigt, führt den Type-Checker aus, öffnet den PR und schreibt die Beschreibung. Derselbe Agent, dieselbe Sitzung, keine Übergabe an einen Menschen oder ein anderes Tool.",
      whyOpus:
        "Das ist der Teil, der einen Chatbot mit Tools in einen Fließband-Operator verwandelt. Opus 4.7 ist der Agent, der die langweilige letzte Meile konsistent erledigt, ohne zweimal gefragt werden zu müssen.",
    },
  ],
  reasoningTaxTitle: "Wo sich der Reasoning-Aufschlag von Opus 4.7 tatsächlich auszahlt",
  reasoningTaxIntro:
    "Sonnet 4.6 und AnyCap ist eine großartige Kombination für High-Volume-Arbeit. Opus 4.7 und AnyCap ist die Kombination für Aufgaben, bei denen die Kosten eines Fehlers höher sind als die Kosten der Inferenz. Der Aufschlag zahlt sich in dem Moment aus, in dem eine dieser Aufgaben in den Workflow gelangt.",
  reasoningTaxRows: [
    {
      task: "Einzelnes Bild, ein Versuch, Sie prüfen es ohnehin",
      sonnet: "Sonnet 4.6 verwenden – schnell, günstig, gut genug.",
      opus47: "Übertrieben. Opus 4.7 für den Multi-Asset-Lauf aufheben.",
    },
    {
      task: "Multi-Asset-Launch-Paket, end-to-end",
      sonnet: "Briefing driftet auf halber Strecke. Sie prompten zweimal nach.",
      opus47: "Hält das Briefing über alle Assets in einem Lauf hinweg.",
    },
    {
      task: "Das richtige Modell aus sieben für ein unbekanntes Briefing wählen",
      sonnet: "Greift auf das aktuellste Modell im Kontext zurück.",
      opus47: "Reasoniert über Modellpassung, bevor es aufruft.",
    },
    {
      task: "Ausgabe ansehen, beurteilen, ob sie zur Marke passt",
      sonnet: "Wird sagen, dass es gut aussieht. Oft falsch.",
      opus47: "Identifiziert, was nicht stimmt, und schlägt die Korrektur vor.",
    },
    {
      task: "Bild → Bild-zu-Video verketten, ohne die Identität zu verlieren",
      sonnet: "Markenanweisungen driften, wenn die Modalität wechselt.",
      opus47: "Trägt das Briefing sauber über Modalitäten hinweg.",
    },
    {
      task: "Asset ausliefern, Seite aktualisieren, PR öffnen",
      sonnet: "Stoppt beim Datei-Schreiben. Sie machen manuell weiter.",
      opus47: "Schließt den Kreislauf ohne Nachfragen.",
    },
  ],
  installTitle: "Einmal installieren, dann ganz normal mit Opus 4.7 sprechen",
  installIntro:
    "AnyCap installiert sich in dieselbe Claude-Code-Sitzung, in der Opus 4.7 bereits läuft. Kein zweites SDK, kein zweites Login, keine zweite Agent-Oberfläche.",
  installSteps: [
    "npx -y skills add anycap-ai/anycap -a claude-code -y",
    "curl -fsSL https://anycap.ai/install.sh | sh",
    "anycap login",
  ],
  installNote:
    "Briefen Sie nach der Installation Opus 4.7 in einfacher Sprache. \"Erzeuge ein Launch-Hero auf gebrochen weißem Hintergrund, dann ein 6-Sekunden-Walkthrough aus demselben Bild.\" Der Agent wählt die Modelle, führt die Kette aus und liefert die Assets in der Konversation zurück.",
  ctaTitle: "Beste nächste Schritte",
  ctaCards: [
    {
      title: "Multi-Asset-Launch-Kampagne mit Opus 4.7",
      href: "/guides/multi-asset-launch-campaign-with-claude-opus-4-7",
      body: "End-to-end-Anleitung: sechs Launch-Assets in einem Opus-4.7-Lauf.",
    },
    {
      title: "Opus 4.7 als Creative Director",
      href: "/learn/claude-opus-4-7-as-creative-director",
      body: "Warum Opus 4.7 der erste Agent ist, der eine Modellflotte dirigieren kann, statt nur eine aufzurufen.",
    },
    {
      title: "Bild- und Video-Workflow auf Opus 4.7",
      href: "/guides/claude-opus-4-7-image-video-workflow",
      body: "Vom statischen Launch-Visual bis zum fertigen Walkthrough-Video, ein Terminal.",
    },
    {
      title: "Opus 4.7 vs Sonnet 4.6 für Claude Code",
      href: "/compare/claude-opus-4-7-vs-sonnet-4-6",
      body: "Wann sich der Reasoning-Aufschlag lohnt und wann nicht.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Warum gerade Opus 4.7 mit AnyCap kombinieren?",
      answer:
        "Weil sich der Reasoning-Aufschlag von Opus 4.7 nur dann auszahlt, wenn die Aufgabe dieses Reasoning braucht. Routing zwischen sieben Bild- und Videomodellen, das Halten eines Multi-Asset-Briefings, das Beurteilen, ob ein generiertes Asset zur Marke passt, und das Verketten von Bild in Video ohne Identitätsverlust sind genau diese Aufgaben. AnyCap ist die Oberfläche, die das Reasoning von Opus 4.7 in ausgelieferte Medien verwandelt.",
    },
    {
      question: "Erfordert AnyCap Opus 4.7?",
      answer:
        "Nein. AnyCap funktioniert mit Sonnet 4.6 und jedem anderen Claude-Modell in Claude Code. Opus 4.7 ist das Modell, das die autonomen, mehrstufigen Pipelines freischaltet, die diese Seite beschreibt. Leichtere Modelle können die einzelnen Befehle weiterhin ausführen.",
    },
    {
      question: "Was bedeutet \"den Kreislauf schließen\" hier konkret?",
      answer:
        "Asset erzeugen, in das richtige Verzeichnis im Repo schreiben, die Seite oder das Dokument aktualisieren, die Änderung committen, PR mit geschriebener Beschreibung öffnen. Opus 4.7 erledigt das in einer durchgehenden Sitzung in Claude Code – keine Übergabe an einen Menschen oder ein anderes Tool.",
    },
    {
      question: "Wie unterscheidet sich das vom direkten Aufruf von Bild- und Video-APIs?",
      answer:
        "Direkte API-Aufrufe legen Modellauswahl, Parameter-Tuning und Verkettungslogik auf den Entwickler. AnyCap verlagert das in eine CLI; Opus 4.7 verlagert die Beurteilung, wann und wie aufgerufen wird, in den Agent. Zusammen entfernen sie den menschlichen Klebstoff zwischen Absicht und ausgeliefertem Asset.",
    },
    {
      question: "Funktioniert das heute oder ist das ein Roadmap-Versprechen?",
      answer:
        "Es funktioniert heute. Claude Code auf Opus 4.7 ist allgemein verfügbar. AnyCap installiert sich über eine Skill-Datei und eine CLI. Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse sind alle als agent-aufrufbare Befehle verfügbar.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline:
      "Claude Code auf Opus 4.7 + AnyCap – der erste Agent, der stark genug ist, eine vollständige kreative Produktions-Pipeline zu betreiben",
    description:
      "Warum Opus 4.7 der Wendepunkt ist, an dem ein Agent in der Lage wird, zwischen sieben Bild- und Videomodellen zu routen, ein Multi-Asset-Briefing zu halten, visuelle Ausgaben selbst zu korrigieren, Bild in Video zu verketten und das Asset autonom in die Codebasis auszuliefern.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "KI-Agent", "Bildgenerierung", "Videogenerierung", "AnyCap"],
    keywords: [
      "claude code opus 4.7",
      "claude opus 4.7 claude code",
      "opus 4.7 bildgenerierung",
      "opus 4.7 videogenerierung",
      "opus 4.7 agent",
      "claude opus 4.7 anycap",
      "claude opus 4.7 creative pipeline",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: enContent,
  "pt-br": enContent,
  id: enContent,
  de: deContent,
};

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PAGE_PATH,
  {
    title: "Claude Code Opus 4.7 + AnyCap Capabilities",
    description:
      "Opus 4.7 has the reasoning depth to direct image and video models autonomously. Add AnyCap and ship multi-asset launch packages in one run.",
    openGraph: {
      type: "website",
      title: "Claude Code on Opus 4.7 + AnyCap — autonomous creative production for agents",
      description:
        "The first agent strong enough to run a full creative production pipeline — Seedream 5, Nano Banana Pro, Veo 3.1, Kling, Seedance — directed by Opus 4.7 in Claude Code.",
    },
  }
);

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="bg-[#1c1f17] px-5 py-4 overflow-x-auto">
      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
        {command}
      </p>
    </div>
  );
}

export default async function ClaudeCodeOpus47Page() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      {faqJsonLd['@type'] ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-3 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5.5vw, 68px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.ctas.primary}
              </Link>
              <Link
                href="/guides/claude-opus-4-7-image-video-workflow"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.ctas.secondary}
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.thesisLabel}
              </p>
              <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.thesisTitle}
              </h2>
              <p className="mt-5 max-w-[860px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.thesisBody}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.scenariosTitle}
              </h2>
              <p className="mt-3 max-w-[860px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.scenariosIntro}
              </p>
              <div className="mt-8 grid gap-6">
                {content.scenarios.map((scenario) => (
                  <div
                    key={scenario.index}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 md:p-8"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Scenario {scenario.index}
                    </p>
                    <h3 className="mt-3 text-[20px] leading-7 text-[#1c1f17] md:text-[22px]" style={pixel}>
                      {scenario.title}
                    </h3>
                    <p className="mt-4 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {scenario.body}
                    </p>
                    <div className="mt-5 rounded-[16px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-5">
                      <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        Why Opus 4.7 specifically
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                        {scenario.whyOpus}
                      </p>
                    </div>
                    {scenario.command ? (
                      <div className="mt-5">
                        <CommandBlock command={scenario.command} />
                      </div>
                    ) : null}
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.reasoningTaxTitle}
              </h2>
              <p className="mt-3 max-w-[860px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.reasoningTaxIntro}
              </p>
              <div className="mt-8 overflow-hidden rounded-[24px] border border-[#d4dbb8]">
                <table className="w-full border-collapse text-left text-sm text-[#1c1f17]">
                  <thead className="bg-[#f7f8ef]">
                    <tr>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Task
                      </th>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Sonnet 4.6 + AnyCap
                      </th>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Opus 4.7 + AnyCap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.reasoningTaxRows.map((row) => (
                      <tr key={row.task} className="border-t border-[#d4dbb8] align-top">
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#1c1f17]" style={mono}>
                          {row.task}
                        </td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.sonnet}</td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.opus47}</td>
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.installTitle}
              </h2>
              <p className="mt-5 max-w-[820px] text-base leading-7 text-[#4d5145]">
                {content.installIntro}
              </p>
              <div className="mt-8 grid gap-4">
                {content.installSteps.map((step, index) => (
                  <div key={step} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <CommandBlock command={step} />
                  </div>
                ))}
              </div>
              <p className="mt-6 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.installNote}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.ctaTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.ctaCards.map((card) => (
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">{item.answer}</p>
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
