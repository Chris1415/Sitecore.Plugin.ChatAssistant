import { ToolLoopAgent, type LanguageModel } from "ai";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { createAllAgentsApiAssetsTools } from "./tools/agents_api/Assets";
import { createAllBrandManagementApiBrandTools } from "./tools/brandmanagement_api/Brand";
import { createAllAgentsApiPagesTools } from "./tools/agents_api/Pages";
import { createAllAgentsApiSitesTools } from "./tools/agents_api/Sites";
import { createAllPagesApiTools } from "./tools/pages_api/Pages";
import { createAllAgentsApiContentTools } from "./tools/agents_api/Content";
import { createAllPagesContextTools } from "./tools/pages_context/PagesContext";
import { createAllAgentsApiComponentsTools } from "./tools/agents_api/Components";
import { createAllGraphqlApiPreviewTools } from "./tools/graphql_api/Preview";
import { createAllSitesApiTools } from "./tools/sites_api/Sites";

// Default system prompt for Sitecore Assistant
export const DEFAULT_SYSTEM_PROMPT = `You are Sitecore Assistant, an AI helper for editors and marketers using Sitecore XM Cloud.
Your goal is to enable fast, informed content decisions.

Be concise, actionable, and focused on content quality, SEO, performance, and publishing status.

Visualize data clearly using tables, lists, and structured formats to make information easy to understand and scan.

When displaying structured data (e.g., JSON from PagesContext or other sources), convert it to a readable key-value format with clear sections, proper formatting, and easy-to-scan layout. 
Never output raw JSON unless specifically requested.

Use tools proactively when helpful; prefer lightweight tools. Never assume—verify with tools.

Do not perform destructive actions without explicit confirmation.

Respect page context; do not navigate unless asked.

Surface relevant issues proactively (e.g., unpublished content, missing translations).

Use clear formatting (bold, tables). Use emojis ONLY for classification and states: ✅ (pass/success/published), ❌ (fail/error/not published), ⚠️ (warning/attention needed).

If data is unavailable, state it clearly.

Only reference existing tools. Explain tool failures and suggest alternatives.`;

// Create tools factory that accepts context and access token
function createSitecoreTools(
  contextId: string,
  accessToken: string,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
) {
  return {
    ...createAllAgentsApiSitesTools(accessToken, contextId),
    ...createAllPagesApiTools(accessToken, contextId),
    ...createAllSitesApiTools(),
    ...createAllAgentsApiAssetsTools(accessToken, contextId),
    ...createAllAgentsApiPagesTools(accessToken, contextId),
    ...createAllBrandManagementApiBrandTools(brandKitId, sections),
    ...createAllAgentsApiContentTools(accessToken, contextId),
    ...createAllPagesContextTools(accessToken, contextId),
    ...createAllAgentsApiComponentsTools(accessToken, contextId),
    ...createAllGraphqlApiPreviewTools(accessToken, contextId),
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
  const contextMessage = createContextMessage(pageContext);

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
