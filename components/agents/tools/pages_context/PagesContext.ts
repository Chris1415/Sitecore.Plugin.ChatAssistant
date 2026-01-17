import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";
import { mapPathToId } from "../graphql_api/Preview";

export function refreshPagesTool(): Tool {
  return tool({
    description:
      "Indicator that a refresh should be triggered now. This tool signals that the pages context should be refreshed, reloading the current page context and updating any cached information. Use this when you need to ensure the latest page data is available.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      refresh: z.boolean().describe("Indicates that the refresh operation should be triggered now."),
    }),
    execute: async () => {
      return {
        refresh: true,
      };
    },
  });
}

export function navigatePagesTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Navigate to a specific page in Sitecore using a partial path relative from home (e.g., '/Articles/my-news-article' or 'Articles/my-news-article'). The tool will first get a list of all pages, match the path to find the correct page, map the path to an item ID, and then navigate to that page. You can also provide version, itemId, or language directly if you already have them.",
    inputSchema: z.object({
      path: z
        .string()
        .optional()
        .describe(
          "Partial path relative from home (e.g., '/Articles/my-news-article' or 'Articles/my-news-article'). This will be matched against the list of all pages to find the correct page, then mapped to an item ID for navigation."
        ),
      siteName: z
        .string()
        .optional()
        .describe(
          "The site name to search for pages. If not provided, will attempt to determine from context."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "The language code (e.g., 'en', 'en-US', 'de-DE') of the page to navigate to. Required if using path parameter."
        ),
      version: z
        .union([z.number(), z.string()])
        .optional()
        .describe(
          "The version number of the page to navigate to. If 'last version' or 'latest' is specified, the version parameter will be skipped. If not provided, version will be skipped entirely."
        ),
      itemId: z
        .string()
        .optional()
        .describe(
          "The unique identifier (GUID) of the page item to navigate to. If provided, will skip path resolution and navigate directly. Use this if you already have the item ID."
        ),
    }),
    outputSchema: z.object({
      language: z
        .string()
        .nullable()
        .optional()
        .describe("The language code that was navigated to, if provided."),
      version: z
        .number()
        .nullable()
        .optional()
        .describe("The version number that was navigated to, if provided."),
      itemId: z
        .string()
        .nullable()
        .optional()
        .describe("The item ID that was navigated to, if provided."),
    }),
    execute: async ({ path, siteName, language, version, itemId }) => {
      try {
        // Normalize version: skip if "last version", "latest", or not provided
        let resolvedVersion: number | null = null;
        if (version !== undefined && version !== null) {
          const versionStr = String(version).toLowerCase().trim();
          if (
            versionStr !== "last version" &&
            versionStr !== "latest" &&
            versionStr !== ""
          ) {
            const versionNum = typeof version === "number" ? version : Number(version);
            if (!isNaN(versionNum)) {
              resolvedVersion = versionNum;
            }
          }
          // If version is "last version" or "latest", resolvedVersion stays null (skip it)
        }

        // If itemId is provided directly, use it (skip path resolution)
        if (itemId) {
          return {
            language: language || null,
            version: resolvedVersion,
            itemId: itemId,
          };
        }

        // If path is provided, we need to resolve it
        if (path) {
          if (!language) {
            throw new Error(
              "Language is required when using path parameter. Please provide a language code (e.g., 'en', 'en-US')."
            );
          }

          const xmcClient = await createXMCClient(accessToken);

          // Step 1: Get list of all pages for the site
          if (!siteName) {
            // Try to get sites first to determine site name
            const sites = await xmcClient.sites.listSites({
              query: {
                sitecoreContextId: contextId,
              },
            });

            if (!sites?.data || sites.data.length === 0) {
              throw new Error("No sites found. Please provide a siteName parameter.");
            }

            // Use the first site as default
            siteName = (sites.data[0] as { name?: string })?.name || "";
            if (!siteName) {
              throw new Error("Could not determine site name. Please provide siteName parameter.");
            }
          }

          const pagesResult = await xmcClient.agent.sitesGetAllPagesBySite({
            path: {
              siteName: siteName,
            },
            query: {
              language: language,
              sitecoreContextId: contextId,
            },
          });

          const pages = pagesResult?.data || [];
          if (pages.length === 0) {
            throw new Error(`No pages found for site: ${siteName} with language: ${language}`);
          }

          // Step 2: Normalize the path (remove leading/trailing slashes, handle relative paths)
          const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
          const pathSegments = normalizedPath.split("/").filter(Boolean);

          // Step 3: Find matching page from the list
          // Match by comparing path segments or page name/path properties
          let matchedPage: { id?: string; path?: string; name?: string } | undefined;

          for (const page of pages) {
            const pageAny = page as { path?: string; name?: string; id?: string };
            const pagePath = pageAny.path || "";
            const pageName = pageAny.name || "";

            // Normalize page path for comparison
            const normalizedPagePath = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
            const pagePathSegments = normalizedPagePath.split("/").filter(Boolean);

            // Check if path matches (exact match or ends with the path)
            if (
              normalizedPagePath === normalizedPath ||
              normalizedPagePath.endsWith(normalizedPath) ||
              pagePathSegments.slice(-pathSegments.length).join("/") === normalizedPath ||
              pageName.toLowerCase() === pathSegments[pathSegments.length - 1]?.toLowerCase()
            ) {
              matchedPage = pageAny;
              break;
            }
          }

          if (!matchedPage || !matchedPage.id) {
            throw new Error(
              `Page not found for path: ${path} in site: ${siteName} with language: ${language}. Available pages: ${pages.length}`
            );
          }

          // Step 4: Get the full path for the matched page and map to item ID
          const fullPath = matchedPage.path || "";
          if (!fullPath) {
            throw new Error(`Page found but no path available for page ID: ${matchedPage.id}`);
          }

          // Step 5: Map path to item ID using the shared utility function
          const resolvedItemId = await mapPathToId(
            accessToken,
            contextId,
            fullPath,
            language
          );

          // Step 6: Return navigation parameters
          return {
            language: language,
            version: resolvedVersion,
            itemId: resolvedItemId,
          };
        }

        // If only version or language is provided (without path or itemId)
        if (resolvedVersion !== null || language) {
          return {
            language: language || null,
            version: resolvedVersion,
            itemId: null,
          };
        }

        // At least one parameter must be provided
        throw new Error(
          "At least one parameter (path, version, itemId, or language) must be provided."
        );
      } catch (error) {
        console.error("[NavigatePagesTool] Error navigating to page:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to navigate to page");
      }
    },
  });
}

// Combined export of all pages context tools
export const pagesContextTools = {
  refreshPagesTool,
  navigatePagesTool,
};

// Helper function to create all pages context tools initialized
export function createAllPagesContextTools(
  accessToken: string,
  contextId: string
) {
  return {
    refreshPages: refreshPagesTool(),
    navigatePages: navigatePagesTool(accessToken, contextId),
  };
}

