import { AgentType } from "@/lib/agent-configs";
import { createSitecoreAgent } from "./SitecoreAgent";
import { createNewsAgent } from "./NewsAgent";
import { createAllmightyAgent } from "./AllmightyAgent";
import { createDelegationAgent } from "./DelegationAgent";
import { Agent, LanguageModel } from "ai";
import { PagesContext } from "@sitecore-marketplace-sdk/client";

export async function getAgent(
  agentType: AgentType,
  model: LanguageModel,
  contextId: string,
  accessToken: string,
  pageContext: PagesContext,
  brandKitId?: string | null,
  sections?: Array<{ sectionId: string }> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Agent<any, any, any>> {
  switch (agentType) {
    case AgentType.Sitecore:
      return createSitecoreAgent(
        model,
        contextId,
        accessToken,
        pageContext,
        brandKitId,
        sections
      );
    case AgentType.Products:
      return createSitecoreAgent(
        model,
        contextId,
        accessToken,
        pageContext,
        brandKitId,
        sections
      );
    case AgentType.News:
      return createNewsAgent(
        model,
        contextId,
        accessToken,
        pageContext,
        brandKitId,
        sections
      );
    case AgentType.Events:
      return createSitecoreAgent(
        model,
        contextId,
        accessToken,
        pageContext,
        brandKitId,
        sections
      );
    case AgentType.Allmighty:
      return createAllmightyAgent(
        model,
        contextId,
        accessToken,
        pageContext,
        brandKitId,
        sections
      );
    case AgentType.Delegation:
      return createDelegationAgent(model);
  }
}
