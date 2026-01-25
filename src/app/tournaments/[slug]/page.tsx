import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournamentBySlug } from "@/lib/data/tournaments";
import { formatDate } from "@/lib/utils";
import { getPlacementLabel } from "@/lib/calculations";

interface TournamentPageProps {
  params: Promise<{ slug: string }>;
}

const tierColors = {
  MAJOR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PPA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  MLP: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  APP: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export async function generateMetadata({ params }: TournamentPageProps) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    return { title: "Tournament Not Found" };
  }

  return {
    title: `${tournament.name} | Pickleball Gear Win Tracker`,
    description: `See results and equipment used at ${tournament.name}.`,
  };
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    notFound();
  }

  // Group results by event type
  const resultsByEvent = tournament.matchResults.reduce(
    (acc, result) => {
      const event = result.eventType || "Open";
      if (!acc[event]) {
        acc[event] = [];
      }
      acc[event].push(result);
      return acc;
    },
    {} as Record<string, typeof tournament.matchResults>
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
          <Link href="/tournaments" className="hover:text-primary">
            Tournaments
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{tournament.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              tierColors[tournament.tier]
            }`}
          >
            {tournament.tier}
          </span>
          <h1 className="text-3xl font-bold text-foreground mt-2 mb-2">
            {tournament.name}
          </h1>
          <p className="text-lg text-muted">
            {formatDate(new Date(tournament.startDate))} -{" "}
            {formatDate(new Date(tournament.endDate))}
          </p>
          {tournament.location && (
            <p className="text-muted">{tournament.location}</p>
          )}
        </div>

        {/* Results by Event */}
        {Object.entries(resultsByEvent).map(([event, results]) => (
          <Card key={event} className="mb-6">
            <CardHeader>
              <CardTitle>{event}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results
                  .sort((a, b) => a.placement - b.placement)
                  .map((result) => (
                    <Link
                      key={result.id}
                      href={`/players/${result.player.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            result.placement === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : result.placement === 2
                              ? "bg-gray-100 text-gray-800"
                              : result.placement === 3
                              ? "bg-orange-100 text-orange-800"
                              : "bg-muted/20 text-muted"
                          }`}
                        >
                          {result.placement}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {result.player.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {result.points} pts
                        </div>
                        <div className="text-sm text-muted">
                          {getPlacementLabel(result.placement)}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {tournament.matchResults.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <p className="text-center text-muted">
                No results recorded for this tournament
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
