import { NextResponse } from "next/server";
import { listBrandKits } from "@/lib/services/BrandServices";

export async function GET() {
  try {
    const result = await listBrandKits();
    
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

