import { ToolLoopAgent, type LanguageModel } from "ai";
import { getLanguagesTool, getSitesTool } from "./tools/Sites";

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
  };
}

// Create the Sitecore Agent using ToolLoopAgent
export function createSitecoreAgent(
  model: LanguageModel,
  contextId: string,
  accessToken: string
) {
  const tools = createSitecoreTools(contextId, accessToken);

  return new ToolLoopAgent({
    id: "sitecore-assistant",
    model,
    instructions: DEFAULT_SYSTEM_PROMPT,
    tools,
    onStepFinish: async (stepResult) => {
      console.log("[SitecoreAgent] Step finished:", {
        finishReason: stepResult.finishReason,
        toolCalls: stepResult.toolCalls?.length || 0,
        toolResults: JSON.stringify(stepResult.toolResults, null, 2),
      });
    },
    onFinish: async (event) => {
      console.log("[SitecoreAgent] Finished:", {
        steps: event.steps.length,
        totalUsage: event.totalUsage,
      });
    },
  });
}

export { createSitecoreTools };
