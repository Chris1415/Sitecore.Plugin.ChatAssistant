import z from "zod";
import { createXMCClient } from "../base/sitecoreClient";
import { Tool, tool } from "ai";

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
