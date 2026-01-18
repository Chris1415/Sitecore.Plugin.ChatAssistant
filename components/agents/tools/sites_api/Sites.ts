import { getAccessToken } from "@/lib/oauth-login";
import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function listPageChildrenTool(): Tool {
  return tool({
    description:
      "List all child pages of a specific page in Sitecore. Retrieves the direct children of a page, useful for navigating page hierarchies, understanding site structure, or finding pages within a specific section.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the parent page whose children should be retrieved (e.g., '8f0b81bc-7388-46be-b109-6e73d1114470')."
        ),
      siteId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the site containing the page (e.g., '8f0b81bc-7388-46be-b109-6e73d1114470')."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language code (e.g., 'en-US', 'en', 'de-DE') to filter children by language. If not provided, children for the default language will be retrieved."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the operation was successfully executed. If false, check the error field for details."
        ),
      children: z
        .array(z.any())
        .optional()
        .describe(
          "Array of child page objects. Each child page object contains properties like page ID, name, path, language, and other Sitecore-specific metadata. Only present when success is true."
        ),
      count: z
        .number()
        .optional()
        .describe(
          "Total number of child pages found. Only present when success is true."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include page not found (404), invalid page ID, or API authentication issues."
        ),
    }),
    execute: async ({ pageId, siteId, language }) => {
      try {
        const accessToken = await getAccessToken({
          clientId: process.env.SITECORE_DEPLOY_CLIENT_ID || "",
          clientSecret: process.env.SITECORE_DEPLOY_CLIENT_SECRET || "",
        });

        const xmcClient = await createXMCClient(accessToken);

        const queryParams: { language?: string } = {};
        if (language) {
          queryParams.language = language;
        }

        const result = await xmcClient.sites.listPageChildren({
          path: {
            pageId: pageId,
            siteId: siteId,
          },
          query: queryParams,
        });

        return {
          success: true,
          children: result?.data || [],
          count: result?.data?.length || 0,
        };
      } catch (error) {
        console.error("[SitesTool] Error listing page children:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to list page children",
          children: [],
          count: 0,
        };
      }
    },
  });
}

// Combined export of all sites API tools
export const sitesApiTools = {
  listPageChildrenTool,
};

// Helper function to create all sites API tools initialized
export function createAllSitesApiTools() {
  return {
    listPageChildren: listPageChildrenTool(),
  };
}

