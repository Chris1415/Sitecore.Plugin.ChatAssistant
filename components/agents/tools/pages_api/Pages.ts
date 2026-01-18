import { getAccessToken } from "@/lib/oauth-login";
import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function translatePageTool(): Tool {
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
        const accessToken = await getAccessToken({
          clientId: process.env.SITECORE_DEPLOY_CLIENT_ID || "",
          clientSecret: process.env.SITECORE_DEPLOY_CLIENT_SECRET || "",
        });
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

export function checkPagePublishedToEdgeTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Check if a page is published to Edge. Verifies whether the requested page has been published to the Edge platform for the specified language.",
    inputSchema: z.object({
      pageId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the page to check (e.g., '8f0b81bc-7388-46be-b109-6e73d1114470')."
        ),
      language: z
        .string()
        .describe(
          "The page language code (e.g., 'en-US', 'en', 'de-DE'). Required parameter."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the check was successfully executed. If false, check the error field for details."
        ),
      isPublished: z
        .boolean()
        .optional()
        .describe(
          "Indicates whether the page is published to Edge. True if published (HTTP 200), false if not published (HTTP 404 or other error codes). Only present when success is true."
        ),
      statusCode: z
        .number()
        .optional()
        .describe(
          "HTTP status code from the API response. 200 indicates published, 404 indicates not found/not published, other codes indicate errors. Only present when success is true."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include page not found (404), invalid page ID, or API authentication issues."
        ),
    }),
    execute: async ({ pageId, language }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const response = await xmcClient.pages.getLivePageState({
          path: { pageId },
          query: { language, sitecoreContextId: contextId },
        });

        // Extract HTTP status code from response
        const httpResponse = (response as { response?: Response }).response;
        const statusCode = httpResponse?.status || 0;

        // Only handle 200 (published) and 404 (not published)
        // According to API definition:
        // - 200 (OK) = page is published and live
        // - 404 (Not Found) = page not published or doesn't exist
        if (statusCode === 200) {
          return {
            success: true,
            isPublished: true,
            statusCode: 200,
          };
        }

        if (statusCode === 404) {
          return {
            success: true,
            isPublished: false,
            statusCode: 404,
          };
        }

        // For any other status code, return error
        return {
          success: false,
          error: `Unexpected status code: ${statusCode}. Expected 200 (published) or 404 (not published).`,
        };
      } catch (error: unknown) {
        // Try to extract status code from error
        let statusCode: number | undefined;

        if (error && typeof error === "object") {
          const errorObj = error as Record<string, unknown>;
          
          // Check error.status (ProblemDetails structure)
          if (typeof errorObj.status === "number") {
            statusCode = errorObj.status;
          }
          
          // Check error.response.status
          if (!statusCode && errorObj.response && typeof errorObj.response === "object") {
            const response = errorObj.response as Record<string, unknown>;
            if (typeof response.status === "number") {
              statusCode = response.status;
            }
          }
        }

        // Only handle 200 and 404 from errors
        if (statusCode === 200) {
          return {
            success: true,
            isPublished: true,
            statusCode: 200,
          };
        }

        if (statusCode === 404) {
          return {
            success: true,
            isPublished: false,
            statusCode: 404,
          };
        }

        // For any other error, return failure
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check if page is published to Edge",
        };
      }
    },
  });
}

// Combined export of all pages API tools
export const pagesApiTools = {
  translatePageTool,
  checkPagePublishedToEdgeTool,
};

// Helper function to create all pages API tools initialized
export function createAllPagesApiTools(accessToken: string, contextId: string) {
  return {
    translatePage: translatePageTool(),
    checkPagePublishedToEdge: checkPagePublishedToEdgeTool(accessToken, contextId),
  };
}
