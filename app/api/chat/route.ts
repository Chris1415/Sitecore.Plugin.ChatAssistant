import {
  consumeStream,
  createAgentUIStreamResponse,
  type UIMessage,
  wrapLanguageModel,
  gateway,
  type LanguageModel,
  smoothStream,
} from "ai";
import { AgentType } from "@/lib/agent-configs";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { getAgent } from "@/components/agents/AgentsFactory";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { getMessagesToUse } from "@/lib/message-history-manager";

export const maxDuration = 30;

const DEFAULT_MODEL = "openai/gpt-5-mini";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Define the shape of additional context you might receive
interface RequestBody {
  messages: UIMessage[];
  model: string;
  agentType: AgentType;
  pageContext: PagesContext;
  contextId?: string;
  brandKitId?: string | null;
  sections?: Array<{ sectionId: string }> | null;
}

export async function POST(request: Request) {
  const {
    messages,
    model,
    agentType,
    contextId,
    pageContext,
    brandKitId,
    sections,
  }: RequestBody = await request.json();
  const accessToken = request.headers.get("authorization")?.split(" ")[1];

  // Only enable devtools in development mode
  const baseModel = gateway(model || DEFAULT_MODEL);
  const finalModel: LanguageModel = isDevelopment
    ? wrapLanguageModel({
        model: baseModel,
        middleware: devToolsMiddleware(),
      })
    : baseModel;

  if (!contextId || !accessToken) {
    return new Response(
      JSON.stringify({
        error: "Context ID and access token are required for Sitecore agent",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // If there's only one message, it's a new chat - clear server history and use just that message
  let messagesToUse: UIMessage[];
  let summarizationOccurred = false;
  
  if (messages.length === 1) {
    // New chat - clear server history and use only this message
    const { clearMessageHistory } = await import("@/lib/message-history-manager");
    clearMessageHistory(contextId);
    messagesToUse = messages;
  } else {
    // Existing chat - get messages to use (handles history management and summarization)
    const result = await getMessagesToUse(messages, contextId, finalModel);
    messagesToUse = result.messages;
    summarizationOccurred = result.summarizationOccurred;
  }

  const agent = await getAgent(
    agentType,
    finalModel,
    contextId,
    accessToken,
    pageContext,
    brandKitId,
    sections
  );

  // Use the agent to handle the request with UI message streaming
  // Note: We use the original messages for UI display, but the agent receives the summarized version
  // The agent will process messagesToUse internally through the streaming mechanism
  return createAgentUIStreamResponse({
    agent,
    uiMessages: messagesToUse, // Use summarized messages for agent processing
    abortSignal: request.signal,
    consumeSseStream: consumeStream,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      chunking: "line", // optional: defaults to 'word'
    }),
    messageMetadata(options) {
      return {
        ...options,
        summarizationOccurred: summarizationOccurred,
      };
    },
    sendReasoning: true,
    sendSources: true,
  });
}
