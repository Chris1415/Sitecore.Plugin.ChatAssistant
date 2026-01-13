import { ToolLoopAgent, type LanguageModel } from "ai";
import { getLanguagesTool, getSitesTool } from "./tools/Sites";
import {
  getNewsRootPageTool,
  getNewsTemplateTool,
  createNewsPageTool,
  getNewsContentTool,
} from "./tools/News";

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
function createNewsTools(contextId: string, accessToken: string) {
  return {
    // Site tools
    getLanguages: getLanguagesTool(accessToken, contextId),
    getSites: getSitesTool(accessToken, contextId),
    // News-specific tools
    getNewsRootPage: getNewsRootPageTool(),
    getNewsTemplate: getNewsTemplateTool(),
    createNewsPage: createNewsPageTool(accessToken, contextId),
    getNewsContent: getNewsContentTool(accessToken, contextId),
  };
}

// Create the News Agent using ToolLoopAgent
export function createNewsAgent(
  model: LanguageModel,
  contextId: string,
  accessToken: string
) {
  const tools = createNewsTools(contextId, accessToken);

  return new ToolLoopAgent({
    id: "news-assistant",
    model,
    instructions: NEWS_SYSTEM_PROMPT,
    tools,
    onStepFinish: async () => {},
    onFinish: async () => {},
  });
}

export { createNewsTools };
