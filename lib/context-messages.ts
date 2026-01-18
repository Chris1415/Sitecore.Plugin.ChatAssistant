import { PagesContext } from "@sitecore-marketplace-sdk/client";

interface SimplifiedPagesContext {
  page: {
    itemId?: string;
    language?: string;
    version?: number;
    path?: string;
    templateId?: string;
    templateName?: string;
    pageName?: string;
    displayName?: string;
  };
  site: {
    id?: string;
    name?: string;
    displayName?: string;
    language?: string;
  };
}

// Map PagesContext to SimplifiedPagesContext, extracting only important information
function simplifyPagesContext(ctx: PagesContext): SimplifiedPagesContext {
  return {
    page: {
      itemId: ctx?.pageInfo?.itemId as string | undefined,
      language: ctx?.pageInfo?.language as string | undefined,
      version: ctx?.pageInfo?.version as number | undefined,
      path: ctx?.pageInfo?.path as string | undefined,
      templateId: ctx?.pageInfo?.templateId as string | undefined,
      templateName: ctx?.pageInfo?.template?.name as string | undefined,
      pageName: ctx?.pageInfo?.pageName as string | undefined,
      displayName: ctx?.pageInfo?.displayName as string | undefined,
    },
    site: {
      id: ctx?.siteInfo?.id as string | undefined,
      name: ctx?.siteInfo?.name as string | undefined,
      displayName: ctx?.siteInfo?.displayName as string | undefined,
      language: ctx?.siteInfo?.language as string | undefined,
    },
  };
}

// Helper function to filter out undefined/null values from nested objects
function filterEmptyValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const filteredNested = filterEmptyValues(
        value as Record<string, unknown>
      );
      // Only include nested object if it has at least one property
      if (Object.keys(filteredNested).length > 0) {
        filtered[key] = filteredNested;
      }
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

// Message templates
export function createInitialContextMessage(
  contextSummary: PagesContext
): string {
  const simplified = simplifyPagesContext(contextSummary);
  const filtered = filterEmptyValues(
    simplified as unknown as Record<string, unknown>
  );

  return `[Initial Page Context]

\`\`\`json
${JSON.stringify(filtered, null, 2)}
\`\`\``;
}

// Generate the appropriate context message based on whether it's initial or update
export function createContextMessage(context: PagesContext): string {
  return createInitialContextMessage(context);
}
