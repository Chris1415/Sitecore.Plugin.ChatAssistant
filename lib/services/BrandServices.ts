import { getAccessToken } from "@/lib/oauth-login";

const BRAND_API_BASE_URL =
  "https://edge-platform.sitecorecloud.io/ai/ai-brands-api/api/brands";

const DEFAULT_ORGANIZATION_ID = "org_Yr0e8LadQ1bxB05s";
const DEFAULT_BRANDKIT_ID = "d584f742-23f5-4b68-a193-0493f9ecd135";

/**
 * Brand Kit data model from the API
 */
export interface BrandKit {
  organizationId: string;
  id: string;
  description: string;
  name: string;
  brandName: string;
  companyName: string;
  logo: string;
  status: string;
  parentId: string;
  parentType: string;
  industry: string;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  tags: unknown[];
  references: unknown[];
  deletedAt?: string;
}

/**
 * Response model for listBrandKits API
 */
export interface ListBrandKitsResponse {
  totalCount: string;
  pageSize: string;
  pageNumber: string;
  data: BrandKit[];
}

/**
 * Service function to list all brand kits for an organization
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @returns Paginated brand kit list or error
 */
export async function listBrandKits(
  organizationId: string = DEFAULT_ORGANIZATION_ID
): Promise<{
  success: boolean;
  data: ListBrandKitsResponse | null;
  error?: string;
}> {
  try {
    const token = await getAccessToken({
      clientId: process.env.SITECORE_AI_CLIENT_ID || "",
      clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
    });

    const response = await fetch(
      `${BRAND_API_BASE_URL}/v1/organizations/${organizationId}/brandkits?includeDeleted=false`,
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

    const result: ListBrandKitsResponse = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to list brand kits",
    };
  }
}

/**
 * Service function to retrieve a brand kit by ID
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @param brandkitId - Brand kit ID (defaults to DEFAULT_BRANDKIT_ID)
 * @returns Brand kit data or error
 */
export async function getBrandKit(
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  brandkitId: string = DEFAULT_BRANDKIT_ID
): Promise<{ success: boolean; data: unknown; error?: string }> {
  try {
    const token = await getAccessToken({
      clientId: process.env.SITECORE_AI_CLIENT_ID || "",
      clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
    });

    const response = await fetch(
      `${BRAND_API_BASE_URL}/v1/organizations/${organizationId}/brandkits/${brandkitId}?includeDeleted=false`,
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
          `Brand kit retrieval failed with status ${response.status}: ${response.statusText}`
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
      error:
        error instanceof Error ? error.message : "Failed to retrieve brand kit",
    };
  }
}

/**
 * Service function to list all sections in a brand kit
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @param brandkitId - Brand kit ID (defaults to DEFAULT_BRANDKIT_ID)
 * @returns Array of section objects or error
 */
export async function getBrandKitSections(
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  brandkitId: string = DEFAULT_BRANDKIT_ID
): Promise<{ success: boolean; data: unknown; error?: string }> {
  try {
    const token = await getAccessToken({
      clientId: process.env.SITECORE_AI_CLIENT_ID || "",
      clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
    });

    const response = await fetch(
      `${BRAND_API_BASE_URL}/v1/organizations/${organizationId}/brandkits/${brandkitId}/sections?includeDeleted=false`,
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
          `Brand kit sections retrieval failed with status ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      data: Array.isArray(result) ? result : result.data || [],
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to list brand kit sections",
    };
  }
}

/**
 * Service function to list all subsections (fields) in a brand kit section
 * @param sectionId - Section ID to fetch fields for
 * @param organizationId - Organization ID (defaults to DEFAULT_ORGANIZATION_ID)
 * @param brandkitId - Brand kit ID (defaults to DEFAULT_BRANDKIT_ID)
 * @returns Array of field objects or error
 */
export async function getBrandKitSubsections(
  sectionId: string,
  organizationId: string = DEFAULT_ORGANIZATION_ID,
  brandkitId: string = DEFAULT_BRANDKIT_ID
): Promise<{ success: boolean; data: unknown; error?: string }> {
  try {
    const token = await getAccessToken({
      clientId: process.env.SITECORE_AI_CLIENT_ID || "",
      clientSecret: process.env.SITECORE_AI_CLIENT_SECRET || "",
    });

    const response = await fetch(
      `${BRAND_API_BASE_URL}/v2/organizations/${organizationId}/brandkits/${brandkitId}/sections/${sectionId}/fields`,
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
          `Brand kit subsections retrieval failed with status ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      data: Array.isArray(result) ? result : result.data || [],
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to list brand kit subsections",
    };
  }
}
