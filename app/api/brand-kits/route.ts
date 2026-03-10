import { NextResponse } from "next/server";
import { listBrandKits } from "@/lib/services/BrandServices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const result = await listBrandKits(organizationId);
    
    if (result.success && result.data) {
      return NextResponse.json(result.data);
    }
    
    return NextResponse.json(
      { error: result.error || "Failed to load brand kits" },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load brand kits" },
      { status: 500 }
    );
  }
}

