import { siteConfig, type SiteLocale } from "@/lib/site";

const hostedPageLocaleBySiteLocale: Record<SiteLocale, string> = {
	en: "en-US",
	"pt-br": "pt-BR",
	id: "id-ID",
	de: "de-DE",
};

export type HostedPageHubLink = {
	label: string;
	href: string;
	description: string;
};

export function getHostedPageLocale(siteLocale: SiteLocale): string {
	return hostedPageLocaleBySiteLocale[siteLocale];
}

export function buildHostedPagePath(siteLocale: SiteLocale, suffix: string): string {
	const hostedLocale = getHostedPageLocale(siteLocale);
	const normalizedSuffix = suffix.startsWith("/") ? suffix : `/${suffix}`;
	return `/page/${hostedLocale}${normalizedSuffix}`;
}

export function getHostedPageUrl(siteLocale: SiteLocale, suffix: string): string {
	return `${siteConfig.url}${buildHostedPagePath(siteLocale, suffix)}`;
}

const hostedHubCopyByLocale: Record<
	SiteLocale,
	{
		ai: { label: string; description: string };
		blog: { label: string; description: string };
		news: { label: string; description: string };
	}
> = {
	en: {
		ai: {
			label: "AI guides",
			description: "Developer guides for models, orchestration, and agentic workflows.",
		},
		blog: {
			label: "Blog",
			description: "Implementation notes and workflow posts for agent builders.",
		},
		news: {
			label: "News",
			description: "Model releases, coding-agent updates, and platform news.",
		},
	},
	"pt-br": {
		ai: {
			label: "Guias de IA",
			description: "Guias para modelos, orquestração e fluxos agenticos.",
		},
		blog: {
			label: "Blog",
			description: "Notas de implementação e posts de workflow para builders de agentes.",
		},
		news: {
			label: "Notícias",
			description: "Lançamentos de modelos, atualizações de agentes e notícias de plataforma.",
		},
	},
	id: {
		ai: {
			label: "Panduan AI",
			description: "Panduan developer untuk model, orkestrasi, dan workflow agentic.",
		},
		blog: {
			label: "Blog",
			description: "Catatan implementasi dan posting workflow untuk pembuat agen.",
		},
		news: {
			label: "Berita",
			description: "Rilis model, pembaruan coding agent, dan berita platform.",
		},
	},
	de: {
		ai: {
			label: "KI-Leitfäden",
			description: "Entwicklerleitfäden zu Modellen, Orchestrierung und agentischen Workflows.",
		},
		blog: {
			label: "Blog",
			description: "Implementierungsnotizen und Workflow-Beiträge für Agent-Builder.",
		},
		news: {
			label: "News",
			description: "Modell-Releases, Coding-Agent-Updates und Plattform-News.",
		},
	},
};

export function getHostedPageHubLinks(siteLocale: SiteLocale): readonly HostedPageHubLink[] {
	const copy = hostedHubCopyByLocale[siteLocale] ?? hostedHubCopyByLocale.en;

	return [
		{
			label: copy.ai.label,
			href: buildHostedPagePath(siteLocale, "/ai"),
			description: copy.ai.description,
		},
		{
			label: copy.blog.label,
			href: buildHostedPagePath(siteLocale, "/blog"),
			description: copy.blog.description,
		},
		{
			label: copy.news.label,
			href: buildHostedPagePath(siteLocale, "/news"),
			description: copy.news.description,
		},
	];
}
