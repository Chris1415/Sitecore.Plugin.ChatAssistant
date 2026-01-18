import { ToolLoopAgent, type LanguageModel } from "ai";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createAllBrandManagementApiBrandTools } from "./tools/brandmanagement_api/Brand";
import { createAllAgentsApiPagesTools } from "./tools/agents_api/Pages";
import { createAllAgentsApiSitesTools } from "./tools/agents_api/Sites";
import { createAllNewsTools } from "./tools/News";
import { createAllAgentsApiAssetsTools } from "./tools/agents_api/Assets";
import { createAllPagesApiTools } from "./tools/pages_api/Pages";
import { createAllAgentsApiContentTools } from "./tools/agents_api/Content";
import { createAllPagesContextTools } from "./tools/pages_context/PagesContext";
import { createAllAgentsApiComponentsTools } from "./tools/agents_api/Components";
import { createAllGraphqlApiPreviewTools } from "./tools/graphql_api/Preview";
import { createAllSitesApiTools } from "./tools/sites_api/Sites";

// System prompt for News Assistant
export const NEWS_SYSTEM_PROMPT = `You are News Assistant, an AI helper for editors and marketers managing news and editorial content in Sitecore XM Cloud.
Your goal is to support efficient editorial workflows and high-quality publishing.

Be concise, actionable, and focused on publishing status, content quality, SEO, and performance.

Visualize data clearly using tables, lists, and structured formats to make information easy to understand and scan.

When displaying structured data (e.g., JSON from PagesContext or other sources), convert it to a readable key-value format with clear sections, proper formatting, and easy-to-scan layout. Never output raw JSON unless specifically requested.

Support article workflows: creation, analysis, discovery, navigation, and optimization.

When creating articles, always use the News Root Page as parent and follow the News Template with required fields (title, subtitle, content, excerpt).

Use tools proactively when helpful; prefer lightweight tools. Never assume—verify with tools.

Do not perform destructive actions without explicit confirmation.

Respect article context; do not navigate unless asked.

Surface relevant issues proactively (e.g., unpublished articles, missing translations).

Use clear formatting (bold, tables). Use emojis ONLY for classification and states: ✅ (pass/success/published), ❌ (fail/error/not published), ⚠️ (warning/attention needed).

If data is unavailable, state it clearly.

Only reference existing tools. Explain tool failures and suggest alternatives.`;

// Create tools factory that accepts context and access token
function createNewsTools(
  contextId: string,
  accessToken: string,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  return {
    ...createAllAgentsApiSitesTools(accessToken, contextId),
    ...createAllNewsTools(accessToken, contextId),
    ...createAllAgentsApiContentTools(accessToken, contextId),
    ...createAllPagesApiTools(accessToken, contextId),
    ...createAllSitesApiTools(),
    ...createAllAgentsApiAssetsTools(accessToken, contextId),
    ...createAllAgentsApiPagesTools(accessToken, contextId),
    ...createAllBrandManagementApiBrandTools(brandKitId, sections),
    ...createAllPagesContextTools(accessToken, contextId),
    ...createAllAgentsApiComponentsTools(accessToken, contextId),
    ...createAllGraphqlApiPreviewTools(accessToken, contextId),
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
  const contextMessage = createContextMessage(pageContext);

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
