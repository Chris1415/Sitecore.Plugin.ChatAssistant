import { PagesContext } from "@sitecore-marketplace-sdk/client";
// Message templates
export function createInitialContextMessage(
  contextSummary: PagesContext
): string {
  return `[Initial Page Context]
\`\`\`json
${JSON.stringify(contextSummary, null, 2)}
\`\`\``;
}

// Generate the appropriate context message based on whether it's initial or update
export function createContextMessage(context: PagesContext): string {
  return createInitialContextMessage(context);
}
