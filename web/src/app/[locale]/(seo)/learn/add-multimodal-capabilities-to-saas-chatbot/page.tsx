import AddMultimodalCapabilitiesToSaaSChatbotPage from "@/app/(seo)/learn/add-multimodal-capabilities-to-saas-chatbot/page";
import { getPageMetadata } from "@/app/(seo)/learn/add-multimodal-capabilities-to-saas-chatbot/metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  return locale ? getPageMetadata(locale) : {};
}

export default function LocalizedAddMultimodalCapabilitiesToSaaSChatbotPage() {
  return <AddMultimodalCapabilitiesToSaaSChatbotPage />;
}
