import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { PurchaseButton } from "@/components/gear/purchase-button";
import { getEquipmentBySlug, getEquipmentLeaderboard } from "@/lib/data/equipment";
import type { PaddleSpecs, ShoeSpecs } from "@/lib/types/equipment";

interface EquipmentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EquipmentPageProps) {
  const { slug } = await params;
  const equipment = await getEquipmentBySlug(slug);

  if (!equipment) {
    return { title: "Equipment Not Found" };
  }

  return {
    title: `${equipment.name} | Pickleball Gear Win Tracker`,
    description: `See how ${equipment.name} by ${equipment.brand} performs on the pro tour.`,
  };
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { slug } = await params;
  const equipment = await getEquipmentBySlug(slug);

  if (!equipment) {
    notFound();
  }

  const leaderboard = await getEquipmentLeaderboard(equipment.type, 50);
  const stats = leaderboard.find((e) => e.id === equipment.id);

  const specs = equipment.specs as PaddleSpecs | ShoeSpecs | null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/gear" className="hover:text-primary">
            Equipment
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{equipment.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant={equipment.type === "PADDLE" ? "success" : "default"}>
                {equipment.type === "PADDLE" ? "Paddle" : "Shoe"}
              </Badge>
              <h1 className="text-3xl font-bold text-foreground mt-2">
                {equipment.name}
              </h1>
              <p className="text-lg text-muted">{equipment.brand}</p>
            </div>
          </div>

          {equipment.description && (
            <p className="text-muted">{equipment.description}</p>
          )}

          {/* Purchase Button */}
          {equipment.affiliateLinks.length > 0 && (
            <div className="mt-6 max-w-xs">
              <PurchaseButton
                affiliateLinks={equipment.affiliateLinks}
                equipmentName={equipment.name}
                showAllRetailers
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-8">
              <Stat
                label="Total Points"
                value={stats?.totalPoints ?? 0}
                highlight
              />
              <Stat label="Total Wins" value={stats?.totalWins ?? 0} />
              <Stat label="Active Pros" value={stats?.activeProCount ?? 0} />
            </div>
          </CardContent>
        </Card>

        {/* Specs */}
        {specs && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {equipment.type === "PADDLE" && isPaddleSpecs(specs) && (
                  <>
                    <div>
                      <dt className="text-sm text-muted">Weight</dt>
                      <dd className="font-medium">{specs.weight} oz</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Grip Size</dt>
                      <dd className="font-medium">{specs.gripSize}&quot;</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Length</dt>
                      <dd className="font-medium">{specs.length}&quot;</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Width</dt>
                      <dd className="font-medium">{specs.width}&quot;</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Core Material</dt>
                      <dd className="font-medium capitalize">{specs.coreMaterial}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Surface</dt>
                      <dd className="font-medium capitalize">{specs.surfaceMaterial}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Core Thickness</dt>
                      <dd className="font-medium">{specs.coreThickness}mm</dd>
                    </div>
                  </>
                )}
                {equipment.type === "SHOE" && isShoeSpecs(specs) && (
                  <>
                    <div>
                      <dt className="text-sm text-muted">Weight</dt>
                      <dd className="font-medium">{specs.weight}g</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Drop Height</dt>
                      <dd className="font-medium">{specs.dropHeight}mm</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Court Type</dt>
                      <dd className="font-medium capitalize">{specs.courtType}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Pro Players Using This */}
        <Card>
          <CardHeader>
            <CardTitle>Pro Players Using This</CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.usages.length > 0 ? (
              <div className="space-y-3">
                {equipment.usages.map((usage) => (
                  <Link
                    key={usage.id}
                    href={`/players/${usage.player.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {usage.player.name}
                      </div>
                      {usage.player.ranking && (
                        <div className="text-sm text-muted">
                          Rank #{usage.player.ranking}
                        </div>
                      )}
                    </div>
                    {usage.verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-8">
                No active pro players using this equipment
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function isPaddleSpecs(specs: PaddleSpecs | ShoeSpecs): specs is PaddleSpecs {
  return "coreMaterial" in specs;
}

function isShoeSpecs(specs: PaddleSpecs | ShoeSpecs): specs is ShoeSpecs {
  return "courtType" in specs;
}
