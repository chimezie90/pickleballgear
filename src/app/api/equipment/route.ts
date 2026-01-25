import { NextRequest, NextResponse } from "next/server";
import { getAllEquipment, getEquipmentBySlug } from "@/lib/data/equipment";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type")?.toUpperCase() as
    | "PADDLE"
    | "SHOE"
    | undefined;
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const equipment = await getEquipmentBySlug(slug);
      if (!equipment) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ equipment });
    }

    const equipment = await getAllEquipment(type);
    return NextResponse.json({ equipment });
  } catch (error) {
    console.error("Equipment API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}
