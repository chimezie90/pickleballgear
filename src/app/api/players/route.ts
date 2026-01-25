import { NextRequest, NextResponse } from "next/server";
import { getAllPlayers, getPlayerBySlug } from "@/lib/data/players";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const player = await getPlayerBySlug(slug);
      if (!player) {
        return NextResponse.json(
          { error: "Player not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ player });
    }

    const players = await getAllPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    console.error("Players API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
