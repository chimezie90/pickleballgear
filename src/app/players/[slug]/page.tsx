import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { getPlayerBySlug } from "@/lib/data/players";
import { formatDate } from "@/lib/utils";
import { getPlacementLabel } from "@/lib/calculations";

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);

  if (!player) {
    return { title: "Player Not Found" };
  }

  return {
    title: `${player.name} | Pickleball Gear Win Tracker`,
    description: `See ${player.name}'s equipment and tournament results.`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  const totalPoints = player.matchResults.reduce((sum, r) => sum + r.points, 0);
  const totalWins = player.matchResults.filter((r) => r.placement === 1).length;

  const currentEquipment = player.equipmentUsages.filter(
    (u) => u.endDate === null
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/players" className="hover:text-primary">
            Players
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{player.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              {player.ranking && (
                <Badge variant="accent" className="mb-2">
                  World Rank #{player.ranking}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground">
                {player.name}
              </h1>
              {player.country && (
                <p className="text-lg text-muted">{player.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-8">
              <Stat label="Total Points" value={totalPoints} highlight />
              <Stat label="Total Wins" value={totalWins} />
              <Stat label="Tournaments" value={player.matchResults.length} />
            </div>
          </CardContent>
        </Card>

        {/* Current Equipment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {currentEquipment.length > 0 ? (
              <div className="space-y-3">
                {currentEquipment.map((usage) => (
                  <Link
                    key={usage.id}
                    href={`/gear/${usage.equipment.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div>
                      <Badge
                        variant={
                          usage.equipment.type === "PADDLE"
                            ? "success"
                            : "default"
                        }
                        className="mb-1"
                      >
                        {usage.equipment.type === "PADDLE" ? "Paddle" : "Shoe"}
                      </Badge>
                      <div className="font-medium text-foreground">
                        {usage.equipment.name}
                      </div>
                      <div className="text-sm text-muted">
                        {usage.equipment.brand}
                      </div>
                    </div>
                    {usage.verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-8">
                No equipment data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tournament Results</CardTitle>
          </CardHeader>
          <CardContent>
            {player.matchResults.length > 0 ? (
              <div className="space-y-3">
                {player.matchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/tournaments/${result.tournament.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {result.tournament.name}
                      </div>
                      <div className="text-sm text-muted">
                        {formatDate(new Date(result.matchDate))}
                        {result.eventType && ` | ${result.eventType}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {getPlacementLabel(result.placement)}
                      </div>
                      <div className="text-sm text-muted">
                        {result.points} pts
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-8">
                No tournament results available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
