import { getAccessToken } from "@/lib/oauth-login";
import { Tool, tool } from "ai";
import z from "zod";
import {
  getBrandKit,
  getBrandKitSections,
  getBrandKitSubsections,
} from "@/lib/services/BrandServices";

// Base URL for Brand Management API
const BRAND_API_BASE_URL =
  "https://edge-platform.sitecorecloud.io/ai/ai-brands-api/api/brands";

// Hardcoded organization ID for testing
const DEFAULT_ORGANIZATION_ID = "org_Yr0e8LadQ1bxB05s";

// Hardcoded brandkit ID for testing (Hahn-Solo brandkit)
const DEFAULT_BRANDKIT_ID = "d584f742-23f5-4b68-a193-0493f9ecd135";

/**
 * Type definitions for Brand Kit API responses
 */

/**
 * Tag object within a brand kit
 */
const BrandKitTagSchema = z.object({
  category: z.string().describe("The category of the tag (e.g., 'audience', 'region', 'product')."),
  values: z.array(z.string()).describe("Array of tag values for this category (e.g., ['EU', 'US'])."),
});

/**
 * Section object from the Brand Kit API
 */
const BrandKitSectionSchema = z.object({
  deletable: z.boolean().describe("Whether the section can be deleted."),
  id: z.string().describe("The unique identifier (GUID) of the section."),
  name: z.string().describe("The display name of the section."),
  order: z.number().optional().describe("The display order of the section."),
  createdOn: z.string().datetime().optional().describe("ISO 8601 timestamp indicating when the section was created."),
  createdBy: z.string().optional().describe("The username or identifier of the user who created the section."),
  updatedOn: z.string().datetime().optional().describe("ISO 8601 timestamp indicating when the section was last updated."),
  updatedBy: z.string().optional().describe("The username or identifier of the user who last updated the section."),
  deletedAt: z.string().datetime().nullable().optional().describe("ISO 8601 timestamp indicating when the section was deleted (null if not deleted)."),
});

/**
 * Field (subsection) object from the Brand Kit API
 */
const BrandKitFieldSchema = z.object({
  id: z.string().describe("The unique identifier (GUID) of the field."),
  name: z.string().describe("The display name of the field."),
  type: z.string().optional().describe("The type of the field (e.g., 'text', 'image', 'url')."),
  order: z.number().optional().describe("The display order of the field."),
  value: z.string().optional().describe("The current value/content of the field."),
  intent: z.string().optional().describe("The intent or purpose of this field."),
  references: z.record(z.any()).optional().describe("Additional reference data associated with the field."),
  deletable: z.boolean().optional().describe("Whether the field can be deleted."),
  verified: z.boolean().optional().describe("Whether the field content has been verified."),
  createdOn: z.string().datetime().optional().describe("ISO 8601 timestamp indicating when the field was created."),
  createdBy: z.string().optional().describe("The username or identifier of the user who created the field."),
  updatedOn: z.string().datetime().optional().describe("ISO 8601 timestamp indicating when the field was last updated."),
  updatedBy: z.string().optional().describe("The username or identifier of the user who last updated the field."),
  aiEditable: z.boolean().optional().describe("Whether the field can be edited by AI."),
});

/**
 * Brand Kit response schema matching the API structure
 */
const BrandKitSchema = z.object({
  organizationId: z.string().describe("The unique identifier of the organization that owns this brand kit."),
  id: z.string().describe("The unique identifier (GUID) of the brand kit."),
  description: z.string().nullable().describe("A detailed description of the brand kit and its purpose. Can be null."),
  name: z.string().describe("The display name of the brand kit."),
  brandName: z.string().describe("The name of the brand associated with this brand kit."),
  companyName: z.string().nullable().optional().describe("The name of the company that owns the brand."),
  logo: z.string().url().nullable().optional().describe("URL to the brand kit's logo image."),
  status: z.string().describe("The current status of the brand kit (e.g., 'Draft', 'Published', 'Archived')."),
  parentId: z.string().nullable().optional().describe("The unique identifier of the parent brand kit if this is a child brand kit."),
  parentType: z.string().nullable().optional().describe("The type of the parent object (e.g., 'brandkit')."),
  industry: z.string().nullable().optional().describe("The industry sector this brand kit is associated with (e.g., 'retail', 'technology')."),
  createdOn: z.string().describe("Timestamp indicating when the brand kit was created (ISO 8601 format, but accepts various datetime formats)."),
  createdBy: z.string().describe("The username or identifier of the user who created the brand kit."),
  updatedOn: z.string().describe("Timestamp indicating when the brand kit was last updated (ISO 8601 format, but accepts various datetime formats)."),
  updatedBy: z.string().describe("The username or identifier of the user who last updated the brand kit."),
  tags: z.array(BrandKitTagSchema).optional().describe("Array of tag objects that categorize or label the brand kit."),
  references: z.array(z.any()).optional().describe("Array of reference objects associated with the brand kit."),
  deletedAt: z.string().nullable().optional().describe("Timestamp indicating when the brand kit was deleted (null if not deleted)."),
  locked: z.boolean().optional().describe("Indicates whether the brand kit is locked (boolean value)."),
});

/**
 * Fetches all sections for a brand kit and returns a map of sectionId -> sectionName
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @param brandkitId - Brand kit ID (defaults to DEFAULT_BRANDKIT_ID)
 * @returns Map of sectionId to sectionName
 */
async function fetchSectionNames(
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  brandkitId: string = DEFAULT_BRANDKIT_ID
): Promise<Map<string, string>> {
  const sectionNameMap = new Map<string, string>();

  try {
    const result = await getBrandKitSections(organizationId, brandkitId);
    if (result.success && result.data) {
      const sectionsArray = Array.isArray(result.data) ? result.data : [];
      sectionsArray.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (section: any) => {
          if (section.id && section.name) {
            sectionNameMap.set(section.id, section.name);
          }
        }
      );
    }
  } catch {
    // Ignore errors, return empty map
  }

  return sectionNameMap;
}

/**
 * Fetches all fields for a specific section and returns a map of fieldId -> fieldName
 * @param sectionId - Section ID to fetch fields for
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @param brandkitId - Brand kit ID (defaults to DEFAULT_BRANDKIT_ID)
 * @returns Map of fieldId to fieldName
 */
async function fetchFieldNames(
  sectionId: string,
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  brandkitId: string = DEFAULT_BRANDKIT_ID
): Promise<Map<string, string>> {
  const fieldNameMap = new Map<string, string>();

  try {
    const result = await getBrandKitSubsections(sectionId, organizationId, brandkitId);
    if (result.success && result.data) {
      const fieldsArray = Array.isArray(result.data) ? result.data : [];
      fieldsArray.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (field: any) => {
          if (field.id && field.name) {
            fieldNameMap.set(field.id, field.name);
          }
        }
      );
    }
  } catch {
    // Ignore errors, return empty map
  }

  return fieldNameMap;
}

/**
 * Shared output schema for brand review tools
 */
const BrandReviewOutputSchema = z.object({
  success: z
    .boolean()
    .describe(
      "Indicates whether the brand review was successfully generated. If false, check the error field for details."
    ),
  brandKitId: z
    .string()
    .describe(
      "The unique identifier (GUID) of the brand kit that was used for this review."
    ),
  data: z
    .array(
      z.object({
        sectionId: z
          .string()
          .describe(
            "The unique identifier (GUID) of the section that was reviewed."
          ),
        sectionName: z
          .string()
          .optional()
          .describe(
            "The human-readable name of the section (e.g., 'Digital Standards', 'Brand Context', 'Tone of Voice')."
          ),
        score: z
          .number()
          .describe(
            "The compliance score for this section (typically 1-5, where higher is better). Lower scores indicate areas needing improvement."
          ),
        reason: z
          .string()
          .describe(
            "Explanation of why this score was assigned, describing what aspects were evaluated and what was found."
          ),
        suggestion: z
          .string()
          .describe(
            "Recommendation for improving brand compliance in this section, providing actionable guidance."
          ),
        fields: z
          .array(
            z.object({
              fieldId: z
                .string()
                .describe(
                  "The unique identifier (GUID) of the specific field within the section that was evaluated."
                ),
              fieldName: z
                .string()
                .optional()
                .describe(
                  "The human-readable name of the field (e.g., 'SEO', 'Accessibility', 'Velocity')."
                ),
              score: z
                .number()
                .describe(
                  "The compliance score for this specific field (typically 1-5, where higher is better)."
                ),
              reason: z
                .string()
                .describe(
                  "Explanation of why this field received this score, describing what was evaluated."
                ),
              suggestion: z
                .string()
                .describe(
                  "Specific recommendation for improving this field's compliance with brand guidelines."
                ),
            })
          )
          .optional()
          .describe(
            "Array of field-level evaluations within this section. Each field represents a specific aspect of the brand guidelines that was assessed."
          ),
      })
    )
    .nullable()
    .describe(
      "Array of section review results. Each section contains a score, reason, suggestion, and optional field-level details. The review analyzes brand compliance across different sections of the brand guidelines. Returns null if the operation failed."
    ),
  error: z
    .string()
    .optional()
    .describe(
      "Error message describing what went wrong if success is false. Common errors include invalid brand kit ID, section ID, authentication issues, or API problems."
    ),
});

/**
 * Shared function to execute brand review API call and enrich results
 */
async function executeBrandReview(
  token: string,
  requestBody: {
    brandkitId: string;
    sections?: Array<{ sectionId: string }>;
    input: {
      businessName: string;
      businessUrl?: string;
      content?: string;
    };
  }
): Promise<{ success: boolean; brandKitId: string; data: unknown; error?: string }> {
  try {
    const response = await fetch(
      "https://ai-skills-api-euw.sitecorecloud.io/api/skills/v1/brandreview/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-sc-feature": "brandreview",
          "x-sc-interaction-type": "generate",
          "x-sc-sellable-product": "contenthubdam",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error ||
          `Brand review generation failed with status ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0) {
      try {
        const sectionNameMap = await fetchSectionNames(
          DEFAULT_ORGANIZATION_ID,
          requestBody.brandkitId
        );

        const enrichedResult = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result.map(async (section: any) => {
            const enrichedSection = {
              ...section,
              sectionName: sectionNameMap.get(section.sectionId) || undefined,
            };

            if (section.fields && Array.isArray(section.fields) && section.fields.length > 0) {
              const fieldNameMap = await fetchFieldNames(
                section.sectionId,
                DEFAULT_ORGANIZATION_ID,
                requestBody.brandkitId
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              enrichedSection.fields = section.fields.map((field: any) => ({
                ...field,
                fieldName: fieldNameMap.get(field.fieldId) || undefined,
              }));
            }

            return enrichedSection;
          })
        );

        return {
          success: true,
          brandKitId: requestBody.brandkitId,
          data: enrichedResult,
        };
      } catch (error) {
        // Return original result if enrichment fails
        console.error("Error enriching brand review result:", error);
        return {
          success: true,
          brandKitId: requestBody.brandkitId,
          data: result,
        };
      }
    }

    return {
      success: true,
      brandKitId: requestBody.brandkitId,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      brandKitId: requestBody.brandkitId,
      data: null,
      error: error instanceof Error ? error.message : "Failed to generate brand review",
    };
  }
}

/**
 * Generate a brand review from a URL
 */
export function generateBrandReviewFromUrlTool(): Tool {
  return tool({
    description:
      "Generate a brand review from a URL using Sitecore AI Skills API. Analyzes the content at the provided URL against brand guidelines. Useful for validating website content against brand guidelines or getting brand compliance insights for web pages.",
    inputSchema: z.object({
      brandkitId: z
        .string()
        .optional()
        .describe(
          "The unique identifier (GUID) of the brand kit to use for the review. Format: GUID string (e.g., '729af2a0-6492-4d29-9729-a6a195059c59'). IMPORTANT: A brand kit must be selected from the dropdown menu in the chat interface. Do not use a default value - the user must explicitly select a brand kit."
        ),
      sections: z
        .array(
          z.object({
            sectionId: z
              .string()
              .describe(
                "The unique identifier (GUID) of the section within the brand kit to review. Format: GUID string (e.g., '58034e67-7c32-4c34-8044-233fd56a32e1')."
              ),
          })
        )
        .optional()
        .describe(
          "Optional array of section objects to include in the brand review. Each section represents a specific part of the brand guidelines to analyze. If not provided, all sections in the brand kit will be reviewed."
        ),
      businessName: z
        .string()
        .optional()
        .describe(
          "The name of the business or brand being reviewed. This helps contextualize the review. Defaults to 'Hahn-Solo' if not provided."
        ),
      businessUrl: z
        .string()
        .describe(
          "The URL of the business website to review. Can be a full URL or a relative path. If relative, it will be appended to the base URL 'https://my-sitecoreai-devex-journey-editing.vercel.app/'."
        ),
    }),
    outputSchema: BrandReviewOutputSchema,
    execute: async ({
      brandkitId,
      sections,
      businessName: _businessName, // eslint-disable-line @typescript-eslint/no-unused-vars
      businessUrl,
    }) => {
      // Validate that a brand kit is selected (not using default)
      if (!brandkitId || brandkitId === DEFAULT_BRANDKIT_ID) {
        return {
          success: false,
          brandKitId: "",
          data: null,
          error: "Please select a brand kit from the dropdown menu before generating a brand review. A brand kit selection is required to proceed.",
        };
      }

      const token = await getAccessToken({
        clientId: process.env.SITECORE_AI_CLIENT_ID || "",
        clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
      });

      const baseUrl = "https://my-sitecoreai-devex-journey-editing.vercel.app";
      const resolvedBusinessUrl =
        businessUrl.startsWith("http://") || businessUrl.startsWith("https://")
          ? businessUrl
          : `${baseUrl}${businessUrl.startsWith("/") ? businessUrl : `/${businessUrl}`}`;

      const requestBody: {
        brandkitId: string;
        sections?: Array<{ sectionId: string }>;
        input: {
          businessName: string;
          businessUrl: string;
        };
      } = {
        brandkitId: brandkitId,
        input: {
          businessName: "Hahn-Solo",
          businessUrl: resolvedBusinessUrl,
        },
      };

      if (sections && sections.length > 0) {
        requestBody.sections = sections.map((section) => ({
          sectionId: section.sectionId,
        }));
      }

      return executeBrandReview(token, requestBody);
    },
  }) as Tool;
}

/**
 * Generate a brand review from content
 */
export function generateBrandReviewFromContentTool(): Tool {
  return tool({
    description:
      "Generate a brand review from content using Sitecore AI Skills API. Analyzes the provided content (HTML, text, etc.) against brand guidelines. Useful for validating content against brand guidelines or getting brand compliance insights before publishing.",
    inputSchema: z.object({
      brandkitId: z
        .string()
        .optional()
        .describe(
          "The unique identifier (GUID) of the brand kit to use for the review. Format: GUID string (e.g., '729af2a0-6492-4d29-9729-a6a195059c59'). IMPORTANT: A brand kit must be selected from the dropdown menu in the chat interface. Do not use a default value - the user must explicitly select a brand kit."
        ),
      sections: z
        .array(
          z.object({
            sectionId: z
              .string()
              .describe(
                "The unique identifier (GUID) of the section within the brand kit to review. Format: GUID string (e.g., '58034e67-7c32-4c34-8044-233fd56a32e1')."
              ),
          })
        )
        .optional()
        .describe(
          "Optional array of section objects to include in the brand review. Each section represents a specific part of the brand guidelines to analyze. If not provided, all sections in the brand kit will be reviewed."
        ),
      businessName: z
        .string()
        .optional()
        .describe(
          "The name of the business or brand being reviewed. This helps contextualize the review. Defaults to 'Hahn-Solo' if not provided."
        ),
      content: z
        .string()
        .describe(
          "The content to review against brand guidelines. This can be HTML, text, or any content that should be analyzed for brand compliance."
        ),
    }),
    outputSchema: BrandReviewOutputSchema,
    execute: async ({
      brandkitId,
      sections,
      businessName: _businessName, // eslint-disable-line @typescript-eslint/no-unused-vars
      content,
    }) => {
      // Validate that a brand kit is selected (not using default)
      if (!brandkitId) {
        return {
          success: false,
          brandKitId: "",
          data: null,
          error: "Please select a brand kit from the dropdown menu before generating a brand review. A brand kit selection is required to proceed.",
        };
      }

      const token = await getAccessToken({
        clientId: process.env.SITECORE_AI_CLIENT_ID || "",
        clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
      });

      const requestBody: {
        brandkitId: string;
        sections?: Array<{ sectionId: string }>;
        input: {
          businessName: string;
          content: string;
        };
      } = {
        brandkitId: brandkitId,
        input: {
          businessName: "Hahn-Solo",
          content,
        },
      };

      if (sections && sections.length > 0) {
        requestBody.sections = sections.map((section) => ({
          sectionId: section.sectionId,
        }));
      }

      return executeBrandReview(token, requestBody);
    },
  }) as Tool;
}

/**
 * List all brand kits for an organization
 * GET /api/brands/v1/organizations/{organizationId}/brandkits
 */
export function listBrandKitsTool(): Tool {
  return tool({
    description:
      "Retrieve a list of all brand kits within a specific organization. Returns paginated results with brand kit metadata including name, description, status, and other properties. Uses the default organization. Use this tool to discover available brand kits before retrieving details or generating brand reviews.",
    // @ts-expect-error - AI SDK tool type inference issue with complex schemas
    inputSchema: z.object({}),
    // @ts-expect-error - AI SDK tool type inference issue with complex schemas
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the brand kits were successfully retrieved. If false, check the error field for details."
        ),
      data: z
        .object({
          totalCount: z.string().describe("Total number of brand kits matching the query."),
          pageSize: z.string().describe("Number of items per page in the response."),
          pageNumber: z.string().describe("Current page number in the paginated results."),
          data: z
            .array(BrandKitSchema)
            .describe("Array of brand kit objects. Each brand kit contains comprehensive information including ID, name, description, organization ID, status, tags, timestamps, and other metadata."),
        })
        .nullable()
        .describe(
          "Paginated brand kit list response. Contains pagination metadata (totalCount, pageSize, pageNumber) and an array of brand kit objects. Returns null if the operation failed."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid organization ID, authentication issues, or API problems."
        ),
    }),
    // @ts-expect-error - AI SDK tool type inference issue with complex schemas
    execute: async () => {
      try {
        const token = await getAccessToken({
        clientId: process.env.SITECORE_AI_CLIENT_ID || "",
        clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
      });

        const response = await fetch(
          `${BRAND_API_BASE_URL}/v1/organizations/${DEFAULT_ORGANIZATION_ID}/brandkits?includeDeleted=false`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.error ||
              `Brand kits listing failed with status ${response.status}: ${response.statusText}`
          );
        }

        const result = await response.json();

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : "Failed to list brand kits",
        };
      }
    },
  }) as Tool;
}

/**
 * Retrieve a brand kit by ID
 * GET /api/brands/v1/organizations/{organizationId}/brandkits/{brandkitId}
 */
export function retrieveBrandKitTool(): Tool {
  return tool({
    description:
      "Retrieve detailed information about a specific brand kit by its ID. Returns comprehensive brand kit metadata including name, description, organization ID, status, tags, and other properties. Uses the default Hahn-Solo brandkit. Use this tool to get full details about the brand kit before using it in brand reviews or other operations.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the brand kit was successfully retrieved. If false, check the error field for details."
        ),
      data: BrandKitSchema.nullable().describe(
        "The brand kit data returned from the API. Contains comprehensive information about the brand kit including ID, name, description, organization ID, status, tags, timestamps, and other metadata. Returns null if the operation failed."
      ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid brand kit ID, organization ID, authentication issues, or API problems."
        ),
    }),
    execute: async () => {
      const result = await getBrandKit();
      if (result.success && result.data) {
        const parseResult = BrandKitSchema.safeParse(result.data);
        return {
          success: true,
          data: parseResult.success ? parseResult.data : result.data,
        };
      }
      return result;
    },
  }) as Tool;
}

/**
 * List all sections in a brand kit
 * GET /api/brands/v1/organizations/{organizationId}/brandkits/{brandkitId}/sections
 */
export function listBrandKitSectionsTool(): Tool {
  return tool({
    description:
      "Retrieve a list of all sections within a specific brand kit. Returns an array of section objects with their IDs, names, and metadata. Sections represent different parts of the brand guidelines (e.g., Digital Standards, Brand Context, Dos and Don'ts, Tone of Voice). Uses the default Hahn-Solo brandkit. Use this tool to discover available sections before generating brand reviews or working with specific sections.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the sections were successfully retrieved. If false, check the error field for details."
        ),
      data: z
        .array(BrandKitSectionSchema)
        .nullable()
        .describe(
          "Array of section objects. Each section contains information like id, name, order, timestamps, and other metadata. Returns null if the operation failed."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid brand kit ID, organization ID, authentication issues, or API problems."
        ),
    }),
    execute: async () => {
      return getBrandKitSections();
    },
  }) as Tool;
}

/**
 * List all subsections (fields) in a brand kit section
 * GET /api/brands/v2/organizations/{organizationId}/brandkits/{brandkitId}/sections/{sectionId}/fields
 */
export function listBrandKitSubsectionsTool(): Tool {
  return tool({
    description:
      "Retrieve a list of all subsections (fields) within a specific section of a brand kit. Returns an array of field objects with their IDs, names, and metadata. Fields represent specific aspects or properties within a section (e.g., within 'Digital Standards' section, there might be fields for SEO, Accessibility, Velocity). Uses the default Hahn-Solo brandkit. Use this tool to discover available fields within a section before generating detailed brand reviews.",
    inputSchema: z.object({
      sectionId: z
        .string()
        .describe(
          "The unique identifier (GUID) of the section within the brand kit. Format: GUID string (e.g., 'cbdc5db4-92d9-4858-b5e6-c44c9952e8f8'). Use listBrandKitSectionsTool to get available section IDs."
        ),
    }),
    outputSchema: z.object({
      success: z
        .boolean()
        .describe(
          "Indicates whether the subsections were successfully retrieved. If false, check the error field for details."
        ),
      data: z
        .array(BrandKitFieldSchema)
        .nullable()
        .describe(
          "Array of field (subsection) objects. Each field contains information like id, name, type, value, intent, order, timestamps, and other metadata. Returns null if the operation failed."
        ),
      error: z
        .string()
        .optional()
        .describe(
          "Error message describing what went wrong if success is false. Common errors include invalid section ID, brand kit ID, organization ID, authentication issues, or API problems."
        ),
    }),
    execute: async ({ sectionId }) => {
      return getBrandKitSubsections(sectionId);
    },
  }) as Tool;
}
