import { AgentType } from "@/lib/agent-configs";
import { createSitecoreAgent } from "./SitecoreAgent";
import { createNewsAgent } from "./NewsAgent";
import { createAllmightyAgent } from "./AllmightyAgent";
import { Agent, LanguageModel } from "ai";
import { PagesContext } from "@sitecore-marketplace-sdk/client";

export function getAgent(
  agentType: AgentType,
  model: LanguageModel,
  contextId: string,
  accessToken: string,
  pageContext: PagesContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Agent<any, any, any> {
  switch (agentType) {
    case AgentType.Sitecore:
      return createSitecoreAgent(model, contextId, accessToken, pageContext);
    case AgentType.Products:
      return createSitecoreAgent(model, contextId, accessToken, pageContext);
    case AgentType.News:
      return createNewsAgent(model, contextId, accessToken, pageContext);
    case AgentType.Events:
      return createSitecoreAgent(model, contextId, accessToken, pageContext);
    case AgentType.Allmighty:
      return createAllmightyAgent(model, contextId, accessToken, pageContext);
  }
}
