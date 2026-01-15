import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function getLanguagesTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Retrieve all languages configured and available in the Sitecore site. Returns language codes (ISO 639-1), display names, and metadata. Useful for determining which languages are available when creating or updating content, or for multi-language content management tasks.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the languages were successfully retrieved. If false, check the error field for details."
        ),
      languages: z
        .array(z.any())
        .describe(
          "Array of language objects. Each language object contains properties like language code (e.g., 'en', 'de', 'fr'), display name, and other Sitecore-specific metadata. Use these language codes when creating or updating content in specific languages."
        ),
      count: z
        .number()
        .describe(
          "Total number of languages available in the site. Useful for understanding the site's multilingual capabilities."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include authentication issues or site configuration problems."
        ),
    }),
    execute: async () => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const languages = await xmcClient.sites.listLanguages({
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          languages: languages?.data || [],
          count: languages?.data?.length || 0,
        };
      } catch (error) {
        console.error("[SitecoreAgent] Error fetching languages:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch languages",
          languages: [],
          count: 0,
        };
      }
    },
  });
}

export function getSitesTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Retrieve all sites configured in the Sitecore instance. Returns site names, IDs, configuration details, and metadata. Useful for understanding the site structure, determining which site to work with, or getting site-specific information like root paths and settings.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the sites were successfully retrieved. If false, check the error field for details."
        ),
      sites: z
        .array(z.any())
        .describe(
          "Array of site objects. Each site object contains properties like site ID, name, display name, root path, configuration settings, and other Sitecore-specific metadata. Use this information to understand the site structure and identify which site to work with."
        ),
      count: z
        .number()
        .describe(
          "Total number of sites configured in the Sitecore instance. Useful for understanding the multi-site setup."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include authentication issues or configuration problems."
        ),
    }),
    execute: async () => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const sites = await xmcClient.sites.listSites({
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          sites: sites?.data || [],
          count: sites?.data?.length || 0,
        };
      } catch (error) {
        console.error("[SitecoreAgent] Error fetching sites:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch sites",
          sites: [],
          count: 0,
        };
      }
    },
  });
}
