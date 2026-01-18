"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageScreenshotProps {
  screenshotData: string | { screenshot_base64?: string };
}

function normalizeImageData(
  imageData: string | { screenshot_base64?: string }
): string | null {
  if (typeof imageData === "string") {
    // If it's a raw base64 string, prepend the data URL prefix
    if (!imageData.startsWith("data:image")) {
      return `data:image/png;base64,${imageData}`;
    }
    return imageData;
  } else if (
    typeof imageData === "object" &&
    imageData !== null &&
    "screenshot_base64" in imageData
  ) {
    // If it's an object with screenshot_base64 property
    const base64Data = imageData.screenshot_base64;
    if (typeof base64Data === "string") {
      if (!base64Data.startsWith("data:image")) {
        return `data:image/png;base64,${base64Data}`;
      }
      return base64Data;
    }
  }
  return null;
}

export function PageScreenshot({ screenshotData }: PageScreenshotProps) {
  const imageData = normalizeImageData(screenshotData);

  if (!imageData) {
    return null;
  }

  return (
    <Card className="my-4 w-full max-w-full">
      <CardHeader>
        <CardTitle>Page Screenshot</CardTitle>
        <CardDescription>
          Visual representation of the page content.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="relative w-full h-auto max-h-[600px] overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
          <img
            src={imageData}
            alt="Page Screenshot"
            className="max-w-full h-auto object-contain"
            onError={(e) => {
              console.error("Error loading screenshot image:", e);
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

