import type { TournamentTier } from "@prisma/client";

const BASE_POINTS: Record<number, number> = {
  1: 100,
  2: 75,
  3: 50,
  4: 50,
  5: 25,
  6: 25,
  7: 25,
  8: 25,
};

const TIER_MULTIPLIERS: Record<TournamentTier, number> = {
  MAJOR: 2.0,
  PPA: 1.5,
  MLP: 1.5,
  APP: 1.0,
  OTHER: 0.5,
};

export function calculatePoints(
  placement: number,
  tier: TournamentTier
): number {
  const base = BASE_POINTS[placement] ?? (placement <= 16 ? 10 : 0);
  return Math.floor(base * TIER_MULTIPLIERS[tier]);
}

export function getPlacementLabel(placement: number): string {
  if (placement === 1) return "1st";
  if (placement === 2) return "2nd";
  if (placement === 3) return "3rd";
  return `${placement}th`;
}
