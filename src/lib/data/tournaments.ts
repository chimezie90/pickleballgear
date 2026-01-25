import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const getRecentTournaments = unstable_cache(
  async (limit = 10) => {
    return prisma.tournament.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: "desc" },
      take: limit,
      include: {
        _count: {
          select: { matchResults: true },
        },
      },
    });
  },
  ["recent-tournaments"],
  { revalidate: 3600, tags: ["tournaments"] }
);

export const getTournamentBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.tournament.findUnique({
      where: { slug, deletedAt: null },
      include: {
        matchResults: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { placement: "asc" },
        },
      },
    });
  },
  ["tournament-by-slug"],
  { revalidate: 3600, tags: ["tournaments"] }
);

export const getAllTournaments = unstable_cache(
  async () => {
    return prisma.tournament.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: "desc" },
    });
  },
  ["all-tournaments"],
  { revalidate: 3600, tags: ["tournaments"] }
);
