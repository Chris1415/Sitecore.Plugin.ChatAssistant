/**
 * Pure utilities for tool part detection and data extraction.
 * No React/UI dependencies - safe to unit test.
 */

import type { ToolUIPart } from "ai";

// ---------------------------------------------------------------------------
// Types (exported for use by ToolPartRenderer)
// ---------------------------------------------------------------------------

export type BrandReviewSectionData = {
  sectionId: string;
  sectionName?: string;
  score: number;
  reason: string;
  suggestion: string;
  fields?: Array<{
    fieldId: string;
    fieldName?: string;
    score: number;
    reason: string;
    suggestion: string;
  }>;
};

export type AnalyticsDataPoint = {
  Day: string;
  "Number Visits": number;
  "Number Visitors": number;
};

export type ScreenshotData = string | { screenshot_base64?: string };

// ---------------------------------------------------------------------------
// Tool detection
// ---------------------------------------------------------------------------

export function getToolName(toolPart: ToolUIPart): string | undefined {
  return (toolPart as { toolName?: string }).toolName;
}

export function isAnalyticsTool(
  toolType: string,
  toolName?: string,
): boolean {
  return (
    toolType.includes("getContentAnalyticsData") ||
    toolType.includes("get-content-analytics-data") ||
    toolType.includes("getContentAnalytics") ||
    toolType.toLowerCase().includes("analytics") ||
    toolName === "getContentAnalyticsData" ||
    toolName?.includes("Analytics") === true
  );
}

export function isBrandReviewTool(
  toolType: string,
  toolName?: string,
): boolean {
  return (
    toolType.includes("generateBrandReviewFromContent") ||
    toolType.includes("generate-brand-review-from-content") ||
    toolType.includes("generateBrandReview") ||
    toolName === "generateBrandReviewFromContent"
  );
}

export function isScreenshotTool(
  toolType: string,
  toolName?: string,
): boolean {
  return (
    toolType.includes("getPageScreenshot") ||
    toolType.includes("get-page-screenshot") ||
    toolName === "getPageScreenshot"
  );
}

export function isCustomUITool(
  toolType: string,
  toolName?: string,
): boolean {
  return (
    isAnalyticsTool(toolType, toolName) ||
    isBrandReviewTool(toolType, toolName) ||
    isScreenshotTool(toolType, toolName)
  );
}

export function getToolLoadingMessage(
  toolType: string,
  toolName?: string,
): string | null {
  if (isAnalyticsTool(toolType, toolName)) return "Loading analytics data...";
  if (isBrandReviewTool(toolType, toolName))
    return "Analyzing brand compliance...";
  if (isScreenshotTool(toolType, toolName))
    return "Capturing page screenshot...";
  return null;
}

// ---------------------------------------------------------------------------
// Data extraction
// ---------------------------------------------------------------------------

function isBrandReviewSectionArray(
  value: unknown,
): value is BrandReviewSectionData[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "sectionId" in item &&
        typeof (item as { sectionId?: unknown }).sectionId === "string",
    )
  );
}

export function extractBrandReviewData(
  output: unknown,
): BrandReviewSectionData[] | null {
  if (!output || typeof output !== "object") {
    return null;
  }

  const outputRecord = output as Record<string, unknown>;

  // Supports both direct tool output ({ data: [...] }) and wrapped API shape
  const directData = outputRecord.data;
  const nestedData =
    directData && typeof directData === "object"
      ? (directData as Record<string, unknown>).data
      : null;

  if (isBrandReviewSectionArray(directData)) {
    return directData;
  }

  if (isBrandReviewSectionArray(nestedData)) {
    return nestedData;
  }

  return null;
}

export function extractAnalyticsData(
  output: unknown,
): AnalyticsDataPoint[] | null {
  if (!output || typeof output !== "object" || !("data" in output)) {
    return null;
  }
  const data = (output as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  return data as AnalyticsDataPoint[];
}

export function extractScreenshotData(output: unknown): ScreenshotData | null {
  if (
    !output ||
    typeof output !== "object" ||
    !("screenshotData" in output)
  ) {
    return null;
  }
  return (output as { screenshotData?: ScreenshotData }).screenshotData ?? null;
}
