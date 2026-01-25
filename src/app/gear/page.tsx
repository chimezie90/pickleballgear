import Link from "next/link";
import { EquipmentCard } from "@/components/gear/equipment-card";
import { getEquipmentLeaderboard } from "@/lib/data/equipment";

export const metadata = {
  title: "Equipment Leaderboard | Pickleball Gear Win Tracker",
  description:
    "See which paddles and shoes are winning the most points on the pro pickleball tour.",
};

interface GearPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function GearPage({ searchParams }: GearPageProps) {
  const params = await searchParams;
  const type = params.type?.toUpperCase() as "PADDLE" | "SHOE" | undefined;

  const [paddles, shoes] = await Promise.all([
    type === "SHOE" ? Promise.resolve([]) : getEquipmentLeaderboard("PADDLE", 50),
    type === "PADDLE" ? Promise.resolve([]) : getEquipmentLeaderboard("SHOE", 50),
  ]);

  const allEquipment = [...paddles, ...shoes].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Equipment Leaderboard
          </h1>
          <p className="text-muted">
            Ranked by total points earned on the pro tour
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Link
            href="/gear"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !type
                ? "bg-primary text-white"
                : "bg-muted/10 text-muted hover:bg-muted/20"
            }`}
          >
            All
          </Link>
          <Link
            href="/gear?type=paddle"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "PADDLE"
                ? "bg-primary text-white"
                : "bg-muted/10 text-muted hover:bg-muted/20"
            }`}
          >
            Paddles
          </Link>
          <Link
            href="/gear?type=shoe"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "SHOE"
                ? "bg-primary text-white"
                : "bg-muted/10 text-muted hover:bg-muted/20"
            }`}
          >
            Shoes
          </Link>
        </div>

        {/* Equipment Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEquipment.map((equipment, index) => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              rank={index + 1}
            />
          ))}
        </div>

        {allEquipment.length === 0 && (
          <p className="text-center text-muted py-16">No equipment found</p>
        )}
      </div>
    </div>
  );
}
