import AddMultimodalCapabilitiesToSaaSChatbotPage, {
  metadata as baseMetadata,
} from "@/app/(seo)/learn/add-multimodal-capabilities-to-saas-chatbot/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(
    params,
    "learn-add-multimodal-capabilities-to-saas-chatbot",
    baseMetadata
  );
}

export default function LocalizedAddMultimodalCapabilitiesToSaaSChatbotPage() {
  return <AddMultimodalCapabilitiesToSaaSChatbotPage />;
}
