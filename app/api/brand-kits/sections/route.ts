import { NextResponse } from "next/server";
import { getBrandKitSections } from "@/lib/services/BrandServices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandkitId = searchParams.get("brandkitId");
    const organizationId = searchParams.get("organizationId");
    
    if (!brandkitId) {
      return NextResponse.json(
        { error: "brandkitId is required" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
    
    const result = await getBrandKitSections(organizationId, brandkitId);
    
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

