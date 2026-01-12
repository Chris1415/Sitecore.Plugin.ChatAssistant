import { consumeStream, createAgentUIStreamResponse, type UIMessage } from "ai";
import { createSitecoreAgent } from "@/components/agents/SitecoreAgent";
import { createAllmightyAgent } from "@/components/agents/AllightyAgent";
import { AgentType } from "@/lib/agent-configs";

export const maxDuration = 30;

const DEFAULT_MODEL = "openai/gpt-4o";

// Define the shape of additional context you might receive
interface RequestBody {
  messages: UIMessage[];
  model: string;
  agentType: AgentType;
}

export async function POST(req: Request) {
  const { messages, model, agentType }: RequestBody = await req.json();

  let agent;
  switch (agentType) {
    case AgentType.Sitecore:
      agent = createSitecoreAgent(model || DEFAULT_MODEL);
      break;
    case AgentType.Products:
      // TODO: Create dedicated ProductsAgent when ready
      agent = createAllmightyAgent(model || DEFAULT_MODEL);
      break;
    case AgentType.News:
      // TODO: Create dedicated NewsAgent when ready
      agent = createAllmightyAgent(model || DEFAULT_MODEL);
      break;
    case AgentType.Events:
      // TODO: Create dedicated EventsAgent when ready
      agent = createAllmightyAgent(model || DEFAULT_MODEL);
      break;
    case AgentType.Allmighty:
    default:
      agent = createAllmightyAgent(model || DEFAULT_MODEL);
      break;
  }

  // Use the agent to handle the request with UI message streaming
  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: req.signal,
    consumeSseStream: consumeStream,
  });
}
