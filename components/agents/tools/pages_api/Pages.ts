import { getAccessToken } from "@/lib/oauth-login";
import { Tool, tool } from "ai";
import z from "zod";

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

// Combined export of all translation tools
export const translationTools = {
  translatePageTool,
};

// Helper function to create all translation tools initialized
export function createAllTranslationTools() {
  return {
    translatePage: translatePageTool(),
  };
}