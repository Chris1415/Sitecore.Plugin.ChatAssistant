import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../../base/sitecoreClient";

export function getItemContentTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Retrieve content item details from Sitecore by specifying its path in the content tree. Returns the full content item data including fields, metadata, and structure. Useful for reading existing news articles or content items when you know the item path.",
    inputSchema: z.object({
      item_path: z
        .string()
        .describe(
          "The path of the content item in the content tree (e.g., '/sitecore/content/Verticals/SkaterPark/Home' or URL-encoded '%2Fsitecore%2Fcontent%2FVerticals%2FSkaterPark%2FHome'). This is the full path to the content item in the Sitecore content tree."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language version of the content item to be retrieved (e.g., 'en', 'en-US', 'de-DE'). If not specified, the default language is used."
        ),
      failOnNotFound: z
        .boolean()
        .optional()
        .describe(
          "Optional flag that determines the behavior when the content item is not found. If true, the operation will fail with an error when the item is not found. If false or not specified, it will return null data."
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
          "The complete content item data including all fields, metadata, and structure. Contains fields like itemId, name, path, workflow, children, version, template, fields, created_at, updated_at, and other Sitecore-specific properties. Returns null if the operation failed or the item was not found."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid path, item not found, or permission issues."
        ),
    }),
    execute: async ({ item_path, language, failOnNotFound }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const queryParams: {
          item_path: string;
          sitecoreContextId: string;
          language?: string;
          failOnNotFound?: boolean;
        } = {
          item_path: item_path,
          sitecoreContextId: contextId,
        };

        if (language !== undefined) {
          queryParams.language = language;
        }

        if (failOnNotFound !== undefined) {
          queryParams.failOnNotFound = failOnNotFound;
        }

        const result = await xmcClient.agent.contentGetContentItemByPath({
          query: queryParams,
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[ContentTool] Error fetching content item by path:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch content item by path",
          data: null,
        };
      }
    },
  });
}

export function getContentItemByIdTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Retrieve content item details from Sitecore by its item ID. Returns the full content item data including fields, metadata, and structure. Useful for reading existing news articles or content items when you have the item ID.",
    inputSchema: z.object({
      itemId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the content item (e.g., '3f2504e0-4f89-11d3-9a0c-0305e82c3301'). This is the item ID of the content item in Sitecore."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language code (e.g., 'en', 'en-US', 'de-DE') for the content item. If not specified, the default language is used."
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
          "The complete content item data including all fields, metadata, and structure. Contains fields like itemId, name, path, workflow, children, version, template, fields, created_at, updated_at, and other Sitecore-specific properties. Returns null if the operation failed or the item was not found."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid itemId, item not found, or permission issues."
        ),
    }),
    execute: async ({ itemId, language }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.contentGetContentItemById({
          path: {
            itemId: itemId,
          },
          query: {
            language: language,
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[ContentTool] Error fetching content item by ID:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch content item",
          data: null,
        };
      }
    },
  });
}

export function updateContentItemTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Update an existing content item in Sitecore by its item ID. Updates specified fields of the content item while preserving other fields. Useful for modifying existing news articles or content items.",
    inputSchema: z.object({
      itemId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the content item to update (e.g., '{2E9A6515-F8A3-4AF4-A4F3-CF909F1895F0}')."
        ),
      fields: z
        .record(z.any())
        .describe(
          "Object containing the fields to update. Each key should be the field name (e.g., 'Title', 'Content', 'Subtitle', 'Excerpt') and the value should be the new field value. Only provided fields will be updated."
        ),
      language: z
        .string()
        .optional()
        .describe(
          "Optional language code (e.g., 'en', 'en-US', 'de-DE') for the content item. If not provided, defaults to the item's current language."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the content item was successfully updated. If false, check the error field for details."
        ),
      data: z
        .any()
        .nullable()
        .describe(
          "The updated content item data including all fields, metadata, and structure. Returns null if the operation failed."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid path, item not found, permission issues, or invalid field values."
        ),
    }),
    execute: async ({ itemId, fields, language }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.contentUpdateContent({
          path: {
            itemId: itemId,
          },
          body: {
            fields: fields,
            language: language,
          },
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          data: result?.data || null,
        };
      } catch (error) {
        console.error("[ContentTool] Error updating content item:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update content item",
          data: null,
        };
      }
    },
  });
}

// Combined export of all content tools
export const contentTools = {
  getItemContentTool,
  getContentItemByIdTool,
  updateContentItemTool,
};

// Helper function to create all content tools initialized
export function createAllContentTools(
  accessToken: string,
  contextId: string
) {
  return {
    getContentItemContent: getItemContentTool(accessToken, contextId),
    getContentItemById: getContentItemByIdTool(accessToken, contextId),
    updateContentItem: updateContentItemTool(accessToken, contextId),
  };
}