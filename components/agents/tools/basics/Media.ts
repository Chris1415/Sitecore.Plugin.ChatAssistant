import { Tool, tool } from "ai";
import { generateImage } from "ai";
import z from "zod";
import { uploadAsset } from "@/lib/services/AssetServices";

export function generateImageTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description:
      "Generate an image from a text prompt using AI image generation and automatically upload it to Sitecore Media Library. This tool generates high-quality images using AI models and stores them in Sitecore for use in content. The generated image is immediately available in the Media Library with the provided metadata.",
    needsApproval: true,
    inputSchema: z.object({
      prompt: z
        .string()
        .describe("The text prompt describing the image to generate"),
      assetName: z
        .string()
        .optional()
        .describe(
          "Name for the asset in Sitecore (e.g., 'generated-image.png'). If not provided, a name will be automatically generated from the prompt."
        ),
      itemPath: z
        .string()
        .optional()
        .default("/sitecore/Media Library/Images")
        .describe(
          "The path in Sitecore Media Library where the asset should be stored. Defaults to '/sitecore/Media Library/Images'."
        ),
      language: z
        .string()
        .optional()
        .default("en")
        .describe("Language code for the uploaded asset. Defaults to 'en'."),
      extension: z
        .string()
        .optional()
        .default("png")
        .describe("File extension for the uploaded asset (e.g., 'png', 'jpg'). Defaults to 'png'."),
      siteName: z
        .string()
        .describe(
          "The name of the Sitecore site where the asset should be uploaded (e.g., 'skate-park', 'website'). Required to identify the site context."
        ),
    }),
    execute: async ({
      prompt,
      assetName,
      itemPath = "/sitecore/Media Library/Images",
      language = "en",
      extension = "png",
      siteName,
    }) => {
      try {
        // Generate the image
        const result = await generateImage({
          model: "google/imagen-4.0-ultra-generate-001",
          prompt: prompt,
        });

        const imageBase64 = result.image.base64;

        // Generate asset name from prompt if not provided
        const finalAssetName =
          assetName ||
          `${prompt
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .substring(0, 50)}.${extension}`;

        // Always upload to Sitecore
        const uploadResult = await uploadAsset(accessToken, contextId, {
          fileBase64: imageBase64,
          name: finalAssetName,
          itemPath: itemPath,
          language: language,
          extension: extension,
          siteName: siteName,
        });

        if (!uploadResult.success) {
          console.error(
            "[generateImageTool] Upload failed:",
            uploadResult.error
          );
          return {
            error: uploadResult.error || "Failed to upload image to Sitecore",
            uploaded: false,
          };
        }

        return {
          success: true,
          uploaded: true,
          mediaItem: uploadResult.mediaItem,
        };
      } catch (error: unknown) {
        console.error("[generateImageTool] Error:", error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate and upload image. Please try again.",
        };
      }
    },
  });
}
