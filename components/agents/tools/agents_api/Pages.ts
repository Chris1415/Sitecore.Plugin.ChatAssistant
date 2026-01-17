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

// Combined export of all page tools
export const pageTools = {
  getPageScreenshot,
  getPageHtmlTool,
};

// Helper function to create all page tools initialized
export function createAllPageTools(
  accessToken: string,
  contextId: string
) {
  return {
    getPageScreenshot: getPageScreenshot(accessToken, contextId),
    getPageHtml: getPageHtmlTool(accessToken, contextId),
  };
}