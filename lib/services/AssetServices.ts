import { createXMCClient } from "@/components/agents/base/sitecoreClient";

export interface UploadAssetParams {
  fileBase64: string;
  name: string;
  itemPath?: string;
  language?: string;
  extension: string;
  siteName: string;
  jobId?: string;
}

export interface MediaItem {
  id: string;
  embedUrl: string;
  size: number;
  dimensions: string;
  extension: string;
}

export interface UploadAssetResponse {
  success: boolean;
  mediaItem: MediaItem | null;
  error?: string;
}

/**
 * Service function to upload an asset to Sitecore
 * @param accessToken - Access token for authentication
 * @param contextId - Sitecore context ID
 * @param params - Upload parameters including base64 file data
 * @returns Upload result with media item or error
 */
export async function uploadAsset(
  accessToken: string,
  contextId: string,
  params: UploadAssetParams
): Promise<UploadAssetResponse> {
  const {
    fileBase64,
    name,
    itemPath = "/sitecore/media library/Project/solo/solo-website",
    language = "en",
    extension,
    siteName,
    jobId,
  } = params;

  console.log("[AssetServices] Starting upload with params:", {
    name,
    itemPath,
    language,
    extension,
    siteName,
    jobId,
    fileBase64Length: fileBase64.length,
    fileBase64Prefix: fileBase64.substring(0, 50),
  });

  // Convert base64 data URL to Blob
  let fileBlob: Blob;
  if (fileBase64.startsWith("data:")) {
    const response = await fetch(fileBase64);
    fileBlob = await response.blob();
  } else {
    // If it's already base64 without data URL prefix, create data URL
    const mimeType = getMimeTypeFromExtension(extension);
    const dataUrl = `data:${mimeType};base64,${fileBase64}`;
    const response = await fetch(dataUrl);
    fileBlob = await response.blob();
  }

  console.log("[AssetServices] File blob created:", {
    size: fileBlob.size,
    type: fileBlob.type,
  });

  // Create FormData
  const formData = new FormData();
  formData.append("file", fileBlob, name);

  // Create upload_request JSON
  const uploadRequest = {
    name: name,
    itemPath: itemPath,
    language: language,
    extension: extension,
    siteName: siteName,
  };
  formData.append("upload_request", JSON.stringify(uploadRequest));

  console.log(
    "[AssetServices] Upload request:",
    JSON.stringify(uploadRequest, null, 2)
  );

  try {
    const xmcClient = await createXMCClient(accessToken);

    console.log("[AssetServices] Using SDK client for upload");
    console.log("[AssetServices] File blob:", {
      size: fileBlob.size,
      type: fileBlob.type,
      name: name,
    });
    console.log("[AssetServices] Upload request string:", JSON.stringify(uploadRequest));
    
    // SDK expects body with file (Blob) and upload_request (string)
    const result = await xmcClient.agent.assetsUploadAsset({
      body: {
        file: fileBlob,
        upload_request: JSON.stringify(uploadRequest),
      },
      headers: {
        "x-sc-job-id": jobId || `job-${Date.now()}`,
      },
      query: {
        sitecoreContextId: contextId,
      },
    });

    console.log(
      "[AssetServices] SDK response received:",
      JSON.stringify(result, null, 2)
    );
    console.log(
      "[AssetServices] SDK response data:",
      JSON.stringify(result?.data, null, 2)
    );

    return {
      success: result?.data?.success || true,
      mediaItem: result?.data?.mediaItem || null,
    };
  } catch (error) {
    console.error("[AssetServices] Error uploading asset:", error);
    if (error instanceof Error) {
      console.error("[AssetServices] Error message:", error.message);
      console.error("[AssetServices] Error stack:", error.stack);
    }
    return {
      success: false,
      mediaItem: null,
      error: error instanceof Error ? error.message : "Failed to upload asset",
    };
  }
}

/**
 * Helper function to get MIME type from file extension
 */
function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
