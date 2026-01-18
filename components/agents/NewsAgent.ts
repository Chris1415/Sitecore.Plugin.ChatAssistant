import { ToolLoopAgent, type LanguageModel } from "ai";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createAllBrandTools } from "./tools/brandmanagement_api/Brand";
import { createAllPageTools } from "./tools/agents_api/Pages";
import { createAllSiteTools } from "./tools/agents_api/Sites";
import { createAllNewsTools } from "./tools/News";
import { createAllAssetTools } from "./tools/agents_api/Assets";
import { createAllPagesApiTools } from "./tools/pages_api/Pages";
import { createAllContentTools } from "./tools/agents_api/Content";
import { createAllPagesContextTools } from "./tools/pages_context/PagesContext";
import { createAllComponentTools } from "./tools/agents_api/Components";

// System prompt for News Assistant
export const NEWS_SYSTEM_PROMPT = `You are News Assistant, a specialized AI-powered helper for content editors and marketers managing news content in Sitecore.

Your expertise includes:
- Creating and managing news articles and pages
- Understanding news content structure (titles, subtitles, excerpts, content)
- Providing guidance on news publishing workflows
- Suggesting improvements for news article structure and SEO
- Helping with news content organization and categorization
- Assisting with multi-language news content

When responding to page context updates:
- Acknowledge the context change concisely
- Highlight what changed using the format: **Field:** {OLD} → {NEW}
- Offer relevant suggestions based on the current news page

When creating news pages:
- Use the News Root Page as the parent
- Use the News Template for consistency
- Ensure all required fields (title, content, subtitle, excerpt) are provided
- Consider SEO best practices for news content

Always be helpful, concise, and focused on news content management needs.`;

// Create tools factory that accepts context and access token
function createNewsTools(
  contextId: string,
  accessToken: string,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  return {
    ...createAllSiteTools(accessToken, contextId),
    ...createAllNewsTools(accessToken, contextId),
    ...createAllContentTools(accessToken, contextId),
    ...createAllPagesApiTools(),
    ...createAllAssetTools(accessToken, contextId),
    ...createAllPageTools(accessToken, contextId),
    ...createAllBrandTools(brandKitId, sections),
    ...createAllPagesContextTools(accessToken, contextId),
    ...createAllComponentTools(accessToken, contextId),
    getContentAnalyticsData: getPageAnalyticsDataTool(),
  };
}

// Create the News Agent using ToolLoopAgent
export function createNewsAgent(
  model: LanguageModel,
  contextId: string,
  accessToken: string,
  pageContext: PagesContext,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  const tools = createNewsTools(contextId, accessToken, brandKitId, sections);
  const contextMessage = createContextMessage(pageContext, true);

  return new ToolLoopAgent({
    id: "news-assistant",
    model,
    instructions: NEWS_SYSTEM_PROMPT,
    tools,
    prepareCall: ({ ...settings }) => ({
      ...settings,
      instructions: settings.instructions + `\n ${contextMessage}`,
    }),
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createNewsTools };
