import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { EquipmentWithStats } from "@/lib/types/equipment";

interface EquipmentLeaderboardProps {
  title: string;
  equipment: EquipmentWithStats[];
  type: "PADDLE" | "SHOE";
}

export function EquipmentLeaderboard({
  title,
  equipment,
  type,
}: EquipmentLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Link
            href={`/gear?type=${type.toLowerCase()}`}
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {equipment.map((item, index) => (
            <Link
              key={item.id}
              href={`/gear/${item.slug}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/20 text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {item.name}
                </div>
                <div className="text-sm text-muted">{item.brand}</div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-lg font-bold text-primary tabular-nums">
                    {formatNumber(item.totalPoints)}
                  </div>
                  <div className="text-xs text-muted">points</div>
                </div>
                <div className="hidden sm:block">
                  <Badge variant="success">{item.totalWins} wins</Badge>
                </div>
              </div>
            </Link>
          ))}
          {equipment.length === 0 && (
            <p className="text-center text-muted py-8">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
