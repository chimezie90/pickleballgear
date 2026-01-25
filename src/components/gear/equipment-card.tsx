import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import type { EquipmentWithStats } from "@/lib/types/equipment";

interface EquipmentCardProps {
  equipment: EquipmentWithStats;
  rank?: number;
}

export function EquipmentCard({ equipment, rank }: EquipmentCardProps) {
  return (
    <Link href={`/gear/${equipment.slug}`}>
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
                {equipment.name}
              </h3>
              <p className="text-sm text-muted">{equipment.brand}</p>
            </div>
            <Badge variant={equipment.type === "PADDLE" ? "success" : "default"}>
              {equipment.type === "PADDLE" ? "Paddle" : "Shoe"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <Stat label="Points" value={equipment.totalPoints} highlight />
            <Stat label="Wins" value={equipment.totalWins} />
            <Stat label="Pros" value={equipment.activeProCount} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
