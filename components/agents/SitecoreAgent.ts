import { ToolLoopAgent, type LanguageModel } from "ai";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createContextMessage } from "@/lib/context-messages";
import { createBrandKitContextMessage } from "@/lib/brand-kit-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import {
  searchForAssetsTool,
  getAssetDetailsTool,
} from "./tools/agents_api/Assets";
import {
  generateBrandReviewFromUrlTool,
  generateBrandReviewFromContentTool,
  listBrandKitsTool,
  retrieveBrandKitTool,
  listBrandKitSectionsTool,
  listBrandKitSubsectionsTool,
} from "./tools/brandmanagement_api/Brand";
import { getPageScreenshot, getPageHtmlTool } from "./tools/agents_api/Pages";
import { getLanguagesTool, getSitesTool } from "./tools/agents_api/Sites";
import { translatePageTool } from "./tools/pages_api/Pages";
import { getItemContentTool } from "./tools/agents_api/Content";

// Default system prompt for Sitecore Assistant
export const DEFAULT_SYSTEM_PROMPT = `You are Sitecore Assistant, an AI-powered helper for content editors and marketers using Sitecore.

Your capabilities include:
- Helping users understand and manage their content
- Providing insights about page structure and metadata
- Suggesting content improvements and best practices
- Answering questions about Sitecore features and workflows

When responding to page context updates:
- Acknowledge the context change concisely
- Highlight what changed using the format: **Field:** {OLD} → {NEW}
- Offer relevant suggestions based on the current page

Always be helpful, concise, and focused on the user's content management needs.`;

// Create tools factory that accepts context and access token
function createSitecoreTools(
  contextId: string,
  accessToken: string,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  return {
    // Tool to get all available languages
    getLanguages: getLanguagesTool(accessToken, contextId),
    // Tool to get all available sites
    getSites: getSitesTool(accessToken, contextId),
    translatePage: translatePageTool(),
    getContentAnalyticsData: getPageAnalyticsDataTool(),
    searchForAssets: searchForAssetsTool(accessToken, contextId),
    getAssetDetails: getAssetDetailsTool(accessToken, contextId),
    getPageScreenshot: getPageScreenshot(accessToken, contextId),
    getPageHtml: getPageHtmlTool(accessToken, contextId),
    generateBrandReviewFromUrl: generateBrandReviewFromUrlTool(brandKitId, sections),
    generateBrandReviewFromContent: generateBrandReviewFromContentTool(brandKitId, sections),
    listBrandKits: listBrandKitsTool(),
    retrieveBrandKit: retrieveBrandKitTool(),
    listBrandKitSections: listBrandKitSectionsTool(),
    listBrandKitSubsections: listBrandKitSubsectionsTool(),
    getContentItemContent: getItemContentTool(accessToken, contextId),
  };
}

// Create the Sitecore Agent using ToolLoopAgent
export function createSitecoreAgent(
  model: LanguageModel,
  contextId: string,
  accessToken: string,
  pageContext: PagesContext,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  const tools = createSitecoreTools(contextId, accessToken, brandKitId, sections);
  const contextMessage = createContextMessage(pageContext, true);
  const brandKitMessage = createBrandKitContextMessage(brandKitId, sections);

  return new ToolLoopAgent({
    id: "sitecore-assistant",
    model,
    tools,
    instructions: DEFAULT_SYSTEM_PROMPT,
    prepareCall: ({ ...settings }) => ({
      ...settings,
      instructions:
        settings.instructions + `\n ${contextMessage}${brandKitMessage}`,
    }),
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createSitecoreTools };
