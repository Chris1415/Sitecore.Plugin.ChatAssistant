import { NextResponse } from "next/server";
import { getBrandKitSections } from "@/lib/services/BrandServices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandkitId = searchParams.get("brandkitId");
    
    if (!brandkitId) {
      return NextResponse.json(
        { error: "brandkitId is required" },
        { status: 400 }
      );
    }
    
    const result = await getBrandKitSections(undefined, brandkitId);
    
    if (result.success && result.data) {
      return NextResponse.json(result.data);
    }
    
    return NextResponse.json(
      { error: result.error || "Failed to load sections" },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load sections" },
      { status: 500 }
    );
  }
}

