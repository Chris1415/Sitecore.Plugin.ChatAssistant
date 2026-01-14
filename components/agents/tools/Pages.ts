import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../base/sitecoreClient";

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

export function translatePageTool(accessToken: string): Tool {
  return tool({
    description:
      "Translate a page from one language to another in Sitecore. Creates a new version of the page in the target language using the specified translation strategy. Useful for creating multilingual content or translating existing pages to support multiple languages.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the page to translate. This is the page ID from Sitecore."
        ),
      sourceLanguage: z
        .string()
        .describe(
          "The source language code (e.g., 'en', 'en-US'). This is the language of the page that will be translated."
        ),
      targetLanguage: z
        .string()
        .describe(
          "The target language code (e.g., 'ja-JP', 'de-DE', 'fr-FR'). This is the language the page will be translated to."
        ),
      translationStrategy: z
        .enum(["AddVersion", "CreateNew"])
        .describe(
          "The translation strategy to use. 'AddVersion' adds a new language version to the existing page. 'CreateNew' creates a new page item for the translation."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the translation was successfully initiated. If false, check the error field for details."
        ),
      message: z
        .string()
        .optional()
        .describe(
          "Success message or additional information about the translation operation."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid page ID, language codes, or API authentication issues."
        ),
    }),
    execute: async ({
      pageId,
      sourceLanguage,
      targetLanguage,
      translationStrategy,
    }) => {
      try {
        // Build query string with optional parameters
        const url = `https://edge-platform.sitecorecloud.io/authoring/api/v1/pages/${pageId}/translate`;

        // Make direct API call to Sitecore translate endpoint
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceLanguage,
            targetLanguage,
            translationStrategy,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error data:", JSON.stringify(errorData, null, 2));
          throw new Error(
            errorData.message ||
              `Translation failed with status ${response.status}`
          );
        }

        await response.json();

        return {
          success: true,
          message: `Page ${pageId} successfully translated from ${sourceLanguage} to ${targetLanguage} using ${translationStrategy} strategy.`,
        };
      } catch (error) {
        console.error("[PagesTool] Error translating page:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to translate page",
        };
      }
    },
  });
}
