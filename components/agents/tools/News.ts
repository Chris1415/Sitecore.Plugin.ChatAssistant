import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../base/sitecoreClient";

export function getNewsRootPageTool(): Tool {
  return tool({
    description:
      "Retrieve the News Root Page configuration including its Sitecore Item ID and content tree path. This is the parent container where all news articles are stored. Use this ID when creating new news pages to ensure they are placed in the correct location.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      itemId: z
        .string()
        .describe(
          "The Sitecore Item ID (GUID) of the News Root Page. Format: GUID in curly braces like '{2E9A6515-F8A3-4AF4-A4F3-CF909F1895F0}'. Use this as the parent ID when creating news pages."
        ),
      itemPath: z
        .string()
        .describe(
          "The full Sitecore content tree path to the News Root Page (e.g., '/sitecore/content/solo/solo-website/Home/Articles'). This shows where the news section is located in the content hierarchy."
        ),
    }),
    execute: async () => {
      return {
        itemId: "{2E9A6515-F8A3-4AF4-A4F3-CF909F1895F0}",
        itemPath: "/sitecore/content/solo/solo-website/Home/Articles",
      };
    },
  });
}

export function getNewsTemplateTool(): Tool {
  return tool({
    description:
      "Retrieve the News Template Item ID. This template defines the structure and fields available for news articles (title, content, subtitle, excerpt, etc.). Use this template ID when creating new news pages to ensure they have the correct field structure.",
    inputSchema: z.object({}),
    outputSchema: z
      .string()
      .describe(
        "The Sitecore Template Item ID (GUID) for the News Template. Format: GUID in curly braces like '{FA3F23AF-7950-4FC6-88F8-A9773F61E25B}'. This template defines which fields are available on news pages (Title, Content, Subtitle, Excerpt, etc.)."
      ),
    execute: async () => {
      return "{FA3F23AF-7950-4FC6-88F8-A9773F61E25B}";
    },
  });
}

export function getNewsContentTool(
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

export function createNewsPageTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description: `Create a new news article page in Sitecore. The page will be created as a child of the specified parent (typically the News Root Page) using the News Template. All required fields (title, content, subtitle, excerpt) must be provided. The page will be created in the specified language. After creation, you can use the returned itemId to reference or update the page.`,
    inputSchema: z.object({
      id: z
        .string()
        .describe(
          "URL-friendly identifier/slug for the news page (e.g., 'breaking-news-2024', 'company-announcement'). Used in the page URL and must be unique. Use lowercase letters, numbers, and hyphens only."
        ),
      title: z
        .string()
        .describe(
          "Main headline/title of the news article. This is the primary title that appears prominently on the page and in search results. Should be clear, concise, and engaging."
        ),
      content: z
        .string()
        .describe(
          "The main body content of the news article. Contains the full article text, paragraphs, and detailed information. Can include HTML formatting if needed. This is the primary content that readers will see."
        ),
      subtitle: z
        .string()
        .describe(
          "Secondary headline or tagline that appears below the main title. Provides additional context or a brief summary. Often used for emphasis or to add more detail to the main headline."
        ),
      excerpt: z
        .string()
        .describe(
          "Short summary or teaser text (typically 1-3 sentences) used in news listings, previews, and social media shares. Should be compelling and provide a quick overview of the article content. Keep it concise and engaging."
        ),
      parent: z
        .string()
        .describe(
          "The Sitecore Item ID of the parent page where this news article will be created. Typically this should be the News Root Page ID (use getNewsRootPage tool to retrieve it). Format: GUID in curly braces like '{2E9A6515-F8A3-4AF4-A4F3-CF909F1895F0}'."
        ),
      template: z
        .string()
        .describe(
          "The Sitecore Template Item ID that defines the structure and fields for this news page. Typically this should be the News Template ID (use getNewsTemplate tool to retrieve it). Format: GUID in curly braces like '{19BA4928-23EB-4FE4-8D64-926B0DEAC834}'."
        ),
      language: z
        .string()
        .describe(
          "Language code for the news page content (e.g., 'en' for English, 'de' for German, 'fr' for French). Use ISO 639-1 two-letter language codes. This determines which language version of the page is being created."
        ),
      publishDate: z
        .string()
        .optional()
        .describe(
          "Publication date for the news article in format 'YYYYMMDDTHHMMSSZ' (e.g., '20250814T145600Z'). Optional field that specifies when the article should be published or was published."
        ),
      externalUrl: z
        .string()
        .optional()
        .describe(
          "External URL link for the news article. Optional field that can point to an external source or related content. Should be a valid URL format."
        ),
      readTime: z
        .number()
        .optional()
        .describe(
          "Estimated reading time for the article in minutes (e.g., 5, 10, 15). Optional field that helps readers understand how long it will take to read the article. Must be a number representing minutes."
        ),
      quote: z
        .string()
        .optional()
        .describe(
          "A notable quote or excerpt from the article that can be highlighted. Optional field for featuring important quotes or key statements."
        ),
      keyTakeaway1: z
        .string()
        .optional()
        .describe(
          "First key takeaway or main point from the article. Optional field for summarizing important insights or highlights."
        ),
      keyTakeaway2: z
        .string()
        .optional()
        .describe(
          "Second key takeaway or main point from the article. Optional field for summarizing important insights or highlights."
        ),
      keyTakeaway3: z
        .string()
        .optional()
        .describe(
          "Third key takeaway or main point from the article. Optional field for summarizing important insights or highlights."
        ),
      keyTakeaway4: z
        .string()
        .optional()
        .describe(
          "Fourth key takeaway or main point from the article. Optional field for summarizing important insights or highlights."
        ),
      keyTakeaway5: z
        .string()
        .optional()
        .describe(
          "Fifth key takeaway or main point from the article. Optional field for summarizing important insights or highlights."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the news page was successfully created. If false, check the error field for details about what went wrong."
        ),
      itemId: z
        .string()
        .describe(
          "The Sitecore Item ID (GUID) of the newly created news page. Format: GUID in curly braces. Use this ID to reference, update, or delete the page later. Empty string if creation failed."
        ),
      name: z
        .string()
        .describe(
          "The name/slug of the created news page. This matches the 'id' parameter provided and is used in the page URL. Useful for confirming the page was created with the correct identifier."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid parent ID, template ID mismatch, missing required fields, or permission issues."
        ),
    }),
    execute: async ({
      id,
      title,
      content,
      subtitle,
      excerpt,
      parent,
      template,
      language,
      publishDate,
      externalUrl,
      readTime,
      quote,
      keyTakeaway1,
      keyTakeaway2,
      keyTakeaway3,
      keyTakeaway4,
      keyTakeaway5,
    }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.pagesCreatePage({
          body: {
            name: id,
            parentId: parent,
            templateId: template,
            language: language,
            fields: [
              {
                Id: id,
                Title: title,
                Content: content,
                Excerpt: excerpt,
                Subtitle: subtitle,
                PublishDate: publishDate,
                ExternalUrl: externalUrl,
                ReadTime: readTime,
                Quote: quote,
                KeyTakeaway1: keyTakeaway1,
                KeyTakeaway2: keyTakeaway2,
                KeyTakeaway3: keyTakeaway3,
                KeyTakeaway4: keyTakeaway4,
                KeyTakeaway5: keyTakeaway5,
                Author: "{B37C1F67-D2D3-4035-9511-5CF820F315D6}",
                HeroImage: "{BB193D88-96A7-46C9-9703-64603742D2EE}",
              },
            ],
          },
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          itemId: result?.data?.itemId || "",
          name: result?.data?.name || id,
        };
      } catch (error) {
        console.error("[NewsAgent] Error creating news page:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create news page",
          itemId: "",
          name: id,
        };
      }
    },
  });
}
