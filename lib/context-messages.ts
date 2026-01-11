import { PagesContext } from "@sitecore-marketplace-sdk/client";

// Configuration for context message handling
export const CONTEXT_MESSAGE_CONFIG = {
  // Set to true to hide context messages from the chat display
  hideContextMessages: true,
};

// Prefixes used to identify context messages
export const CONTEXT_MESSAGE_PREFIXES = [
  "[Initial Page Context]",
  "The page context has been updated",
] as const;

// Check if a message text is a context message
export function isContextMessage(text: string): boolean {
  return CONTEXT_MESSAGE_PREFIXES.some((prefix) => text.startsWith(prefix));
}

// Check if a message should be visible based on configuration
export function shouldShowMessage(text: string): boolean {
  if (!CONTEXT_MESSAGE_CONFIG.hideContextMessages) {
    return true;
  }
  return !isContextMessage(text);
}

// Extract context summary from PagesContext
export interface ContextSummary {
  PageName: string | undefined;
  Language: string | undefined;
  SiteName: string | undefined;
  Version: string | undefined;
}

export function extractContextSummary(context: PagesContext): ContextSummary {
  const pageInfo = context.pageInfo;
  return {
    PageName: pageInfo?.displayName || pageInfo?.name,
    Language: pageInfo?.language,
    SiteName: context?.siteInfo?.displayName,
    Version: pageInfo?.version?.toString(),
  };
}

// Message templates
export function createInitialContextMessage(
  contextSummary: ContextSummary
): string {
  return `[Initial Page Context]

\`\`\`json
${JSON.stringify(contextSummary, null, 2)}
\`\`\`

Respond only with the key facts which you can see in the JSON. 
Start with **Page Context:** and then the facts. No other words. Use one line per fact.`;
}

export function createContextUpdateMessage(
  contextSummary: ContextSummary
): string {
  return `The page context has been updated. Here is the current page information as JSON:

\`\`\`json
${JSON.stringify(contextSummary, null, 2)}
\`\`\`

What has changed compared to the previous context? Present each change in the format:
**Page Context Updated:** 
**Field:** {OLD} → {NEW}. Only show fields that actually changed.`;
}

// Generate the appropriate context message based on whether it's initial or update
export function createContextMessage(
  context: PagesContext,
  isInitial: boolean
): string {
  const contextSummary = extractContextSummary(context);
  return isInitial
    ? createInitialContextMessage(contextSummary)
    : createContextUpdateMessage(contextSummary);
}

