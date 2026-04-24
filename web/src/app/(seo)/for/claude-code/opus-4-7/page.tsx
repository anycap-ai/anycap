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

const ptBrContent: PageContent = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Equipar Agentes", href: "/for", unlinkable: true },
    { name: "Claude Code", href: "/for/claude-code" },
    { name: "Opus 4.7" },
  ],
  eyebrow: "Claude Code x Opus 4.7",
  lastUpdatedLabel: "Atualizado em 17 de abril de 2026",
  heroTitle: [
    "Claude Code no Opus 4.7 + AnyCap.",
    "O primeiro agente forte o bastante para tocar uma pipeline criativa de produção inteira.",
  ],
  heroIntro:
    "A maioria dos agentes consegue chamar uma API de imagem. O Opus 4.7 é o primeiro com profundidade de raciocínio para escolher o modelo certo entre sete, manter um briefing multi-asset por horas, olhar o output e decidir que está errado, encadear imagem em vídeo sem perder o plano, e devolver o resultado para a base de código. O AnyCap expõe Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, image understanding e video analysis em uma única CLI. O Opus 4.7 transforma essa frota em uma linha de produção que funciona.",
  ctas: {
    primary: "Instalar em 90 segundos",
    secondary: "Ver o workflow",
  },
  thesisLabel: "A tese",
  thesisTitle:
    "AnyCap é a frota de modelos. Opus 4.7 é o único agente capaz de pilotá-la sem supervisão.",
  thesisBody:
    "Um modelo mais fraco também consegue chamar qualquer comando do AnyCap. Diga qual modelo, qual prompt, quais parâmetros — e fique de olho. O Opus 4.7 é o primeiro agente que dispensa essa supervisão. Ele lê o briefing, escolhe o modelo, gera, avalia, refina, troca de modelo quando o primeiro errou, encadeia o still em image-to-video e despacha o asset para o repo. Esse último passo — fechar o loop — é onde o Opus 4.7 deixa de ser um chatbot com ferramentas e vira operador de linha de produção.",
  scenariosTitle: "Cinco cenários que só o Opus 4.7 destrava no AnyCap",
  scenariosIntro:
    "Cada um deles é tecnicamente possível em um agente mais fraco. Nenhum deles é confiável o bastante para entregar sem humano no loop. Opus 4.7 é o ponto de virada onde o humano pode sair da sala.",
  scenarios: [
    {
      index: "01",
      title: "Escolha automática do modelo certo numa frota de sete",
      body:
        "AnyCap expõe Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro e Kling 3.0. Opus 4.7 lê o briefing, sabe qual modelo combina e escolhe. \"Hero shot polido, fundo off-white\" → Seedream 5. \"Edite este mockup com sombras mais suaves\" → Nano Banana Pro. \"Image-to-video cinematográfico\" → Kling 3.0. \"Teaser de produção repetível\" → Seedance.",
      whyOpus:
        "Sonnet 4.6 escolhe um modelo, mas costuma cair no que apareceu por último no contexto. Opus 4.7 raciocina sobre encaixe de modelo antes de chamar.",
    },
    {
      index: "02",
      title: "Planejar e entregar um lançamento multi-asset numa única run",
      body:
        "\"Produza um pacote de lançamento: hero image, três variações sociais, um teaser de 6 segundos e um vídeo walkthrough.\" Opus 4.7 segura o briefing inteiro, sequencia seis chamadas do AnyCap, gerencia imagens de referência entre os passos e devolve o pacote como uma entrega única.",
      whyOpus:
        "Essa é a tarefa agentic de horizonte longo para a qual Sonnet 4.6 não foi feito. Em modelos mais leves, o briefing escapa depois do passo três. Opus 4.7 ainda lembra, no passo cinco, que as variações sociais precisam casar com o hero shot.",
    },
    {
      index: "03",
      title: "Olhar o output, decidir que está errado, consertar",
      body:
        "AnyCap devolve o asset gerado para a conversa. Opus 4.7 olha, julga se bate com o briefing, identifica o que está fora (\"a iluminação está dura demais, a cor da marca sumiu\") e refina o prompt, troca de modelo, ou escala de text-to-image para image-to-image.",
      whyOpus:
        "É raciocínio visual + recuperação de uso de tool no mesmo loop. A recuperação do Opus 4.7 depois de um \"isso não funcionou\" é a mais forte da linha Claude — e é o que torna iteração autônoma viável.",
    },
    {
      index: "04",
      title: "Encadear imagem em vídeo sem perder o briefing",
      body:
        "Gere o still no Seedream 5. Avalie se o still está pronto para o lançamento. Se sim, promova para image-to-video no Kling 3.0 com notas de movimento que vieram do briefing original. A identidade visual segue intacta porque o mesmo agente segurou o plano nas duas chamadas.",
      whyOpus:
        "Encadear modalidades exige que o agente lembre o que é \"on brand\" quando o meio muda. Opus 4.7 mantém isso entre modalidades. Modelos mais leves esquecem as notas de marca no instante em que a modalidade troca.",
      command:
        "anycap image generate --model seedream-5 --prompt \"...\" && anycap video generate --model kling-3.0 --mode image-to-video --param reference_image_urls='[\"./still.png\"]' --prompt \"...\"",
    },
    {
      index: "05",
      title: "Fechar o loop — devolver o asset para a base de código",
      body:
        "Quando o asset é aprovado, o Claude Code no Opus 4.7 escreve o arquivo no diretório certo, atualiza a página que precisa dele, roda o type checker, abre o PR e escreve a descrição. Mesmo agente, mesma sessão, sem repassar para humano nem para outra ferramenta.",
      whyOpus:
        "É a parte que transforma um chatbot com ferramentas em operador de linha de produção. Opus 4.7 é o agente que entrega consistentemente a última milha chata sem precisar ser cobrado duas vezes.",
    },
  ],
  reasoningTaxTitle: "Onde o prêmio de raciocínio do Opus 4.7 realmente compensa",
  reasoningTaxIntro:
    "Sonnet 4.6 + AnyCap é uma combinação ótima para volume alto. Opus 4.7 + AnyCap é a combinação para tarefas em que o custo de errar é maior do que o custo da inferência. O prêmio compensa no momento em que qualquer uma destas entra no fluxo.",
  reasoningTaxRows: [
    {
      task: "Imagem única, uma tentativa, você vai revisar de qualquer jeito",
      sonnet: "Use Sonnet 4.6 — rápido, barato, bom o suficiente.",
      opus47: "Exagero. Reserve o Opus 4.7 para a run multi-asset.",
    },
    {
      task: "Pacote de lançamento multi-asset, ponta a ponta",
      sonnet: "O briefing escapa no meio. Você re-prompta duas vezes.",
      opus47: "Mantém o briefing em todos os assets numa única run.",
    },
    {
      task: "Escolher o modelo certo entre sete para um briefing novo",
      sonnet: "Cai no modelo mais recente do contexto.",
      opus47: "Raciocina sobre encaixe de modelo antes de chamar.",
    },
    {
      task: "Olhar o output, julgar se bate com a marca",
      sonnet: "Vai dizer que está bom. Frequentemente está errado.",
      opus47: "Identifica o que está fora e propõe a correção.",
    },
    {
      task: "Encadear imagem → image-to-video sem perder identidade",
      sonnet: "As notas de marca escapam quando a modalidade muda.",
      opus47: "Carrega o briefing entre modalidades sem ruído.",
    },
    {
      task: "Despachar o asset, atualizar a página, abrir o PR",
      sonnet: "Para no write do arquivo. Você termina manual.",
      opus47: "Fecha o loop sem precisar de cobrança.",
    },
  ],
  installTitle: "Instale uma vez, depois fale normalmente com o Opus 4.7",
  installIntro:
    "AnyCap se instala na mesma sessão de Claude Code em que o Opus 4.7 já roda. Sem segundo SDK, sem segundo login, sem segunda superfície de agente.",
  installSteps: [
    "npx -y skills add anycap-ai/anycap -a claude-code -y",
    "curl -fsSL https://anycap.ai/install.sh | sh",
    "anycap login",
  ],
  installNote:
    "Depois da instalação, briefe o Opus 4.7 em linguagem natural. \"Gere um hero de lançamento em fundo off-white, depois um walkthrough de 6 segundos a partir da mesma imagem.\" O agente escolhe os modelos, executa a cadeia e devolve os assets na conversa.",
  ctaTitle: "Próximos passos recomendados",
  ctaCards: [
    {
      title: "Campanha de lançamento multi-asset com Opus 4.7",
      href: "/guides/multi-asset-launch-campaign-with-claude-opus-4-7",
      body: "Guia ponta a ponta: seis assets de lançamento numa única run do Opus 4.7.",
    },
    {
      title: "Opus 4.7 como diretor criativo",
      href: "/learn/claude-opus-4-7-as-creative-director",
      body: "Por que o Opus 4.7 é o primeiro agente capaz de dirigir uma frota de modelos, não só chamar um.",
    },
    {
      title: "Workflow de imagem + vídeo no Opus 4.7",
      href: "/guides/claude-opus-4-7-image-video-workflow",
      body: "De um still de lançamento a um vídeo walkthrough finalizado, num único terminal.",
    },
    {
      title: "Opus 4.7 vs Sonnet 4.6 para Claude Code",
      href: "/compare/claude-opus-4-7-vs-sonnet-4-6",
      body: "Quando o prêmio de raciocínio vale o custo — e quando não vale.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Por que combinar Opus 4.7 especificamente com AnyCap?",
      answer:
        "Porque o prêmio de raciocínio do Opus 4.7 só compensa quando a tarefa exige esse raciocínio. Rotear entre sete modelos de imagem e vídeo, segurar um briefing multi-asset, julgar se um asset gerado bate com a marca e encadear imagem em vídeo sem perder identidade são exatamente essas tarefas. AnyCap é a superfície que transforma o raciocínio do Opus 4.7 em mídia entregue.",
    },
    {
      question: "AnyCap exige Opus 4.7?",
      answer:
        "Não. O AnyCap funciona com Sonnet 4.6 e qualquer outro modelo Claude no Claude Code. O Opus 4.7 é o modelo que destrava as pipelines autônomas multi-step descritas nesta página. Modelos mais leves continuam executando os comandos individuais.",
    },
    {
      question: "O que \"fechar o loop\" significa de fato aqui?",
      answer:
        "Gerar o asset, escrever no diretório certo do repo, atualizar a página ou doc que depende dele, commitar a mudança, abrir um PR com descrição escrita. O Opus 4.7 faz tudo isso em uma sessão contínua no Claude Code — sem repasse para humano nem para outra ferramenta.",
    },
    {
      question: "Como isso difere de chamar APIs de imagem e vídeo direto?",
      answer:
        "Chamadas diretas jogam seleção de modelo, ajuste de parâmetros e lógica de encadeamento no colo do dev. AnyCap move isso para uma CLI; Opus 4.7 move o julgamento de quando e como chamar para dentro do agente. Juntos eles eliminam a cola humana entre intenção e asset entregue.",
    },
    {
      question: "Isso funciona hoje ou é promessa de roadmap?",
      answer:
        "Funciona hoje. Claude Code no Opus 4.7 está em GA. AnyCap se instala por um arquivo de skill e uma CLI. Image generation, video generation, image understanding e video analysis estão todos disponíveis como comandos chamáveis pelo agente agora.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline:
      "Claude Code no Opus 4.7 + AnyCap — o primeiro agente forte o bastante para tocar uma pipeline criativa de produção inteira",
    description:
      "Por que o Opus 4.7 é o ponto de virada em que um agente passa a rotear entre sete modelos de imagem e vídeo, segurar um briefing multi-asset, autocorrigir output visual, encadear imagem em vídeo e despachar o asset para a base de código de forma autônoma.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "Agente de IA", "Geração de imagem", "Geração de vídeo", "AnyCap"],
    keywords: [
      "claude code opus 4.7",
      "claude opus 4.7 claude code",
      "opus 4.7 geração de imagem",
      "opus 4.7 geração de vídeo",
      "opus 4.7 agente",
      "claude opus 4.7 anycap",
      "claude opus 4.7 pipeline criativa",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const idContent: PageContent = {
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Lengkapi Agen", href: "/for", unlinkable: true },
    { name: "Claude Code", href: "/for/claude-code" },
    { name: "Opus 4.7" },
  ],
  eyebrow: "Claude Code x Opus 4.7",
  lastUpdatedLabel: "Diperbarui 17 April 2026",
  heroTitle: [
    "Claude Code di atas Opus 4.7 + AnyCap.",
    "Agen pertama yang cukup kuat menjalankan pipeline produksi kreatif penuh.",
  ],
  heroIntro:
    "Sebagian besar agen bisa memanggil API gambar. Opus 4.7 adalah yang pertama dengan kedalaman reasoning untuk memilih model yang tepat dari tujuh pilihan, memegang brief multi-asset selama berjam-jam, melihat output dan memutuskan bahwa itu salah, merangkai image ke video tanpa kehilangan plan, lalu mengirim hasilnya kembali ke codebase. AnyCap menyodorkan Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, image understanding, dan video analysis lewat satu CLI. Opus 4.7 mengubah armada model itu menjadi lini produksi yang benar-benar jalan.",
  ctas: {
    primary: "Pasang dalam 90 detik",
    secondary: "Lihat workflow-nya",
  },
  thesisLabel: "Tesisnya",
  thesisTitle:
    "AnyCap adalah armada modelnya. Opus 4.7 adalah satu-satunya agen yang bisa mengemudikannya tanpa pengawasan.",
  thesisBody:
    "Model yang lebih lemah tetap bisa memanggil semua perintah AnyCap. Tinggal bilang model mana, prompt mana, parameter mana, lalu jaga matanya. Opus 4.7 adalah agen pertama yang tidak perlu pengawasan seperti itu. Ia membaca brief, memilih model, generate, evaluasi, refine, ganti model saat yang pertama salah, merangkai still ke image-to-video, dan mengirim aset ke repo. Langkah terakhir itu — menutup loop — adalah momen Opus 4.7 berhenti jadi chatbot dengan tools dan mulai jadi operator lini produksi.",
  scenariosTitle: "Lima skenario yang hanya Opus 4.7 buka di AnyCap",
  scenariosIntro:
    "Setiap skenario ini secara teknis bisa dijalankan agen yang lebih lemah. Tapi tak satu pun cukup andal untuk dikirim tanpa manusia di loop. Opus 4.7 adalah titik balik di mana manusia bisa keluar ruangan.",
  scenarios: [
    {
      index: "01",
      title: "Pemilihan model yang tepat secara otomatis dari armada tujuh model",
      body:
        "AnyCap menyediakan Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Seedance 1.5 Pro, dan Kling 3.0. Opus 4.7 membaca brief, tahu model mana yang cocok, lalu memilih. \"Hero shot rapi, latar off-white\" → Seedream 5. \"Edit mockup ini dengan bayangan yang lebih lembut\" → Nano Banana Pro. \"Image-to-video sinematik\" → Kling 3.0. \"Teaser produksi yang berulang\" → Seedance.",
      whyOpus:
        "Sonnet 4.6 akan memilih model, tapi sering jatuh ke model yang paling baru muncul di context. Opus 4.7 melakukan reasoning soal kecocokan model sebelum memanggil.",
    },
    {
      index: "02",
      title: "Merencanakan dan mengirim launch multi-asset dalam satu run",
      body:
        "\"Buatkan paket peluncuran: hero image, tiga varian social, teaser 6 detik, dan video walkthrough.\" Opus 4.7 memegang brief utuh, mengurutkan enam pemanggilan AnyCap, mengelola gambar referensi antar langkah, lalu mengembalikan paketnya sebagai satu pengiriman.",
      whyOpus:
        "Ini tugas agentic horizon panjang yang bukan dibangun untuk Sonnet 4.6. Pada model yang lebih ringan, brief mulai melenceng setelah langkah ketiga. Opus 4.7 masih ingat di langkah kelima bahwa varian social harus selaras dengan hero shot.",
    },
    {
      index: "03",
      title: "Lihat output, putuskan bahwa salah, perbaiki",
      body:
        "AnyCap mengembalikan aset hasil generate ke percakapan. Opus 4.7 melihatnya, menilai apakah cocok dengan brief, mengidentifikasi yang melenceng (\"pencahayaannya terlalu keras, warna brand-nya hilang\"), lalu memilih: refine prompt, ganti model, atau eskalasi dari text-to-image ke image-to-image.",
      whyOpus:
        "Ini visual reasoning + tool-use recovery dalam satu loop. Recovery Opus 4.7 dari \"itu tidak berhasil\" adalah yang terkuat di lini Claude, dan itulah yang membuat iterasi otonom jadi mungkin.",
    },
    {
      index: "04",
      title: "Rangkai image ke video tanpa kehilangan brief",
      body:
        "Generate still dengan Seedream 5. Lakukan reasoning apakah still itu siap launch. Jika ya, promosikan ke image-to-video di Kling 3.0 dengan catatan motion yang berasal dari brief asli. Identitas visual ikut karena agen yang sama memegang plan di kedua pemanggilan.",
      whyOpus:
        "Cross-modality chaining menuntut agen mengingat arti \"on brand\" saat medium berganti. Opus 4.7 memegang itu lintas modalitas. Model yang lebih ringan biasanya melupakan catatan brand begitu modalitas berpindah.",
      command:
        "anycap image generate --model seedream-5 --prompt \"...\" && anycap video generate --model kling-3.0 --mode image-to-video --param reference_image_urls='[\"./still.png\"]' --prompt \"...\"",
    },
    {
      index: "05",
      title: "Tutup loop — kirim asetnya kembali ke codebase",
      body:
        "Begitu aset disetujui, Claude Code di Opus 4.7 menulis file ke direktori yang tepat, memperbarui halaman yang membutuhkannya, menjalankan type checker, membuka PR, dan menulis deskripsinya. Agen yang sama, sesi yang sama, tanpa serah-terima ke manusia atau tool lain.",
      whyOpus:
        "Ini bagian yang mengubah chatbot bertools menjadi operator lini produksi. Opus 4.7 adalah agen yang konsisten menyelesaikan last mile membosankan tanpa perlu diingatkan dua kali.",
    },
  ],
  reasoningTaxTitle: "Di mana premi reasoning Opus 4.7 benar-benar terbayar",
  reasoningTaxIntro:
    "Sonnet 4.6 + AnyCap pasangan yang luar biasa untuk pekerjaan volume tinggi. Opus 4.7 + AnyCap pasangan untuk tugas di mana biaya salah lebih besar daripada biaya inference. Premi-nya terbayar begitu salah satu kebutuhan ini muncul di workflow.",
  reasoningTaxRows: [
    {
      task: "Satu image, sekali jalan, toh akan kamu review",
      sonnet: "Pakai Sonnet 4.6 — cepat, murah, sudah cukup.",
      opus47: "Berlebihan. Simpan Opus 4.7 untuk run multi-asset.",
    },
    {
      task: "Paket launch multi-asset, end-to-end",
      sonnet: "Brief melenceng di tengah jalan. Kamu re-prompt dua kali.",
      opus47: "Memegang brief untuk semua aset dalam satu run.",
    },
    {
      task: "Memilih model yang tepat dari tujuh untuk brief baru",
      sonnet: "Jatuh ke model paling akhir di context.",
      opus47: "Reasoning soal kecocokan model sebelum memanggil.",
    },
    {
      task: "Lihat output, nilai apakah cocok dengan brand",
      sonnet: "Akan bilang sudah bagus. Sering kali salah.",
      opus47: "Mengidentifikasi yang melenceng dan mengusulkan perbaikannya.",
    },
    {
      task: "Rangkai image → image-to-video tanpa kehilangan identitas",
      sonnet: "Catatan brand melenceng saat modalitas berganti.",
      opus47: "Membawa brief lintas modalitas dengan bersih.",
    },
    {
      task: "Kirim aset, update halaman, buka PR",
      sonnet: "Berhenti di file write. Kamu menyelesaikan manual.",
      opus47: "Menutup loop tanpa diminta lagi.",
    },
  ],
  installTitle: "Pasang sekali, lalu ngobrol biasa dengan Opus 4.7",
  installIntro:
    "AnyCap terpasang di sesi Claude Code yang sama dengan tempat Opus 4.7 berjalan. Tidak ada SDK kedua, tidak ada login kedua, tidak ada permukaan agen kedua.",
  installSteps: [
    "npx -y skills add anycap-ai/anycap -a claude-code -y",
    "curl -fsSL https://anycap.ai/install.sh | sh",
    "anycap login",
  ],
  installNote:
    "Setelah dipasang, brief Opus 4.7 dengan bahasa biasa. \"Buatkan hero launch dengan latar off-white, lalu walkthrough 6 detik dari image yang sama.\" Agen akan memilih model, menjalankan rangkaiannya, dan mengembalikan aset ke percakapan.",
  ctaTitle: "Langkah berikut yang paling masuk akal",
  ctaCards: [
    {
      title: "Kampanye launch multi-asset dengan Opus 4.7",
      href: "/guides/multi-asset-launch-campaign-with-claude-opus-4-7",
      body: "Panduan end-to-end: enam aset launch dalam satu run Opus 4.7.",
    },
    {
      title: "Opus 4.7 sebagai creative director",
      href: "/learn/claude-opus-4-7-as-creative-director",
      body: "Mengapa Opus 4.7 jadi agen pertama yang bisa memimpin armada model, bukan sekadar memanggilnya.",
    },
    {
      title: "Workflow image + video di Opus 4.7",
      href: "/guides/claude-opus-4-7-image-video-workflow",
      body: "Dari still launch sampai video walkthrough yang sudah jadi, satu terminal saja.",
    },
    {
      title: "Opus 4.7 vs Sonnet 4.6 untuk Claude Code",
      href: "/compare/claude-opus-4-7-vs-sonnet-4-6",
      body: "Kapan premi reasoning sepadan biayanya, kapan tidak.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Kenapa harus memasangkan Opus 4.7 secara spesifik dengan AnyCap?",
      answer:
        "Karena premi reasoning Opus 4.7 baru terbayar saat tugasnya memang butuh reasoning itu. Routing antar tujuh model image dan video, memegang brief multi-asset, menilai apakah aset hasil generate sesuai brand, dan merangkai image ke video tanpa kehilangan identitas — itulah tugas-tugas yang dimaksud. AnyCap adalah permukaan yang mengubah reasoning Opus 4.7 menjadi media yang benar-benar terkirim.",
    },
    {
      question: "Apakah AnyCap mewajibkan Opus 4.7?",
      answer:
        "Tidak. AnyCap jalan dengan Sonnet 4.6 dan model Claude lainnya di Claude Code. Opus 4.7 adalah model yang membuka pipeline otonom multi-step yang dijelaskan halaman ini. Model yang lebih ringan tetap bisa menjalankan perintah satuan.",
    },
    {
      question: "Apa arti \"menutup loop\" di sini?",
      answer:
        "Generate aset, tulis ke direktori repo yang tepat, perbarui halaman atau dokumentasi yang membutuhkannya, commit perubahannya, buka PR dengan deskripsi tertulis. Opus 4.7 melakukan semua itu dalam satu sesi Claude Code yang menyambung — tanpa serah-terima ke manusia atau tool lain.",
    },
    {
      question: "Apa bedanya dengan langsung memanggil API image dan video?",
      answer:
        "Pemanggilan API langsung melempar pemilihan model, tuning parameter, dan logika chaining ke developer. AnyCap memindahkannya ke satu CLI; Opus 4.7 memindahkan keputusan kapan dan bagaimana memanggil ke agen. Bersama-sama mereka menghapus glue manusia antara intent dan aset yang terkirim.",
    },
    {
      question: "Apakah ini sudah bisa dipakai sekarang atau klaim roadmap?",
      answer:
        "Sudah bisa sekarang. Claude Code di Opus 4.7 sudah generally available. AnyCap dipasang lewat satu skill file dan satu CLI. Image generation, video generation, image understanding, dan video analysis sudah tersedia sebagai perintah yang bisa dipanggil agen.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline:
      "Claude Code di Opus 4.7 + AnyCap — agen pertama yang cukup kuat menjalankan pipeline produksi kreatif penuh",
    description:
      "Mengapa Opus 4.7 jadi titik balik di mana agen mampu routing antar tujuh model image dan video, memegang brief multi-asset, mengoreksi output visual sendiri, merangkai image ke video, dan mengirim aset ke codebase secara otonom.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "AI agent", "Pembuatan gambar", "Pembuatan video", "AnyCap"],
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

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
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
