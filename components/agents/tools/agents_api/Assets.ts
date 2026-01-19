import z from "zod";
import { Tool, tool } from "ai";
import { createXMCClient } from "../../base/sitecoreClient";
import { uploadAsset } from "@/lib/services/AssetServices";

export function searchForAssetsTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Search for assets in Sitecore by query string. Returns a list of matching assets with their IDs and names. Useful for finding images, documents, or other media files stored in Sitecore. Use this tool when you need to locate assets before retrieving their detailed information.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query string to find assets. Can be a filename, partial name, or keywords related to the asset. Examples: 'logo', 'hero-image', 'product-photo.jpg', 'company-brochure'."
        ),
    }),
    execute: async ({ query }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.assetsSearchAssets({
          query: {
            query: query,
            sitecoreContextId: contextId,
          },
        });
        return {
          success: true,
          assets: result?.data || [],
          error: false,
        };
      } catch (error) {
        console.error("[AssetsTool] Error searching for assets:", error);
        return {
          success: false,
          assets: [],
          error:
            error instanceof Error
              ? error.message
              : "Failed to search for assets",
        };
      }
    },
  }) as Tool;
}

export function getAssetDetailsTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Retrieve detailed information about a specific asset in Sitecore by its asset ID. Returns comprehensive asset metadata including name, type, URL, size, dimensions (for images), and other properties. Use this tool after searching for assets to get full details about a specific asset, or when you have an asset ID from another source. Essential for understanding asset properties, dimensions, file sizes, and accessing asset URLs.",
    inputSchema: z.object({
      assetId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the asset in Sitecore. This is typically obtained from the searchForAssets tool or from other Sitecore operations. Format: GUID string (e.g., '497f6eca-6276-4993-bfeb-53cbbbba6f08'). Required to retrieve the asset's detailed information."
        ),
    }),
    execute: async ({ assetId }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const result = await xmcClient.agent.assetsGetAssetInformation({
          path: {
            assetId: assetId,
          },
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          asset: result?.data || null,
        };
      } catch (error) {
        console.error("[AssetsTool] Error getting asset details:", error);
        return {
          success: false,
          asset: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get asset details",
        };
      }
    },
  }) as Tool;
}

export function uploadAssetTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Upload a new digital asset (image, document, or media file) to Sitecore. The asset will be stored in the Media Library at the specified path with the provided metadata. Returns the uploaded asset's ID, embed URL, size, dimensions, and extension. Use this tool when you need to upload images or other media files to Sitecore, such as after generating an image or when importing assets.",
    inputSchema: z.object({
      file: z
        .string()
        .describe(
          "The file to upload as a base64-encoded string with data URL format (e.g., 'data:image/png;base64,iVBORw0KG...'). The file can be an image, document, or any media type supported by Sitecore."
        ),
      name: z
        .string()
        .describe(
          "The name of the asset including the file extension (e.g., 'homeimage.jpg', 'logo.png', 'document.pdf'). This will be the filename stored in Sitecore."
        ),
      itemPath: z
        .string()
        .optional()
        .default("/sitecore/Media Library/Images")
        .describe(
          "The path in Sitecore where the asset should be stored. Defaults to '/sitecore/Media Library/Images'. Common paths include '/sitecore/Media Library/Images', '/sitecore/Media Library/Documents', etc."
        ),
      language: z
        .string()
        .optional()
        .default("en")
        .describe(
          "The language code for the asset (e.g., 'en', 'en-US', 'de-DE'). Defaults to 'en'."
        ),
      extension: z
        .string()
        .describe(
          "The file extension of the asset without the dot (e.g., 'jpg', 'png', 'pdf', 'mp4'). This should match the actual file type."
        ),
      siteName: z
        .string()
        .describe(
          "The name of the Sitecore site where the asset should be uploaded (e.g., 'skate-park', 'website'). This identifies which site context to use."
        ),
      jobId: z
        .string()
        .optional()
        .describe(
          "Optional unique identifier for the job, used to trace, audit, and revert actions performed by an AI agent. If not provided, a default value will be used."
        ),
    }),
    execute: async ({
      file,
      name,
      itemPath = "/sitecore/Media Library/Images",
      language = "en",
      extension,
      siteName,
      jobId,
    }) => {
      // Use the asset upload service
      return await uploadAsset(accessToken, contextId, {
        fileBase64: file,
        name: name,
        itemPath: itemPath,
        language: language,
        extension: extension,
        siteName: siteName,
        jobId: jobId,
      });
    },
  }) as Tool;
}

// Combined export of all asset tools
export const assetTools = {
  searchForAssetsTool,
  getAssetDetailsTool,
  uploadAssetTool,
};

// Helper function to create all asset tools initialized
export function createAllAgentsApiAssetsTools(
  accessToken: string,
  contextId: string
) {
  return {
    searchForAssets: searchForAssetsTool(accessToken, contextId),
    getAssetDetails: getAssetDetailsTool(accessToken, contextId),
    uploadAsset: uploadAssetTool(accessToken, contextId),
  };
}
