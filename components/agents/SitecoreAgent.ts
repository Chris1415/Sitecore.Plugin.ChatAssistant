import { ToolLoopAgent, type LanguageModel } from "ai";
import { getLanguagesTool, getSitesTool } from "./tools/Sites";
import { getPageHtmlTool, getPageScreenshot, translatePageTool } from "./tools/Pages";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { searchForAssetsTool, getAssetDetailsTool } from "./tools/Assets";

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
function createSitecoreTools(contextId: string, accessToken: string) {
  return {
    // Tool to get all available languages
    getLanguages: getLanguagesTool(accessToken, contextId),
    // Tool to get all available sites
    getSites: getSitesTool(accessToken, contextId),
    translatePage: translatePageTool(accessToken),
    getContentAnalyticsData: getPageAnalyticsDataTool(),
    searchForAssets: searchForAssetsTool(accessToken, contextId),
    getAssetDetails: getAssetDetailsTool(accessToken, contextId),
    getPageScreenshot: getPageScreenshot(accessToken, contextId),
    getPageHtml: getPageHtmlTool(accessToken, contextId),
  };
}

// Create the Sitecore Agent using ToolLoopAgent
export function createSitecoreAgent(
  model: LanguageModel,
  contextId: string,
  accessToken: string,
  pageContext: PagesContext
) {
  const tools = createSitecoreTools(contextId, accessToken);
  const contextMessage = createContextMessage(pageContext, true);

  return new ToolLoopAgent({
    id: "sitecore-assistant",
    model,
    tools,
    instructions: DEFAULT_SYSTEM_PROMPT,
    prepareCall: ({ ...settings }) => ({
      ...settings,
      instructions: settings.instructions + `\n ${contextMessage}`,
    }),
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createSitecoreTools };
