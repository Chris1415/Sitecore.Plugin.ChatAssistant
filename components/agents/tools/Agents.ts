import { tool } from "ai";
import { z } from "zod";
import { AgentType, AGENT_CONFIGS } from "@/lib/agent-configs";

// Schema for agent information
const AgentInfoSchema = z.object({
  key: z.string().describe("The agent type key (e.g., 'sitecore', 'products', 'news', 'events')"),
  name: z.string().describe("The display name of the agent"),
  description: z.string().describe("A short description of what this agent specializes in"),
});

const ListAgentsResponseSchema = z.object({
  agents: z.array(AgentInfoSchema).describe("List of available agents"),
});

// Tool to list all available agents (excluding Allmighty)
export const listAvailableAgentsTool = tool({
  description:
    "Get a list of all available specialized agents in the system. Returns agent keys, names, and descriptions. Use this to understand which agent is best suited for a user's query. The Allmighty agent is excluded from this list as it is a general-purpose agent.",
  inputSchema: z.object({}),
  outputSchema: ListAgentsResponseSchema,
  execute: async () => {
    // Filter out Allmighty agent and map to the required format
    const availableAgents = AGENT_CONFIGS.filter(
      (config) => config.id !== AgentType.Allmighty
    ).map((config) => ({
      key: config.id,
      name: config.name,
      description: config.subheadline || config.headline,
    }));

    return {
      agents: availableAgents,
    };
  },
});

