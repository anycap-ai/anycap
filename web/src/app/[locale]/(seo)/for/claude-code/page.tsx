import ForClaudeCodePage from "@/app/(seo)/for/claude-code/page";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getValidatedLocale, type LocalePageParams } from "@/lib/localized-page";
import { FOR_CLAUDE_CODE_PATH, getForClaudeCodeMetadata } from "./content";

export const runtime = "edge";

export async function generateMetadata({ params }: LocalePageParams) {
  const locale = await getValidatedLocale(params);
  if (!locale) {
    return {};
  }

  return createLocalizedMetadataForPath(
    locale,
    FOR_CLAUDE_CODE_PATH,
    getForClaudeCodeMetadata(locale),
  );
}

export default function LocalizedForClaudeCodePage() {
  return <ForClaudeCodePage />;
}
