import { PlayerCard } from "@/components/player/player-card";
import { getPlayerLeaderboard } from "@/lib/data/players";

export const metadata = {
  title: "Player Leaderboard | Pickleball Gear Win Tracker",
  description: "See the top pro pickleball players ranked by tournament points.",
};

export default async function PlayersPage() {
  const players = await getPlayerLeaderboard(50);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Player Leaderboard
          </h1>
          <p className="text-muted">
            Top pro players ranked by tournament points
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player, index) => (
            <PlayerCard key={player.id} player={player} rank={index + 1} />
          ))}
        </div>

        {players.length === 0 && (
          <p className="text-center text-muted py-16">No players found</p>
        )}
      </div>
    </div>
  );
}
