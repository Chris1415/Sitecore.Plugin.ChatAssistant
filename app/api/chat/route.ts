import { consumeStream, createAgentUIStreamResponse, type UIMessage } from "ai";
import { createSitecoreAgent } from "@/components/agents/SitecoreAgent";
import { createAllmightyAgent } from "@/components/agents/AllmightyAgent";
import { AgentType } from "@/lib/agent-configs";

export const maxDuration = 30;

const DEFAULT_MODEL = "openai/gpt-4o";

// Define the shape of additional context you might receive
interface RequestBody {
  messages: UIMessage[];
  model: string;
  agentType: AgentType;
  contextId?: string;
}

export async function POST(request: Request) {
  const { messages, model, agentType, contextId }: RequestBody =
    await request.json();
  const accessToken = request.headers.get("authorization")?.split(" ")[1];
  let agent;
  if (!contextId || !accessToken) {
    return new Response(
      JSON.stringify({
        error: "Context ID and access token are required for Sitecore agent",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  switch (agentType) {
    case AgentType.Sitecore:
      agent = createSitecoreAgent(
        model || DEFAULT_MODEL,
        contextId,
        accessToken
      );
      break;
    case AgentType.Products:
      // TODO: Create dedicated ProductsAgent when ready
      agent = createAllmightyAgent(
        model || DEFAULT_MODEL,
        contextId,
        accessToken
      );
      break;
    case AgentType.News:
      // TODO: Create dedicated NewsAgent when ready
      agent = createAllmightyAgent(
        model || DEFAULT_MODEL,
        contextId,
        accessToken
      );
      break;
    case AgentType.Events:
      // TODO: Create dedicated EventsAgent when ready
      agent = createAllmightyAgent(
        model || DEFAULT_MODEL,
        contextId,
        accessToken
      );
      break;
    case AgentType.Allmighty:
    default:
      agent = createAllmightyAgent(
        model || DEFAULT_MODEL,
        contextId,
        accessToken
      );
      break;
  }

  // Use the agent to handle the request with UI message streaming
  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: request.signal,
    consumeSseStream: consumeStream,
  });
}
