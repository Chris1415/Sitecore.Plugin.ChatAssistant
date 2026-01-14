import {
  consumeStream,
  createAgentUIStreamResponse,
  type UIMessage,
  wrapLanguageModel,
  gateway,
} from "ai";
import { AgentType } from "@/lib/agent-configs";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { getAgent } from "@/components/agents/AgentsFactory";
import { PagesContext } from "@sitecore-marketplace-sdk/client";

export const maxDuration = 30;

const DEFAULT_MODEL = "openai/gpt-4o";

// Define the shape of additional context you might receive
interface RequestBody {
  messages: UIMessage[];
  model: string;
  agentType: AgentType;
  pageContext: PagesContext;
  contextId?: string;
}

export async function POST(request: Request) {
  const { messages, model, agentType, contextId, pageContext }: RequestBody =
    await request.json();
  const accessToken = request.headers.get("authorization")?.split(" ")[1]; 

  const devToolsEnabledModel = wrapLanguageModel({
    model: gateway(model || DEFAULT_MODEL),
    middleware: devToolsMiddleware(),
  });

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
    devToolsEnabledModel,
    contextId,
    accessToken,
    pageContext
  );

  // Use the agent to handle the request with UI message streaming
  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: request.signal,
    consumeSseStream: consumeStream,
  });
}
