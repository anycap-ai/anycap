import type { Metadata } from "next";
import { DriveDemo } from "@/components/landing/DriveDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Drive for AI agents - Shared storage, file organization, and public URLs",
    description:
      "Give AI agents a shared drive through AnyCap. Store generated outputs, organize assets, and create public URLs through one interface instead of stitching storage into each workflow.",
    openGraphTitle: "Drive for AI agents - Shared storage, file organization, and public URLs",
    openGraphDescription:
      "Add shared storage and file delivery to AI agent workflows with AnyCap Drive.",
  },
  "pt-br": {
    title: "Drive para agentes de IA - armazenamento compartilhado e URLs publicas",
    description:
      "Dê aos agentes um drive compartilhado com AnyCap para armazenar resultados, organizar ativos e gerar URLs publicas sem reintegrar armazenamento em cada fluxo.",
    openGraphTitle: "Drive para agentes de IA - armazenamento compartilhado e URLs publicas",
    openGraphDescription:
      "Adicione armazenamento compartilhado e entrega de arquivos aos workflows de agentes com AnyCap Drive.",
  },
  id: {
    title: "Drive untuk agen AI - penyimpanan bersama, organisasi file, dan URL publik",
    description:
      "Berikan drive bersama ke agen AI melalui AnyCap. Simpan output generasi, rapikan aset, dan buat URL publik lewat satu antarmuka tanpa merangkai sistem storage terpisah per workflow.",
    openGraphTitle: "Drive untuk agen AI - penyimpanan bersama, organisasi file, dan URL publik",
    openGraphDescription:
      "Tambahkan penyimpanan bersama dan distribusi file ke workflow agen AI dengan AnyCap Drive.",
  },
  de: {
    title: "Drive für KI-Agenten – Gemeinsamer Speicher, Dateiorganisation und öffentliche URLs",
    description:
      "Geben Sie KI-Agenten ein gemeinsames Drive über AnyCap. Speichern Sie generierte Outputs, organisieren Sie Assets und erstellen Sie öffentliche URLs über eine einzige Schnittstelle, statt Storage in jedem Workflow neu zu integrieren.",
    openGraphTitle: "Drive für KI-Agenten – Gemeinsamer Speicher, Dateiorganisation und öffentliche URLs",
    openGraphDescription:
      "Erweitern Sie Workflows von KI-Agenten mit AnyCap Drive um gemeinsamen Speicher und Dateiauslieferung.",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/drive" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/drive",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

type PageContent = {
  breadcrumb: { name: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  usageHeading: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesHeading: string;
  useCases: readonly string[];
  relatedHeading: string;
  relatedPages: readonly { href: string; eyebrow: string; title: string; body: string }[];
  faqHeading: string;
  faqItems: readonly { question: string; answer: string }[];
  jsonLdHeadline: string;
  jsonLdDescription: string;
  jsonLdAbout: readonly string[];
  jsonLdKeywords: readonly string[];
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Capabilities",
    title: "Drive",
    intro:
      "AnyCap Drive gives agents a shared place to store outputs, organize assets, and hand off public URLs. Instead of treating storage as a separate product that each workflow has to rewire, drive makes persistence part of the same capability layer as generation, analysis, and retrieval.",
    usageHeading: "CLI usage",
    usageExamples: [
      { title: "Upload an output file", code: "anycap drive upload launch.mp4" },
      { title: "Share a stored asset", code: "anycap drive share dn_xKmP123" },
      { title: "List files in drive", code: "anycap drive list" },
    ],
    useCasesHeading: "When agents need drive",
    useCases: [
      "Keep generated images, videos, audio, and docs in one shared agent-accessible place.",
      "Create public URLs for outputs without bolting on a separate storage product per workflow.",
      "Organize reusable assets so different agents and sessions can work from the same file set.",
      "Make delivery part of the same runtime as generation, analysis, and retrieval.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Related capability",
        title: "Video Generation",
        body: "Generated videos become more useful when the workflow can persist and share them.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Related capability",
        title: "Image Generation",
        body: "Save generated visuals and reference images into a reusable asset library.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See how drive storage fits alongside the rest of the AnyCap product stack.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Why include drive as an agent capability?",
        answer:
          "Because generation is only half the workflow. Agents also need a place to store outputs, retrieve them later, and hand off links to users or downstream systems without rebuilding storage on every project.",
      },
      {
        question: "What does AnyCap Drive give teams?",
        answer:
          "It gives teams a shared storage layer for generated outputs and reference assets, plus public links when files need to leave the agent runtime and reach people or other systems.",
      },
      {
        question: "How is drive different from generation or search?",
        answer:
          "Generation creates assets, search finds information, and drive keeps artifacts available after the action completes. It is the storage and delivery layer that lets agent workflows persist useful outputs.",
      },
      {
        question: "When should teams use drive?",
        answer:
          "Use drive when an agent needs to save artifacts, organize inputs and outputs, or return stable file links instead of ephemeral local files.",
      },
    ],
    jsonLdHeadline: "Drive for AI agents - Shared storage, file organization, and public URLs",
    jsonLdDescription:
      "Capability guide for adding shared storage to AI agents through AnyCap Drive, including file organization and public delivery workflows.",
    jsonLdAbout: ["Drive for AI agents", "Agent storage", "File sharing", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive for ai agents",
      "agent storage",
      "file storage for ai agents",
      "public urls for agent outputs",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Capacidades",
    title: "Drive",
    intro:
      "O AnyCap Drive da aos agentes um lugar compartilhado para armazenar resultados, organizar ativos e entregar URLs publicas. Em vez de tratar armazenamento como um produto separado que cada fluxo precisa reintegrar, o Drive transforma persistencia em parte da mesma camada de capabilities usada para geracao, analise e recuperacao.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      { title: "Envie um arquivo de saida", code: "anycap drive upload launch.mp4" },
      { title: "Compartilhe um ativo armazenado", code: "anycap drive share dn_xKmP123" },
      { title: "Liste os arquivos no drive", code: "anycap drive list" },
    ],
    useCasesHeading: "Quando agentes precisam de drive",
    useCases: [
      "Mantenha imagens, videos, audios e documentos gerados em um unico lugar acessivel para agentes.",
      "Crie URLs publicas para resultados sem acoplar um produto de armazenamento separado em cada fluxo.",
      "Organize ativos reutilizaveis para que agentes e sessoes diferentes trabalhem a partir do mesmo conjunto de arquivos.",
      "Torne a entrega parte do mesmo runtime usado para geracao, analise e recuperacao.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Capability relacionada",
        title: "Geracao de video",
        body: "Videos gerados ficam mais uteis quando o fluxo consegue persisti-los e compartilha-los.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Capability relacionada",
        title: "Geracao de imagem",
        body: "Salve visuais gerados e imagens de referencia em uma biblioteca de ativos reutilizavel.",
      },
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Veja como o armazenamento no Drive se encaixa no restante da stack de produto do AnyCap.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Por que incluir drive como uma capability para agentes?",
        answer:
          "Porque geracao e apenas metade do fluxo. Os agentes tambem precisam de um lugar para guardar resultados, recupera-los depois e entregar links para usuarios ou sistemas downstream sem reconstruir o armazenamento em cada projeto.",
      },
      {
        question: "O que o AnyCap Drive entrega para equipes?",
        answer:
          "Ele entrega uma camada compartilhada de armazenamento para resultados gerados e ativos de referencia, alem de links publicos quando os arquivos precisam sair do runtime do agente e chegar a pessoas ou outros sistemas.",
      },
      {
        question: "Como drive difere de geracao ou busca?",
        answer:
          "Geracao cria ativos, busca encontra informacao, e drive mantem os artefatos disponiveis depois que a acao termina. Ele e a camada de armazenamento e entrega que permite aos fluxos de agentes persistirem resultados uteis.",
      },
      {
        question: "Quando as equipes devem usar drive?",
        answer:
          "Use drive quando um agente precisar salvar artefatos, organizar entradas e saidas, ou devolver links estaveis de arquivo em vez de arquivos locais efemeros.",
      },
    ],
    jsonLdHeadline: "Drive para agentes de IA - armazenamento compartilhado, organizacao de arquivos e URLs publicas",
    jsonLdDescription:
      "Guia de capability para adicionar armazenamento compartilhado a agentes de IA por meio do AnyCap Drive, incluindo organizacao de arquivos e fluxos de entrega publica.",
    jsonLdAbout: ["Drive para agentes de IA", "Armazenamento para agentes", "Compartilhamento de arquivos", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive para agentes de ia",
      "armazenamento para agentes",
      "armazenamento de arquivos para agentes de ia",
      "urls publicas para resultados de agentes",
    ],
  },
  id: {
    breadcrumb: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Kapabilitas",
    title: "Drive",
    intro:
      "AnyCap Drive memberi agen ruang bersama untuk menyimpan output, menata aset, dan membagikan URL publik. Daripada memperlakukan storage sebagai produk terpisah yang harus diintegrasikan ulang di setiap workflow, Drive menjadikan persistensi bagian dari lapisan kapabilitas yang sama dengan generation, analysis, dan retrieval.",
    usageHeading: "Penggunaan CLI",
    usageExamples: [
      { title: "Unggah file hasil", code: "anycap drive upload launch.mp4" },
      { title: "Bagikan aset tersimpan", code: "anycap drive share dn_xKmP123" },
      { title: "Lihat daftar file di drive", code: "anycap drive list" },
    ],
    useCasesHeading: "Kapan agen membutuhkan drive",
    useCases: [
      "Simpan gambar, video, audio, dan dokumen hasil generasi dalam satu lokasi yang bisa diakses agen.",
      "Buat URL publik untuk hasil kerja tanpa menempelkan produk storage terpisah ke setiap workflow.",
      "Atur aset yang bisa dipakai ulang agar sesi dan agen berbeda tetap bekerja dari kumpulan file yang sama.",
      "Jadikan delivery bagian dari runtime yang sama dengan generation, analysis, dan retrieval.",
    ],
    relatedHeading: "Halaman terkait",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Kapabilitas terkait",
        title: "Generasi Video",
        body: "Video hasil generasi lebih berguna saat workflow bisa menyimpan dan membagikannya.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Kapabilitas terkait",
        title: "Generasi Gambar",
        body: "Simpan visual hasil generasi dan gambar referensi sebagai pustaka aset yang bisa dipakai ulang.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "Lihat bagaimana penyimpanan Drive terhubung dengan stack produk AnyCap lainnya.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Kenapa drive penting sebagai kapabilitas agen?",
        answer:
          "Karena generation hanya separuh alur kerja. Agen juga butuh tempat menyimpan output, mengambilnya lagi nanti, dan membagikan link ke pengguna atau sistem lanjutan tanpa membangun storage ulang di tiap proyek.",
      },
      {
        question: "Apa yang didapat tim dari AnyCap Drive?",
        answer:
          "Tim mendapat lapisan penyimpanan bersama untuk output generasi dan aset referensi, plus link publik saat file perlu keluar dari runtime agen ke pengguna atau sistem lain.",
      },
      {
        question: "Apa bedanya drive dengan generation atau search?",
        answer:
          "Generation membuat aset, search mencari informasi, sedangkan drive menjaga artefak tetap tersedia setelah aksi selesai. Drive adalah lapisan storage dan delivery yang membuat output agen bisa dipertahankan.",
      },
      {
        question: "Kapan tim sebaiknya memakai drive?",
        answer:
          "Gunakan drive saat agen perlu menyimpan artefak, mengatur input-output, atau mengembalikan link file yang stabil alih-alih file lokal yang sementara.",
      },
    ],
    jsonLdHeadline: "Drive untuk agen AI - penyimpanan bersama, organisasi file, dan URL publik",
    jsonLdDescription:
      "Panduan kapabilitas untuk menambahkan penyimpanan bersama ke agen AI melalui AnyCap Drive, termasuk organisasi file dan workflow distribusi publik.",
    jsonLdAbout: ["Drive untuk agen AI", "Penyimpanan agen", "Berbagi file", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive untuk agen ai",
      "penyimpanan agen",
      "penyimpanan file untuk agen ai",
      "url publik untuk output agen",
    ],
  },
  de: {
    breadcrumb: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Capabilities",
    title: "Drive",
    intro:
      "AnyCap Drive gibt Agenten einen gemeinsamen Ort, um Outputs zu speichern, Assets zu organisieren und öffentliche URLs zu übergeben. Statt Speicher als separates Produkt zu behandeln, das jeder Workflow neu verdrahten muss, macht Drive Persistenz zu einem Teil derselben Capability-Schicht wie Generierung, Analyse und Retrieval.",
    usageHeading: "CLI-Nutzung",
    usageExamples: [
      { title: "Eine Output-Datei hochladen", code: "anycap drive upload launch.mp4" },
      { title: "Ein gespeichertes Asset teilen", code: "anycap drive share dn_xKmP123" },
      { title: "Dateien im Drive auflisten", code: "anycap drive list" },
    ],
    useCasesHeading: "Wann Agenten Drive benötigen",
    useCases: [
      "Generierte Bilder, Videos, Audios und Dokumente an einem gemeinsam zugänglichen Ort für Agenten aufbewahren.",
      "Öffentliche URLs für Outputs erstellen, ohne pro Workflow ein separates Storage-Produkt anzubinden.",
      "Wiederverwendbare Assets organisieren, damit verschiedene Agenten und Sessions mit demselben Datenbestand arbeiten können.",
      "Auslieferung zum Bestandteil derselben Runtime machen wie Generierung, Analyse und Retrieval.",
    ],
    relatedHeading: "Verwandte Seiten",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Verwandte Capability",
        title: "Videogenerierung",
        body: "Generierte Videos sind nützlicher, wenn der Workflow sie persistieren und teilen kann.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Verwandte Capability",
        title: "Bildgenerierung",
        body: "Speichern Sie generierte Visuals und Referenzbilder in einer wiederverwendbaren Asset-Bibliothek.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Preise",
        body: "So fügt sich Drive-Speicher in den restlichen AnyCap-Produkt-Stack ein.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Warum Drive als Agenten-Capability einbeziehen?",
        answer:
          "Weil Generierung nur die halbe Miete ist. Agenten benötigen ebenso einen Ort, um Outputs zu speichern, später wieder abzurufen und Links an Nutzer oder nachgelagerte Systeme zu übergeben, ohne in jedem Projekt Speicher neu aufzubauen.",
      },
      {
        question: "Was bietet AnyCap Drive Teams?",
        answer:
          "Eine gemeinsame Speicherschicht für generierte Outputs und Referenz-Assets sowie öffentliche Links, wenn Dateien die Agenten-Runtime verlassen und Menschen oder andere Systeme erreichen müssen.",
      },
      {
        question: "Wie unterscheidet sich Drive von Generierung oder Suche?",
        answer:
          "Generierung erstellt Assets, Suche findet Informationen, und Drive hält Artefakte verfügbar, nachdem die Aktion abgeschlossen ist. Drive ist die Speicher- und Auslieferungsschicht, die Agenten-Workflows nützliche Outputs persistieren lässt.",
      },
      {
        question: "Wann sollten Teams Drive verwenden?",
        answer:
          "Verwenden Sie Drive, wenn ein Agent Artefakte speichern, Inputs und Outputs organisieren oder stabile Datei-Links zurückgeben soll, statt flüchtiger lokaler Dateien.",
      },
    ],
    jsonLdHeadline: "Drive für KI-Agenten – Gemeinsamer Speicher, Dateiorganisation und öffentliche URLs",
    jsonLdDescription:
      "Capability-Leitfaden zum Hinzufügen von gemeinsamem Speicher zu KI-Agenten über AnyCap Drive, inklusive Dateiorganisation und öffentlicher Auslieferungs-Workflows.",
    jsonLdAbout: ["Drive für KI-Agenten", "Agenten-Speicher", "Datei-Sharing", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive for ai agents",
      "agent storage",
      "file storage for ai agents",
      "public urls for agent outputs",
    ],
  },
} as const;

export default async function DriveCapabilityPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/drive",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
    datePublished: PAGE_LAST_MODIFIED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  });
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
  const useCases = content.useCases.map((useCase, index) => {
    const [title, ...rest] = useCase.split(".");
    return {
      title: title.length > 70 ? `Use case ${index + 1}` : title,
      description: rest.join(".").trim() || useCase,
    };
  });

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumb}
      jsonLd={capabilityGuideJsonLd}
      faqJsonLd={faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel="Last updated April 13, 2026"
      title={content.title}
      accentTitle="for AI agents"
      intro={content.intro}
      searchIntents={content.jsonLdKeywords}
      actions={[
        { label: "Equip your Agent", href: "/start", primary: true },
        { label: "Video Generation", href: "/capabilities/video-generation" },
        { label: "Image Generation", href: "/capabilities/image-generation" },
      ]}
      demo={<DriveDemo />}
      demoTitle="Keep the artifact"
      demoBody="Generated files become stable assets the agent can organize, share, and reuse."
      proofPoints={[
        "Generated images, videos, audio, and docs can persist beyond one terminal session.",
        "Public URLs let agent outputs move to people, pages, or downstream systems.",
        "Drive connects creation, analysis, retrieval, and delivery into one AnyCap workflow.",
      ]}
      summaryLabel="The short answer"
      summaryText="Use AnyCap Drive when an agent needs stable storage, reusable assets, and public delivery links after generation or analysis completes."
      workflowTitle="How Drive fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Store",
          body: "The agent uploads a generated output or reference asset into the shared AnyCap Drive layer.",
        },
        {
          title: "Organize",
          body: "Files can be listed and reused across sessions instead of living as temporary local artifacts.",
        },
        {
          title: "Deliver",
          body: "The agent can return a public URL or hand the asset to the next generation, analysis, or publishing step.",
        },
      ]}
      usageTitle={content.usageHeading}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesHeading}
      useCases={useCases}
      relatedTitle={content.relatedHeading}
      relatedCards={content.relatedPages}
      faqTitle={content.faqHeading}
      faqItems={content.faqItems}
      finalTitle="Let your agent keep the output."
      finalBody="Use AnyCap Drive when the workflow should not end at generation. Store the artifact, return the link, and keep the asset available for the next agent step."
    />
  );
}
