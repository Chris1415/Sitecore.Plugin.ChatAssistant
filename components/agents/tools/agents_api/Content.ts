import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function getItemContentTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Retrieve content item details from Sitecore by its path. Returns the full content item data including fields, metadata, and structure. Useful for reading existing news articles or content items.",
    inputSchema: z.object({
      itemPath: z
        .string()
        .describe(
          "The Sitecore content item path (e.g., '/sitecore/content/solo/solo-website/Home/Articles/my-news-article'). This is the full path to the content item in the Sitecore content tree."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the content item was successfully retrieved. If false, check the error field for details."
        ),
      data: z
        .any()
        .nullable()
        .describe(
          "The complete content item data including all fields, metadata, and structure. Contains fields like Title, Content, Subtitle, Excerpt, and other Sitecore-specific properties. Returns null if the operation failed or the item was not found."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid path, item not found, or permission issues."
        ),
    }),
    execute: async ({ itemPath }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.contentGetContentItemByPath({
          query: {
            item_path: itemPath,
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[NewsAgent] Error fetching news content:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch news content",
          data: null,
        };
      }
    },
  });
}
