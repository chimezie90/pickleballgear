import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { PlayerWithEquipment } from "@/lib/types/equipment";

interface PlayerLeaderboardProps {
  players: PlayerWithEquipment[];
}

export function PlayerLeaderboard({ players }: PlayerLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Players</CardTitle>
          <Link
            href="/players"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player, index) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/20 text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {player.name}
                </div>
                <div className="text-sm text-muted flex items-center gap-2">
                  {player.country && <span>{player.country}</span>}
                  {player.currentPaddle && (
                    <>
                      <span className="text-muted/50">|</span>
                      <span>{player.currentPaddle.brand}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-lg font-bold text-primary tabular-nums">
                    {formatNumber(player.totalPoints)}
                  </div>
                  <div className="text-xs text-muted">points</div>
                </div>
                <div className="hidden sm:block">
                  <Badge variant="accent">{player.totalWins} wins</Badge>
                </div>
              </div>
            </Link>
          ))}
          {players.length === 0 && (
            <p className="text-center text-muted py-8">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
