import { Tool, tool } from "ai";
import z from "zod";

export function getContentPageTemplateTool(): Tool {
  return tool({
    description:
      "Retrieve the Content Page Template Item ID. This template defines the structure and fields available for content pages in Sitecore. Use this template ID when creating new content pages to ensure they have the correct field structure and are properly configured for content management.",
    inputSchema: z.object({}),
    outputSchema: z
      .string()
      .describe(
        "The Sitecore Template Item ID (GUID) for the Content Page Template. Format: GUID in curly braces like '{6C515802-F43D-4F45-B4E5-A5AAFC5DBD76}'. This template defines which fields are available on content pages and is the standard template for creating general content pages in Sitecore."
      ),
    execute: async () => {
      return "{6C515802-F43D-4F45-B4E5-A5AAFC5DBD76}";
    },
  });
}

// Combined export of all Sitecore tools
export const sitecoreTools = {
  getContentPageTemplateTool,
};

// Helper function to create all Sitecore tools initialized
export function createAllSitecoreTools() {
  return {
    getContentPageTemplate: getContentPageTemplateTool(),
  };
}

