import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function refreshPagesTool(): Tool {
  return tool({
    description:
      "Indicator that a refresh should be triggered now. This tool signals that the pages context should be refreshed, reloading the current page context and updating any cached information. Use this when you need to ensure the latest page data is available.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      refresh: z
        .boolean()
        .describe(
          "Indicates that the refresh operation should be triggered now."
        ),
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
      "Navigate to a specific page in Sitecore. Priority: 1) If path is provided, use it and perform full path resolution (get pages list, match path, map to item ID). 2) If itemId is provided (and no path), use it directly and skip path resolution. 3) If both path and itemId are provided, prioritize path and follow the path resolution steps. The path should be a partial path relative from home (e.g., '/Articles/my-news-article' or 'Articles/my-news-article').",
    inputSchema: z.object({
      path: z
        .string()
        .optional()
        .describe(
          "Partial path relative from home (e.g., '/Articles/my-news-article' or 'Articles/my-news-article'). If provided, this takes priority and triggers full path resolution: gets list of all pages, matches the path to find the correct page, maps the path to an item ID, then navigates. Required if itemId is not provided."
        ),
      siteName: z
        .string()
        .describe(
          "The site name to search for pages. Required when path parameter is provided. Only used when path parameter is provided."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "The language code (e.g., 'en', 'en-US', 'de-DE') of the page to navigate to. Required if using path parameter. Optional if using itemId directly."
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
          "The unique identifier (GUID) of the page item to navigate to. If provided and path is NOT provided, will skip path resolution and navigate directly. If both path and itemId are provided, path takes priority and path resolution will be performed."
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
            const versionNum =
              typeof version === "number" ? version : Number(version);
            if (!isNaN(versionNum)) {
              resolvedVersion = versionNum;
            }
          }
        }

        // Priority logic: If path is provided, use it (even if itemId is also provided)
        // If only itemId is provided (no path), use it directly
        if (path) {
          if (!language) {
            throw new Error(
              "Language is required when using path parameter. Please provide a language code (e.g., 'en', 'en-US')."
            );
          }

          if (!siteName) {
            throw new Error(
              "siteName is required when using path parameter. Please provide a siteName."
            );
          }

          const xmcClient = await createXMCClient(accessToken);

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
            throw new Error(
              `No pages found for site: ${siteName} with language: ${language}`
            );
          }

          // Normalize the path (remove leading/trailing slashes, handle relative paths)
          const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
          const normalizedPathLower = normalizedPath.toLowerCase();
          const pathSegments = normalizedPath.split("/").filter(Boolean);
          const pathSegmentsLower = pathSegments.map((seg) =>
            seg.toLowerCase()
          );

          // Find matching page from the list (case-insensitive)
          let matchedPage:
            | { id?: string; path?: string; name?: string }
            | undefined;

          for (const page of pages) {
            const pagePath = page.path || "";
            const pageName = page.id || "";

            // Normalize page path for comparison
            const normalizedPagePath = pagePath.startsWith("/")
              ? pagePath.slice(1)
              : pagePath;
            const normalizedPagePathLower = normalizedPagePath.toLowerCase();
            const pagePathSegments = normalizedPagePath
              .split("/")
              .filter(Boolean);
            const pagePathSegmentsLower = pagePathSegments.map((seg) =>
              seg.toLowerCase()
            );

            // Check if path matches (exact match or ends with the path) - case-insensitive
            const exactMatch = normalizedPagePathLower === normalizedPathLower;
            const endsWithMatch =
              normalizedPagePathLower.endsWith(normalizedPathLower);
            const segmentMatch =
              pagePathSegmentsLower
                .slice(-pathSegmentsLower.length)
                .join("/") === normalizedPathLower;
            const nameMatch =
              pageName.toLowerCase() ===
              pathSegmentsLower[pathSegmentsLower.length - 1];

            if (exactMatch || endsWithMatch || segmentMatch || nameMatch) {
              matchedPage = page;
              break;
            }
          }

          if (!matchedPage || !matchedPage.id) {
            throw new Error(
              `Page not found for path: ${path} in site: ${siteName} with language: ${language}. Available pages: ${pages.length}`
            );
          }

          return {
            language: language,
            version: resolvedVersion,
            itemId: matchedPage.id,
          };
        }

        // If itemId is provided directly (no path), use it
        if (itemId) {
          return {
            language: language || null,
            version: resolvedVersion,
            itemId: itemId,
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
