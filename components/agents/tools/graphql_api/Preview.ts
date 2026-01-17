import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

/**
 * Utility function to map a Sitecore item path to its item ID using GraphQL preview endpoint.
 * This function can be reused across multiple tools.
 *
 * @param accessToken - The access token for authentication
 * @param contextId - The Sitecore context ID
 * @param path - The full Sitecore item path (e.g., '/sitecore/content/solo/solo-website/Home/Articles/my-news-article')
 * @param language - The language code (e.g., 'en', 'en-US', 'de-DE')
 * @returns The item ID (GUID) as a string
 * @throws Error if the item is not found or the request fails
 */
export async function mapPathToId(
  accessToken: string,
  contextId: string,
  path: string,
  language: string
): Promise<string> {
  const graphqlQuery = `
    query MapPathToId($itemPath: String!, $language: String!){
      item(path: $itemPath language:$language){
        id
      }
    }
  `;

  const client = await createXMCClient(accessToken);
  const result = await client.preview.graphql({
    body: {
      query: graphqlQuery,
      variables: {
        itemPath: path,
        language: language,
      },
    },
    query: {
      sitecoreContextId: contextId,
    },
  });

  // Extract item ID from response: { data: { item: { id: "..." } } }
  const data = result?.data as { item?: { id?: string } } | undefined;
  const itemId = data?.item?.id;

  if (!itemId) {
    throw new Error(`Item not found at path: ${path} with language: ${language}`);
  }

  return itemId;
}

export function mapPathToIdTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Map a Sitecore item path to its item ID. Uses the preview endpoint with GraphQL to resolve the item path and return the item ID, along with language and site identifiers. Useful for converting content paths to item IDs for navigation or content operations.",
    inputSchema: z.object({
      path: z
        .string()
        .describe(
          "The Sitecore content item path (e.g., '/sitecore/content/solo/solo-website/Home/Articles/my-news-article'). This is the full path to the content item in the Sitecore content tree."
        ),
      language: z
        .string()
        .describe(
          "The language code (e.g., 'en', 'en-US', 'de-DE') to use when querying the item."
        ),
    }),
    outputSchema: z
      .string()
      .describe(
        "The unique identifier (GUID) of the item found at the given path. Format: GUID in curly braces like '{2E9A6515-F8A3-4AF4-A4F3-CF909F1895F0}'."
      ),
      execute: async ({ path, language }) => {
        try {
          return await mapPathToId(accessToken, contextId, path, language);
        } catch (error) {
          console.error("[PreviewTool] Error mapping path to ID:", error);
          throw error instanceof Error
            ? error
            : new Error("Failed to map path to item ID");
        }
      },
  }) as Tool;
}

// Combined export of all preview tools
export const previewTools = {
  mapPathToIdTool,
};

// Helper function to create all preview tools initialized
export function createAllPreviewTools(accessToken: string, contextId: string) {
  return {
    mapPathToId: mapPathToIdTool(accessToken, contextId),
  };
}
