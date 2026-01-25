import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { EquipmentType } from "@prisma/client";
import type { EquipmentWithStats } from "@/lib/types/equipment";

export const getEquipmentLeaderboard = unstable_cache(
  async (type: EquipmentType, limit = 10): Promise<EquipmentWithStats[]> => {
    const equipment = await prisma.equipment.findMany({
      where: {
        type,
        deletedAt: null,
      },
      include: {
        usages: {
          include: {
            player: {
              include: {
                matchResults: true,
              },
            },
          },
        },
      },
    });

    const statsMap = equipment.map((eq) => {
      let totalWins = 0;
      let totalPoints = 0;
      let activeProCount = 0;

      for (const usage of eq.usages) {
        if (usage.endDate === null) {
          activeProCount++;
        }

        for (const result of usage.player.matchResults) {
          const matchDate = new Date(result.matchDate);
          const startDate = new Date(usage.startDate);
          const endDate = usage.endDate ? new Date(usage.endDate) : new Date();

          if (matchDate >= startDate && matchDate <= endDate) {
            totalPoints += result.points;
            if (result.placement === 1) {
              totalWins++;
            }
          }
        }
      }

      return {
        id: eq.id,
        name: eq.name,
        slug: eq.slug,
        brand: eq.brand,
        type: eq.type,
        imageUrl: eq.imageUrl,
        totalWins,
        totalPoints,
        activeProCount,
      };
    });

    return statsMap.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);
  },
  ["equipment-leaderboard"],
  { revalidate: 3600, tags: ["leaderboard", "equipment"] }
);

export const getEquipmentBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.equipment.findUnique({
      where: { slug, deletedAt: null },
      include: {
        usages: {
          where: { endDate: null },
          include: {
            player: {
              select: {
                id: true,
                name: true,
                slug: true,
                ranking: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  },
  ["equipment-by-slug"],
  { revalidate: 3600, tags: ["equipment"] }
);

export const getAllEquipment = unstable_cache(
  async (type?: EquipmentType) => {
    return prisma.equipment.findMany({
      where: {
        deletedAt: null,
        ...(type && { type }),
      },
      orderBy: { name: "asc" },
    });
  },
  ["all-equipment"],
  { revalidate: 3600, tags: ["equipment"] }
);
