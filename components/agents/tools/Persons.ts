import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../base/sitecoreClient";

export function getPersonsRootTool(): Tool {
  return tool({
    description:
      "Retrieve the Persons Root Page configuration including its Sitecore Item ID and content tree path. This is the parent container where all person profiles are stored. Use this ID when creating new person pages to ensure they are placed in the correct location.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      itemId: z
        .string()
        .describe(
          "The Sitecore Item ID (GUID) of the Persons Root Page. Format: GUID in curly braces. Use this as the parent ID when creating person pages."
        ),
      itemPath: z
        .string()
        .describe(
          "The full Sitecore content tree path to the Persons Root Page (e.g., '/sitecore/content/solo/solo-website/Data/Persons'). This shows where the persons section is located in the content hierarchy."
        ),
    }),
    execute: async () => {
      return {
        itemId: "{1E7816D4-FAA0-42A2-89EA-CD2965392D80}",
        itemPath: "/sitecore/content/solo/solo-website/Data/Persons",
      };
    },
  });
}

export function getPersonsTemplateTool(): Tool {
  return tool({
    description:
      "Retrieve the Persons Template Item ID. This template defines the structure and fields available for person profiles (FirstName, LastName, Image, AboutMe, etc.). Use this template ID when creating new person pages to ensure they have the correct field structure.",
    inputSchema: z.object({}),
    outputSchema: z
      .string()
      .describe(
        "The Sitecore Template Item ID (GUID) for the Persons Template. Format: GUID in curly braces like '{7C5DFE37-CDB7-4024-A84F-02DF6C0CB98D}'. This template defines which fields are available on person pages (FirstName, LastName, Image, AboutMe, etc.)."
      ),
    execute: async () => {
      return "{7C5DFE37-CDB7-4024-A84F-02DF6C0CB98D}";
    },
  });
}

export function createPersonTool(
  accessToken: string,
  contextId: string
): Tool {
  return tool({
    description: `Create a new person profile page in Sitecore. The page will be created as a child of the specified parent (typically the Persons Root Page) using the Persons Template. Required fields (FirstName, LastName, AboutMe) must be provided. The page will be created in the specified language. After creation, you can use the returned itemId to reference or update the person profile.`,
    inputSchema: z.object({
      id: z
        .string()
        .describe(
          "URL-friendly identifier/slug for the person page (e.g., 'john-doe', 'jane-smith'). Used in the page URL and must be unique. Use lowercase letters, numbers, and hyphens only."
        ),
      firstName: z
        .string()
        .describe(
          "First name of the person. This is the person's given name that appears on their profile."
        ),
      lastName: z
        .string()
        .describe(
          "Last name of the person. This is the person's family name that appears on their profile."
        ),
      aboutMe: z
        .string()
        .describe(
          "Biography or description about the person. Contains detailed information about the person's background, experience, or other relevant details. Can include HTML formatting if needed."
        ),
      image: z
        .string()
        .optional()
        .describe(
          "Image ID or URL for the person's profile picture. Optional field that can reference a media item ID or external image URL. Format: GUID in curly braces for Sitecore media items (e.g., '{BB193D88-96A7-46C9-9703-64603742D2EE}') or a full URL for external images."
        ),
      parent: z
        .string()
        .describe(
          "The Sitecore Item ID of the parent page where this person profile will be created. Typically this should be the Persons Root Page ID (use getPersonsRoot tool to retrieve it). Format: GUID in curly braces."
        ),
      template: z
        .string()
        .describe(
          "The Sitecore Template Item ID that defines the structure and fields for this person page. Typically this should be the Persons Template ID (use getPersonsTemplate tool to retrieve it). Format: GUID in curly braces like '{7C5DFE37-CDB7-4024-A84F-02DF6C0CB98D}'."
        ),
      language: z
        .string()
        .describe(
          "Language code for the person page content (e.g., 'en' for English, 'de' for German, 'fr' for French). Use ISO 639-1 two-letter language codes. This determines which language version of the page is being created."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the person page was successfully created. If false, check the error field for details about what went wrong."
        ),
      itemId: z
        .string()
        .describe(
          "The Sitecore Item ID (GUID) of the newly created person page. Format: GUID in curly braces. Use this ID to reference, update, or delete the page later. Empty string if creation failed."
        ),
      name: z
        .string()
        .describe(
          "The name/slug of the created person page. This matches the 'id' parameter provided and is used in the page URL. Useful for confirming the page was created with the correct identifier."
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
      firstName,
      lastName,
      aboutMe,
      image,
      parent,
      template,
      language,
    }) => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        
        // Build fields object, only including Image if provided
        const fieldsObject: {
          FirstName: string;
          LastName: string;
          AboutMe: string;
          Image?: string;
        } = {
          FirstName: firstName,
          LastName: lastName,
          AboutMe: aboutMe,
        };
        
        if (image) {
          // Format media item ID as XML - assume input is always a GUID
          const guid = image.trim().startsWith('{') ? image.trim() : `{${image.trim()}}`;
          fieldsObject.Image = `<image mediaid="${guid}" />`;
        }
        
        const result = await xmcClient.agent.contentCreateContentItem({
          body: {
            name: id,
            parentId: parent,
            templateId: template,
            language: language,
            fields: fieldsObject,
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
        console.error("[PersonsAgent] Error creating person page:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create person page",
          itemId: "",
          name: id,
        };
      }
    },
  });
}

// Combined export of all persons tools
export const personsTools = {
  getPersonsRootTool,
  getPersonsTemplateTool,
  createPersonTool,
};

// Helper function to create all persons tools initialized
export function createAllPersonsTools(
  accessToken: string,
  contextId: string
) {
  return {
    getPersonsRoot: getPersonsRootTool(),
    getPersonsTemplate: getPersonsTemplateTool(),
    createPerson: createPersonTool(accessToken, contextId),
  };
}

