import { ToolLoopAgent, type LanguageModel } from "ai";
import { createContextMessage } from "@/lib/context-messages";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { getPageAnalyticsDataTool } from "./tools/Dummy";
import { createAllBrandManagementApiBrandTools } from "./tools/brandmanagement_api/Brand";
import { createAllNewsTools } from "./tools/News";
import { createAllPagesApiTools } from "./tools/pages_api/Pages";
import { createAllPagesContextTools } from "./tools/pages_context/PagesContext";
import { createAllSitesApiTools } from "./tools/sites_api/Sites";
import { createAllPersonsTools } from "./tools/Persons";
import { createAllSitecoreConstantsTools } from "./tools/Sitcore_Constants";
import { createAllGraphqlApiPreviewTools } from "./tools/graphql_api/Preview";

// System prompt for News Assistant
export const NEWS_SYSTEM_PROMPT = `You are News Assistant, an AI helper for editors and marketers managing news and editorial content in Sitecore XM Cloud.
Your goal is to support efficient editorial workflows and high-quality publishing.

Be concise, actionable, and focused on publishing status, content quality, SEO, and performance.

Visualize data clearly using tables, lists, and structured formats to make information easy to understand and scan.

When displaying structured data (e.g., JSON from PagesContext or other sources), convert it to a readable key-value format with clear sections, proper formatting, and easy-to-scan layout. Never output raw JSON unless specifically requested.

Support article workflows: creation, analysis, discovery, navigation, and optimization.

When creating articles, always use the News Root Page as parent and follow the News Template with required fields (title, subtitle, content, excerpt).

## CRITICAL: Pages Context Information Priority

**ALWAYS use Pages Context Information FIRST** when answering questions about the current article/page. The Pages Context contains the most up-to-date and accurate information about:
- Current page details (itemId, path, template, language, version)
- Site information (site ID, name, language)
- Page metadata and properties

**ONLY use tools** if:
1. The requested information is NOT available in Pages Context
2. You need to perform an action (create, update, translate, etc.)
3. You need additional data beyond what Pages Context provides

**Workflow for answering questions:**
1. First, check Pages Context Information - extract and use relevant data from there
2. If Pages Context doesn't contain the needed information, then use appropriate tools
3. Never use tools to fetch information that's already available in Pages Context

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
  sections?: Array<{ sectionId: string }> | null,
  organizationId?: string
) {
  return {
    ...createAllNewsTools(accessToken, contextId),
    ...createAllPersonsTools(accessToken, contextId),
    ...createAllSitecoreConstantsTools(),   
    ...createAllPagesApiTools(accessToken, contextId),
    ...createAllSitesApiTools(contextId),  
    ...createAllBrandManagementApiBrandTools(accessToken, contextId, brandKitId, sections, organizationId),
    ...createAllPagesContextTools(accessToken, contextId), 
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
  sections?: Array<{ sectionId: string }> | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcpTools?: Record<string, any>,
  organizationId?: string
) {
  const baseTools = createNewsTools(contextId, accessToken, brandKitId, sections, organizationId);
  // Merge MCP tools with base tools (MCP tools take precedence on conflicts)
  const tools = {
    ...baseTools,
    ...(mcpTools || {}),
  };
  const contextMessage = createContextMessage(pageContext);

  return new ToolLoopAgent({
    id: "news-assistant",
    model,
    instructions: NEWS_SYSTEM_PROMPT,
    tools,
    prepareCall: ({ ...settings }) => ({
      ...settings,
      instructions: settings.instructions + `\n ${contextMessage}`,
      experimental_reasoning: true,
    }),
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createNewsTools };
