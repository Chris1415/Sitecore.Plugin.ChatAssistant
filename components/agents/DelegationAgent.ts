import { ToolLoopAgent, type LanguageModel } from "ai";
import { listAvailableAgentsTool } from "./tools/Agents";

// The Delegation Agent - Routes queries to the most appropriate specialized agent
export const DELEGATION_SYSTEM_PROMPT = `You are **The Delegation Assistant** — an intelligent routing agent that analyzes user queries and returns the AgentType key of the most appropriate specialized agent.

## Your Task

1. Call \`listAvailableAgents\` to see all available specialized agents
2. Analyze the user's query to determine which agent is best suited
3. Return ONLY the agent's key (AgentType) - nothing else

## Available Agent Keys

The agent keys you can return are:
- "sitecore" - for general content management and Sitecore questions
- "products" - for product catalog, commerce, and inventory questions
- "news" - for news articles and editorial content
- "events" - for event management and calendar questions

## Response Format

Your response must be ONLY the agent type key, for example:
- "sitecore"
- "products"
- "news"
- "events"

Do NOT include:
- Explanations
- Descriptions
- Additional text
- Agent names
- Any other content

## Important Rules

- Return ONLY the key string (e.g., "sitecore")
- Do NOT use "all" (Allmighty agent) - it is excluded from the list
- If unsure, default to "sitecore" as it is the most general-purpose agent
- Your entire response should be just the key, nothing more`;

// Create the Delegation Agent using ToolLoopAgent
export function createDelegationAgent(
  model: LanguageModel
) {
  const baseTools = {
    listAvailableAgents: listAvailableAgentsTool,
  };
  // Merge MCP tools with base tools (MCP tools take precedence on conflicts)
  const tools = {
    ...baseTools
  };

  return new ToolLoopAgent({
    id: "delegation-assistant",
    model,
    instructions: DELEGATION_SYSTEM_PROMPT,
    tools,
    onStepFinish: async (stepResult) => {
      console.log("[DelegationAgent] Step finished:", {
        finishReason: stepResult.finishReason,
        toolCalls: stepResult.toolCalls?.length || 0,
        toolResults: JSON.stringify(stepResult.toolResults, null, 2),
      });
    },
    onFinish: async (event) => {
      console.log("[DelegationAgent] Finished:", {
        steps: event.steps.length,
        totalUsage: event.totalUsage,
      });
    },
  });
}
