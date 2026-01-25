import { EquipmentLeaderboard } from "@/components/leaderboard/equipment-leaderboard";
import { PlayerLeaderboard } from "@/components/leaderboard/player-leaderboard";
import { getEquipmentLeaderboard } from "@/lib/data/equipment";
import { getPlayerLeaderboard } from "@/lib/data/players";

export default async function HomePage() {
  const [paddles, shoes, players] = await Promise.all([
    getEquipmentLeaderboard("PADDLE", 5),
    getEquipmentLeaderboard("SHOE", 5),
    getPlayerLeaderboard(5),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pickleball Gear
            <span className="text-primary"> Win Tracker</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Track which paddles and shoes are winning the most points on the pro
            tour. See what the best players use and how their equipment stacks
            up against the competition.
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {paddles.length + shoes.length}
              </div>
              <div className="text-sm text-muted">Equipment Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {players.length}
              </div>
              <div className="text-sm text-muted">Pro Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {paddles.reduce((sum, p) => sum + p.totalWins, 0) +
                  shoes.reduce((sum, s) => sum + s.totalWins, 0)}
              </div>
              <div className="text-sm text-muted">Total Wins Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {paddles.reduce((sum, p) => sum + p.totalPoints, 0) +
                  shoes.reduce((sum, s) => sum + s.totalPoints, 0)}
              </div>
              <div className="text-sm text-muted">Total Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Equipment Leaderboards
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <EquipmentLeaderboard
              title="Top Paddles"
              equipment={paddles}
              type="PADDLE"
            />
            <EquipmentLeaderboard
              title="Top Shoes"
              equipment={shoes}
              type="SHOE"
            />
          </div>
        </div>
      </section>

      {/* Player Leaderboard */}
      <section className="py-12 px-4 bg-muted/5">
        <div className="max-w-6xl mx-auto">
          <PlayerLeaderboard players={players} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            How Points Are Calculated
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Track Equipment</h3>
              <p className="text-sm text-muted">
                We track which paddles and shoes pro players use in tournaments.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Calculate Points</h3>
              <p className="text-sm text-muted">
                Points are awarded based on placement and tournament tier (Major
                = 2x, PPA/MLP = 1.5x).
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Aggregate Results</h3>
              <p className="text-sm text-muted">
                Equipment gets credit for all points earned while a player was
                using it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
