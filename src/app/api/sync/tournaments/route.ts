import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/sync/tournaments
 * Manually trigger tournament data sync
 * Protected by CRON_SECRET for authorized access
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, return a placeholder response
    // This will be expanded when API integrations are added
    const stats = {
      message: "Tournament sync endpoint ready",
      timestamp: new Date().toISOString(),
      status: "pending_api_integration",
      note: "Configure APT_API_KEY or PPA_API_TOKEN to enable data sync",
    };

    // Check which data sources are configured
    const configuredSources = [];
    if (process.env.APT_API_KEY) {
      configuredSources.push("AllPickleballTournaments");
    }
    if (process.env.PPA_API_TOKEN) {
      configuredSources.push("PPA Tour");
    }

    // TODO: Add cache invalidation when sync logic is implemented
    // Cache tags: "tournaments", "leaderboard"

    return NextResponse.json({
      ...stats,
      configuredSources,
      syncEnabled: configuredSources.length > 0,
    });
  } catch (error) {
    console.error("Tournament sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/tournaments
 * Called by Vercel Cron for scheduled syncs
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current tournament count for reporting
    const tournamentCount = await prisma.tournament.count({
      where: { deletedAt: null },
    });

    const stats = {
      message: "Cron sync check complete",
      timestamp: new Date().toISOString(),
      currentTournaments: tournamentCount,
      nextSyncReady: !!(process.env.APT_API_KEY || process.env.PPA_API_TOKEN),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Tournament cron sync error:", error);
    return NextResponse.json(
      { error: "Cron sync failed" },
      { status: 500 }
    );
  }
}
