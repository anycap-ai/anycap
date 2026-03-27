import ForClaudeCodePage, {

  metadata as baseMetadata,
} from "@/app/(seo)/for/claude-code/page";
import { generateLocalizedPageMetadata, type LocalePageParams } from "@/lib/localized-page";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  return generateLocalizedPageMetadata(params, "for-claude-code", baseMetadata);
}

export default function LocalizedForClaudeCodePage() {
  return <ForClaudeCodePage />;
}
