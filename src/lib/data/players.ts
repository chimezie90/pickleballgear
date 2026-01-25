import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { PlayerWithEquipment } from "@/lib/types/equipment";

export const getPlayerLeaderboard = unstable_cache(
  async (limit = 10): Promise<PlayerWithEquipment[]> => {
    const players = await prisma.player.findMany({
      where: { deletedAt: null },
      include: {
        matchResults: true,
        equipmentUsages: {
          where: { endDate: null },
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const playersWithStats = players.map((player) => {
      const totalPoints = player.matchResults.reduce(
        (sum, r) => sum + r.points,
        0
      );
      const totalWins = player.matchResults.filter(
        (r) => r.placement === 1
      ).length;

      const currentPaddle = player.equipmentUsages.find(
        (u) => u.equipment.type === "PADDLE"
      )?.equipment;
      const currentShoes = player.equipmentUsages.find(
        (u) => u.equipment.type === "SHOE"
      )?.equipment;

      return {
        id: player.id,
        name: player.name,
        slug: player.slug,
        ranking: player.ranking,
        country: player.country,
        imageUrl: player.imageUrl,
        currentPaddle: currentPaddle
          ? {
              id: currentPaddle.id,
              name: currentPaddle.name,
              slug: currentPaddle.slug,
              brand: currentPaddle.brand,
            }
          : null,
        currentShoes: currentShoes
          ? {
              id: currentShoes.id,
              name: currentShoes.name,
              slug: currentShoes.slug,
              brand: currentShoes.brand,
            }
          : null,
        totalPoints,
        totalWins,
      };
    });

    return playersWithStats
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  },
  ["player-leaderboard"],
  { revalidate: 3600, tags: ["leaderboard", "players"] }
);

export const getPlayerBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.player.findUnique({
      where: { slug, deletedAt: null },
      include: {
        matchResults: {
          include: {
            tournament: true,
          },
          orderBy: { matchDate: "desc" },
          take: 20,
        },
        equipmentUsages: {
          include: {
            equipment: true,
          },
          orderBy: { startDate: "desc" },
        },
      },
    });
  },
  ["player-by-slug"],
  { revalidate: 3600, tags: ["players"] }
);

export const getAllPlayers = unstable_cache(
  async () => {
    return prisma.player.findMany({
      where: { deletedAt: null },
      orderBy: [{ ranking: "asc" }, { name: "asc" }],
    });
  },
  ["all-players"],
  { revalidate: 3600, tags: ["players"] }
);
