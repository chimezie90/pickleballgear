import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import type { PlayerWithEquipment } from "@/lib/types/equipment";

interface PlayerCardProps {
  player: PlayerWithEquipment;
  rank?: number;
}

export function PlayerCard({ player, rank }: PlayerCardProps) {
  return (
    <Link href={`/players/${player.slug}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {rank && (
                <Badge variant="accent" className="mb-2">
                  #{rank}
                </Badge>
              )}
              <h3 className="font-semibold text-foreground truncate">
                {player.name}
              </h3>
              {player.country && (
                <p className="text-sm text-muted">{player.country}</p>
              )}
            </div>
            {player.ranking && (
              <Badge variant="success">Rank #{player.ranking}</Badge>
            )}
          </div>

          {player.currentPaddle && (
            <div className="text-sm text-muted mb-4">
              <span className="font-medium">Paddle:</span>{" "}
              {player.currentPaddle.name}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <Stat label="Points" value={player.totalPoints} highlight />
            <Stat label="Wins" value={player.totalWins} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
