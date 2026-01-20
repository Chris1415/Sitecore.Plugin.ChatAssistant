import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function getItemChildrenTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "⚠️ EXPERIMENTAL: Get all children of any Sitecore content item using GraphQL. Returns all fields for each child item. Use this for content items (not page items - use listPageChildren for pages). WARNING: This tool is experimental and might not work as expected.",
    needsApproval: true,
    inputSchema: z.object({
      itemPath: z
        .string()
        .describe(
          "The Sitecore content item path (e.g., '/sitecore/content/solo/solo-website/Home/Articles') or item ID (GUID). This is the parent item whose children should be retrieved."
        ),
      language: z
        .string()
        .describe(
          "The language code (e.g., 'en', 'en-US', 'de-DE') to use when querying the item and its children."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the operation was successfully executed. If false, check the error field for details."
        ),
      itemId: z
        .string()
        .optional()
        .describe(
          "The unique identifier (GUID) of the parent item. Only present when success is true."
        ),
      itemName: z
        .string()
        .optional()
        .describe(
          "The name of the parent item. Only present when success is true."
        ),
      children: z
        .array(z.any())
        .optional()
        .describe(
          "Array of child item objects. Each child contains all available fields including id, name, path, template, fields, and other Sitecore-specific metadata. Only present when success is true."
        ),
      count: z
        .number()
        .optional()
        .describe(
          "Total number of child items found. Only present when success is true."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid item path/ID, language, or authentication issues."
        ),
    }),
    execute: async ({ itemPath, language }) => {
      try {
        const graphqlQuery = `
query GetItemChildren($itemPath: String!, $language: String!) {
  item(path: $itemPath, language: $language) {
    id
    name
    children {
      results {
        id
        name
        path
        template {
          id
          name
        }
        fields {
          name
          value
        }
        language {
          name
        }
      }
    }
  }
}

        `;

        const client = await createXMCClient(accessToken);
        const result = await client.preview.graphql({
          body: {
            query: graphqlQuery,
            variables: {
              itemPath: itemPath,
              language: language,
            },
          },
          query: {
            sitecoreContextId: contextId,
          },
        });

        const data = result?.data as
          | {
              item?: {
                id?: string;
                name?: string;
                children?: {
                  results?: Array<Record<string, unknown>>;
                };
              };
            }
          | undefined;

        if (!data?.item) {
          return {
            success: false,
            error: `Item not found at path: ${itemPath} with language: ${language}`,
            count: 0,
          };
        }

        const children = data.item.children?.results || [];

        return {
          success: true,
          itemId: data.item.id,
          itemName: data.item.name,
          children: children,
          count: children.length,
        };
      } catch (error) {
        console.error("[PreviewTool] Error getting item children:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get item children",
          count: 0,
        };
      }
    },
  }) as Tool;
}

// Combined export of all preview tools
export const previewTools = {
  getItemChildrenTool,
};

// Helper function to create all preview tools initialized
export function createAllGraphqlApiPreviewTools(
  accessToken: string,
  contextId: string
) {
  return {
    getItemChildren: getItemChildrenTool(accessToken, contextId),
  };
}
