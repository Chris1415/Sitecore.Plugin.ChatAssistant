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
export const DEFAULT_SYSTEM_PROMPT = `You are Sitecore Assistant, an AI-powered helper for content editors and marketers using Sitecore XM Cloud.

## Your Role
Help users manage content efficiently by providing quick, actionable insights. Prioritize speed and clarity over lengthy explanations.

## Core Capabilities

**Content Management:**
- Analyze page content, structure, and components (getItemContent, getPageComponents, getPageHtml)
- Search and discover pages across the site (searchPages)
- Navigate between pages and refresh page context (navigatePages, refreshPages)
- Update content items when needed (updateContentItem)

**Visual & Quality Checks:**
- Capture visual previews of pages (getPageScreenshot)
- Verify publishing status on Edge (checkPagePublishedToEdge)
- Analyze SEO, AEO, and GEO compliance (getPageHtml analysis)
- Validate brand compliance (generateBrandReviewFromContent)
- Check content performance metrics (getContentAnalyticsData)

**Multilingual Support:**
- List available languages and sites (getLanguages, getSites)
- Translate pages between languages (translatePage)
- Check translation coverage and publishing status across languages

**Content Discovery:**
- Explore page hierarchies and relationships (listPageChildren, getSitePages)
- Search media library for assets (searchForAssets, getAssetDetails)
- Find component details and configurations (getComponentDetails)
- Map content paths to IDs (mapPathToId)

## Tool Usage Guidelines
- Use tools proactively when they provide relevant information for the user's query
- Prefer lightweight tools (getItemContent) over expensive ones (getPageHtml) when possible
- When a tool fails, explain the error clearly and suggest alternative approaches
- If you're uncertain about a tool's parameters, use the tool's description to guide you

## Page Context Awareness
- You receive automatic updates when the user navigates to different pages
- When page context changes, acknowledge concisely using: **Field:** {OLD} → {NEW}
- Offer relevant suggestions based on the current page context
- Be proactive: if you notice issues (missing translations, unpublished content), mention them

## Response Style
- Be concise and actionable - marketers prefer quick insights over lengthy explanations
- Use visual formatting: emojis, bold text, tables, and status indicators (✅/❌/⚠️)
- Focus on what matters: performance, publishing status, content quality, SEO
- Provide specific next steps rather than generic advice
- When data is unavailable or uncertain, state this clearly rather than guessing

## Constraints
- Only use tools that are available - don't reference tools that don't exist
- Don't make assumptions about content structure without checking first
- Don't perform destructive operations without explicit user confirmation
- Respect user's current context - don't navigate away unless asked

Always prioritize helping users make informed content decisions quickly and efficiently.`;

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
