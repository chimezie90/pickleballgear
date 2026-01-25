import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getRecentTournaments } from "@/lib/data/tournaments";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Tournaments | Pickleball Gear Win Tracker",
  description: "Browse pro pickleball tournaments and their results.",
};

const tierColors = {
  MAJOR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PPA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  MLP: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  APP: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default async function TournamentsPage() {
  const tournaments = await getRecentTournaments(50);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tournaments
          </h1>
          <p className="text-muted">
            Browse recent pro pickleball tournaments
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link key={tournament.id} href={`/tournaments/${tournament.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tierColors[tournament.tier]
                    }`}
                  >
                    {tournament.tier}
                  </span>
                  <h3 className="font-semibold text-foreground mt-2 mb-1">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-muted">
                    {formatDate(new Date(tournament.startDate))} -{" "}
                    {formatDate(new Date(tournament.endDate))}
                  </p>
                  {tournament.location && (
                    <p className="text-sm text-muted">{tournament.location}</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                      {tournament._count.matchResults} results recorded
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {tournaments.length === 0 && (
          <p className="text-center text-muted py-16">No tournaments found</p>
        )}
      </div>
    </div>
  );
}
