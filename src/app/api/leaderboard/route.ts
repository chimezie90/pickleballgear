import { NextRequest, NextResponse } from "next/server";
import { getEquipmentLeaderboard } from "@/lib/data/equipment";
import { getPlayerLeaderboard } from "@/lib/data/players";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type")?.toUpperCase() as
    | "PADDLE"
    | "SHOE"
    | "PLAYER"
    | null;
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);

  try {
    if (type === "PLAYER") {
      const players = await getPlayerLeaderboard(limit);
      return NextResponse.json({ players });
    }

    if (type === "PADDLE" || type === "SHOE") {
      const equipment = await getEquipmentLeaderboard(type, limit);
      return NextResponse.json({ equipment });
    }

    // Return all leaderboards
    const [paddles, shoes, players] = await Promise.all([
      getEquipmentLeaderboard("PADDLE", limit),
      getEquipmentLeaderboard("SHOE", limit),
      getPlayerLeaderboard(limit),
    ]);

    return NextResponse.json({ paddles, shoes, players });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
