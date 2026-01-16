import {
  consumeStream,
  createAgentUIStreamResponse,
  type UIMessage,
  wrapLanguageModel,
  gateway,
  type LanguageModel,
} from "ai";
import { AgentType } from "@/lib/agent-configs";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { getAgent } from "@/components/agents/AgentsFactory";
import { PagesContext } from "@sitecore-marketplace-sdk/client";

export const maxDuration = 30;

const DEFAULT_MODEL = "openai/gpt-4o";

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
  const { messages, model, agentType, contextId, pageContext, brandKitId, sections }: RequestBody =
    await request.json();
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

  const agent = getAgent(
    agentType,
    finalModel,
    contextId,
    accessToken,
    pageContext,
    brandKitId,
    sections
  );

  // Use the agent to handle the request with UI message streaming
  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: request.signal,
    consumeSseStream: consumeStream,
  });
}
