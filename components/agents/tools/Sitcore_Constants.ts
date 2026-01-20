import { Tool, tool } from "ai";
import z from "zod";

export function getStandardPlaceholderIdsTool(): Tool {
  return tool({
    description:
      "Get the standard placeholder IDs used in Sitecore pages. Returns an array of placeholder identifiers with descriptions that help understand their purpose and location within a page structure.",
    inputSchema: z.object({}),
    execute: async () => {
      return {
        placeholders: [
          {
            id: "headless-main",
            description:
              "The root placeholder of a page. This is the primary container where main page content and components are placed. All page-level components are typically added to this placeholder.",
          },
          {
            id: "headless-main/container-1",
            description:
              "The root container within a page. This is the first container component inside the main placeholder, providing the foundational layout structure for organizing content sections and components within the page.",
          },
        ],
      };
    },
  });
}

// Helper function to create all Sitecore constants tools
export function createAllSitecoreConstantsTools() {
  return {
    getStandardPlaceholderIds: getStandardPlaceholderIdsTool(),
  };
}

