import { ToolLoopAgent, tool, type LanguageModel } from "ai";
import { z } from "zod";

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

// Define schemas for tool inputs
const getPageInfoSchema = z.object({
  pageId: z.string().describe("The ID of the page to get info for"),
});

const searchContentSchema = z.object({
  query: z.string().describe("The search query"),
  language: z.string().optional().describe("Language to search in"),
});

const getSiteStructureSchema = z.object({
  rootPath: z.string().optional().describe("Root path to start from"),
  depth: z.number().optional().describe("How deep to traverse"),
});

// Define available tools for the agent
const sitecoreTools = {
  // Tool to get page information
  getPageInfo: tool({
    description: "Get information about the current page in Sitecore",
    inputSchema: getPageInfoSchema,
    execute: async (input: z.infer<typeof getPageInfoSchema>) => {
      // This would be replaced with actual Sitecore API calls
      return {
        pageId: input.pageId,
        status: "Tool executed - implement actual Sitecore integration",
      };
    },
  }),

  // Tool to search content
  searchContent: tool({
    description: "Search for content across the Sitecore site",
    inputSchema: searchContentSchema,
    execute: async (input: z.infer<typeof searchContentSchema>) => {
      // This would be replaced with actual Sitecore search
      return {
        query: input.query,
        language: input.language || "en",
        results: [],
        status: "Tool executed - implement actual Sitecore search",
      };
    },
  }),

  // Tool to get site structure
  getSiteStructure: tool({
    description: "Get the structure of the current Sitecore site",
    inputSchema: getSiteStructureSchema,
    execute: async (input: z.infer<typeof getSiteStructureSchema>) => {
      return {
        rootPath: input.rootPath || "/sitecore/content",
        depth: input.depth || 2,
        status: "Tool executed - implement actual Sitecore structure retrieval",
      };
    },
  }),
};

// Create the Sitecore Agent using ToolLoopAgent
export function createSitecoreAgent(model: LanguageModel) {
  return new ToolLoopAgent({
    id: "sitecore-assistant",
    model,
    instructions: DEFAULT_SYSTEM_PROMPT,
    tools: sitecoreTools,
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

// Export tools for external use
export { sitecoreTools };
