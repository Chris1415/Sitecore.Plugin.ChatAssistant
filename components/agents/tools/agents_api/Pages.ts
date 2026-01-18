import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function getPageScreenshot(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description: "Get the screenshot of a page in Sitecore.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the page to get the screenshot of."
        ),
      language: z
        .string()
        .describe("The language of the page to get the screenshot of."),
      version: z
        .number()
        .describe("The version of the page to get the screenshot of."),
    }),
    outputSchema: z.object({
      screenshotData: z.any().describe("The screenshot data of the page."),
    }),
    execute: async ({ pageId, language, version }) => {
      const xmcClient = await createXMCClient(accessToken);
      const result = await xmcClient.agent.pagesGetPageScreenshot({
        path: { pageId: pageId },
        query: {
          sitecoreContextId: contextId,
          language: language,
          version: version,
        },
      });

      return {
        screenshotData: result?.data || "",
      };
    },
  });
}

export function getPageHtmlTool(accessToken: string, contextId: string): Tool {
  return tool({
    description: "Get the HTML content of a page in Sitecore.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the page to get the HTML content of."
        ),
      language: z
        .string()
        .describe("The language of the page to get the HTML content of."),
      version: z
        .number()
        .describe("The version of the page to get the HTML content of."),
    }),
    outputSchema: z.object({
      html: z.string().describe("The HTML content of the page."),
    }),
    execute: async ({ pageId, language, version }) => {
      const xmcClient = await createXMCClient(accessToken);
      const result = await xmcClient.agent.pagesGetPageHtml({
        path: { pageId: pageId },
        query: {
          sitecoreContextId: contextId,
          language: language,
          version: version,
        },
      });
      return {
        html: result?.data?.html || "",
      };
    },
  });
}

export function getPageComponentsTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Retrieve a list of components that are currently added to a specific page. Returns page information along with all components on the page, including their layout and configuration details.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the page from which to retrieve components (e.g., '3f2504e0-4f89-11d3-9a0c-0305e82c3301')."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language code (e.g., 'en', 'en-US', 'de-DE') for filtering components. If not specified, defaults to the page's default language."
        ),
      version: z
        .number()
        .optional()
        .describe(
          "Optional version number of the page to retrieve components from. If not specified, retrieves components from the latest version."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the page components were successfully retrieved. If false, check the error field for details."
        ),
      data: z
        .any()
        .nullable()
        .describe(
          "The page components data including pageId, pageName, pagePath, version, language, route, layoutEditingKind, template, and components list. Returns null if the operation failed or the page was not found."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid pageId, page not found, or permission issues."
        ),
    }),
    execute: async ({ pageId, language, version }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.pagesGetComponentsOnPage({
          path: {
            pageId: pageId,
          },
          query: {
            language: language,
            version: version,
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[PageTool] Error fetching page components:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch page components",
          data: null,
        };
      }
    },
  });
}

export function searchPagesTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Search for all pages in a specific site using a search term that matches page titles and content. Returns matching pages with their details including page ID, path, name, template ID, and matching fields.",
    inputSchema: z.object({
      search_query: z
        .string()
        .describe(
          "The search term to look for in page titles and content (e.g., 'skate', 'home', 'article')."
        ),
      site_name: z
        .string()
        .describe(
          "The unique name of the site to search within (e.g., 'skate-park', 'solo-website')."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language code (e.g., 'en', 'en-US', 'de-DE') for filtering pages. If not specified, searches across all languages."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the page search was successfully executed. If false, check the error field for details."
        ),
      data: z
        .any()
        .nullable()
        .describe(
          "Array of matching pages with their details. Each page includes itemId, name, path, templateId, and fields array with matching field names and values. Returns null if the operation failed."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid site name, search query, or permission issues."
        ),
    }),
    execute: async ({ search_query, site_name, language }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        // Note: API method name may need to be adjusted based on SDK implementation
        // Endpoint: GET /api/v1/pages/search
        // @ts-expect-error - Method name may vary based on SDK version
        const result = await xmcClient.agent.pagesSearchPages({
          query: {
            search_query: search_query,
            site_name: site_name,
            language: language,
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[PageTool] Error searching pages:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to search pages",
          data: null,
        };
      }
    },
  });
}

// Combined export of all page tools
export const pageTools = {
  getPageScreenshot,
  getPageHtmlTool,
  getPageComponentsTool,
  searchPagesTool,
};

// Helper function to create all page tools initialized
export function createAllPageTools(
  accessToken: string,
  contextId: string
) {
  return {
    getPageScreenshot: getPageScreenshot(accessToken, contextId),
    getPageHtml: getPageHtmlTool(accessToken, contextId),
    getPageComponents: getPageComponentsTool(accessToken, contextId),
    searchPages: searchPagesTool(accessToken, contextId),
  };
}