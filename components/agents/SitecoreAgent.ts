import { ToolLoopAgent, type LanguageModel } from "ai";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { createAllAssetTools } from "./tools/agents_api/Assets";
import { createAllBrandTools } from "./tools/brandmanagement_api/Brand";
import { createAllPageTools } from "./tools/agents_api/Pages";
import { createAllSiteTools } from "./tools/agents_api/Sites";
import { createAllPagesApiTools } from "./tools/pages_api/Pages";
import { createAllContentTools } from "./tools/agents_api/Content";
import { createAllPagesContextTools } from "./tools/pages_context/PagesContext";
import { createAllComponentTools } from "./tools/agents_api/Components";

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
    ...createAllSiteTools(accessToken, contextId),
    ...createAllPagesApiTools(),
    ...createAllAssetTools(accessToken, contextId),
    ...createAllPageTools(accessToken, contextId),
    ...createAllBrandTools(brandKitId, sections),
    ...createAllContentTools(accessToken, contextId),
    ...createAllPagesContextTools(accessToken, contextId),
    ...createAllComponentTools(accessToken, contextId),
    getContentAnalyticsData: getPageAnalyticsDataTool(),
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

  return new ToolLoopAgent({
    id: "sitecore-assistant",
    model,
    tools,
    instructions: DEFAULT_SYSTEM_PROMPT,
    prepareCall: ({ ...settings }) => ({
      ...settings,
      instructions:
        settings.instructions + `\n ${contextMessage}`,
    }),
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createSitecoreTools };
