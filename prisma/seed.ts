import { PrismaClient, TournamentTier, EquipmentType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { calculatePoints } from "../src/lib/calculations";
import { config } from "dotenv";

// Load env files - must be before accessing process.env
config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ":****@"));

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Equipment - Paddles
  const paddles = await Promise.all([
    prisma.equipment.create({
      data: {
        name: "JOOLA Ben Johns Hyperion CFS 16",
        slug: "joola-ben-johns-hyperion-cfs-16",
        brand: "JOOLA",
        type: EquipmentType.PADDLE,
        description:
          "The signature paddle of Ben Johns, featuring Carbon Friction Surface technology.",
        specs: {
          weight: 8.2,
          gripSize: 4.125,
          length: 16.5,
          width: 7.5,
          coreMaterial: "polymer",
          surfaceMaterial: "carbon",
          coreThickness: 16,
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Selkirk LUXX Control Air S2",
        slug: "selkirk-luxx-control-air-s2",
        brand: "Selkirk",
        type: EquipmentType.PADDLE,
        description:
          "Advanced paddle with control-focused design and air technology.",
        specs: {
          weight: 7.9,
          gripSize: 4.25,
          length: 16.4,
          width: 7.4,
          coreMaterial: "polymer",
          surfaceMaterial: "carbon",
          coreThickness: 14,
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Franklin Ben Johns Signature",
        slug: "franklin-ben-johns-signature",
        brand: "Franklin",
        type: EquipmentType.PADDLE,
        description: "Former signature paddle featuring MaxGrit technology.",
        specs: {
          weight: 8.0,
          gripSize: 4.125,
          length: 16.5,
          width: 7.5,
          coreMaterial: "polymer",
          surfaceMaterial: "fiberglass",
          coreThickness: 14,
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Paddletek Bantam EX-L Pro",
        slug: "paddletek-bantam-ex-l-pro",
        brand: "Paddletek",
        type: EquipmentType.PADDLE,
        description: "Professional-grade paddle with elongated design.",
        specs: {
          weight: 7.8,
          gripSize: 4.25,
          length: 16.5,
          width: 7.375,
          coreMaterial: "polymer",
          surfaceMaterial: "graphite",
          coreThickness: 13,
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Engage Pursuit Pro MX",
        slug: "engage-pursuit-pro-mx",
        brand: "Engage",
        type: EquipmentType.PADDLE,
        description: "Power-focused paddle with maximum spin potential.",
        specs: {
          weight: 8.1,
          gripSize: 4.125,
          length: 16.5,
          width: 7.5,
          coreMaterial: "polymer",
          surfaceMaterial: "carbon",
          coreThickness: 16,
        },
      },
    }),
  ]);

  // Create Equipment - Shoes
  const shoes = await Promise.all([
    prisma.equipment.create({
      data: {
        name: "K-Swiss Hypercourt Express 2",
        slug: "k-swiss-hypercourt-express-2",
        brand: "K-Swiss",
        type: EquipmentType.SHOE,
        description: "Lightweight court shoe designed for quick lateral movement.",
        specs: {
          weight: 340,
          dropHeight: 9,
          courtType: "both",
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "ASICS Gel-Rocket 11",
        slug: "asics-gel-rocket-11",
        brand: "ASICS",
        type: EquipmentType.SHOE,
        description: "Versatile court shoe with GEL cushioning technology.",
        specs: {
          weight: 320,
          dropHeight: 10,
          courtType: "indoor",
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "Nike Court Air Zoom Vapor Pro 2",
        slug: "nike-court-air-zoom-vapor-pro-2",
        brand: "Nike",
        type: EquipmentType.SHOE,
        description: "Premium court shoe with responsive Zoom Air cushioning.",
        specs: {
          weight: 365,
          dropHeight: 8,
          courtType: "outdoor",
        },
      },
    }),
    prisma.equipment.create({
      data: {
        name: "New Balance Fresh Foam LAV v2",
        slug: "new-balance-fresh-foam-lav-v2",
        brand: "New Balance",
        type: EquipmentType.SHOE,
        description: "Court shoe with Fresh Foam midsole for comfort.",
        specs: {
          weight: 355,
          dropHeight: 6,
          courtType: "both",
        },
      },
    }),
  ]);

  // Create Players
  const players = await Promise.all([
    prisma.player.create({
      data: {
        name: "Ben Johns",
        slug: "ben-johns",
        ranking: 1,
        country: "USA",
      },
    }),
    prisma.player.create({
      data: {
        name: "Tyson McGuffin",
        slug: "tyson-mcguffin",
        ranking: 2,
        country: "USA",
      },
    }),
    prisma.player.create({
      data: {
        name: "JW Johnson",
        slug: "jw-johnson",
        ranking: 3,
        country: "USA",
      },
    }),
    prisma.player.create({
      data: {
        name: "Federico Staksrud",
        slug: "federico-staksrud",
        ranking: 4,
        country: "Argentina",
      },
    }),
    prisma.player.create({
      data: {
        name: "Anna Leigh Waters",
        slug: "anna-leigh-waters",
        ranking: 1,
        country: "USA",
      },
    }),
    prisma.player.create({
      data: {
        name: "Catherine Parenteau",
        slug: "catherine-parenteau",
        ranking: 2,
        country: "Canada",
      },
    }),
  ]);

  // Create Equipment Usages (link players to their gear)
  await Promise.all([
    // Ben Johns - JOOLA paddle, K-Swiss shoes
    prisma.equipmentUsage.create({
      data: {
        playerId: players[0].id,
        equipmentId: paddles[0].id,
        startDate: new Date("2023-01-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
    prisma.equipmentUsage.create({
      data: {
        playerId: players[0].id,
        equipmentId: shoes[0].id,
        startDate: new Date("2023-01-01"),
        verified: true,
        source: "Tournament footage",
      },
    }),
    // Tyson McGuffin - Selkirk paddle, Nike shoes
    prisma.equipmentUsage.create({
      data: {
        playerId: players[1].id,
        equipmentId: paddles[1].id,
        startDate: new Date("2023-06-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
    prisma.equipmentUsage.create({
      data: {
        playerId: players[1].id,
        equipmentId: shoes[2].id,
        startDate: new Date("2023-01-01"),
        verified: false,
        source: "Tournament footage",
      },
    }),
    // JW Johnson - Engage paddle, ASICS shoes
    prisma.equipmentUsage.create({
      data: {
        playerId: players[2].id,
        equipmentId: paddles[4].id,
        startDate: new Date("2024-01-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
    prisma.equipmentUsage.create({
      data: {
        playerId: players[2].id,
        equipmentId: shoes[1].id,
        startDate: new Date("2024-01-01"),
        verified: false,
      },
    }),
    // Federico Staksrud - Paddletek paddle
    prisma.equipmentUsage.create({
      data: {
        playerId: players[3].id,
        equipmentId: paddles[3].id,
        startDate: new Date("2023-03-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
    // Anna Leigh Waters - JOOLA paddle, New Balance shoes
    prisma.equipmentUsage.create({
      data: {
        playerId: players[4].id,
        equipmentId: paddles[0].id,
        startDate: new Date("2023-01-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
    prisma.equipmentUsage.create({
      data: {
        playerId: players[4].id,
        equipmentId: shoes[3].id,
        startDate: new Date("2023-01-01"),
        verified: true,
        source: "Tournament footage",
      },
    }),
    // Catherine Parenteau - Selkirk paddle
    prisma.equipmentUsage.create({
      data: {
        playerId: players[5].id,
        equipmentId: paddles[1].id,
        startDate: new Date("2023-09-01"),
        verified: true,
        source: "Official sponsor",
      },
    }),
  ]);

  // Create Affiliate Links for equipment
  const affiliateLinks = await Promise.all([
    // JOOLA Ben Johns Hyperion - multiple retailers
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[0].id,
        retailer: "amazon",
        url: "https://www.amazon.com/JOOLA-Ben-Johns-Hyperion-Pickleball/dp/B0BQXYZ123?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[0].id,
        retailer: "justpaddles",
        url: "https://www.justpaddles.com/joola-ben-johns-hyperion?ref=pbgear",
        priority: 2,
        commission: 0.07,
        isActive: true,
      },
    }),
    // Selkirk LUXX Control Air
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[1].id,
        retailer: "selkirk",
        url: "https://www.selkirk.com/products/luxx-control-air-s2?avad=pbgear123",
        priority: 3,
        commission: 0.15,
        isActive: true,
      },
    }),
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[1].id,
        retailer: "pickleballsuperstore",
        url: "https://www.pickleballsuperstore.com/selkirk-luxx-control?aff=pbgear",
        priority: 2,
        commission: 0.32,
        isActive: true,
      },
    }),
    // Franklin Ben Johns
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[2].id,
        retailer: "amazon",
        url: "https://www.amazon.com/Franklin-Ben-Johns-Signature-Paddle/dp/B0BQABC456?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
    // Paddletek Bantam
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[3].id,
        retailer: "justpaddles",
        url: "https://www.justpaddles.com/paddletek-bantam-ex-l-pro?ref=pbgear",
        priority: 2,
        commission: 0.07,
        isActive: true,
      },
    }),
    // Engage Pursuit Pro
    prisma.affiliateLink.create({
      data: {
        equipmentId: paddles[4].id,
        retailer: "pickleballsuperstore",
        url: "https://www.pickleballsuperstore.com/engage-pursuit-pro-mx?aff=pbgear",
        priority: 2,
        commission: 0.32,
        isActive: true,
      },
    }),
    // K-Swiss shoes
    prisma.affiliateLink.create({
      data: {
        equipmentId: shoes[0].id,
        retailer: "amazon",
        url: "https://www.amazon.com/K-Swiss-Hypercourt-Express-Court-Shoe/dp/B0BQDEF789?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
    // ASICS shoes
    prisma.affiliateLink.create({
      data: {
        equipmentId: shoes[1].id,
        retailer: "amazon",
        url: "https://www.amazon.com/ASICS-Gel-Rocket-11-Volleyball-Shoe/dp/B0BQGHI012?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
    // Nike shoes
    prisma.affiliateLink.create({
      data: {
        equipmentId: shoes[2].id,
        retailer: "amazon",
        url: "https://www.amazon.com/Nike-Court-Zoom-Vapor-Tennis/dp/B0BQJKL345?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
    // New Balance shoes
    prisma.affiliateLink.create({
      data: {
        equipmentId: shoes[3].id,
        retailer: "amazon",
        url: "https://www.amazon.com/New-Balance-Fresh-Foam-Tennis/dp/B0BQMNO678?tag=pickleballgear-20",
        priority: 1,
        commission: 0.03,
        isActive: true,
      },
    }),
  ]);

  // Create Tournaments
  const tournaments = await Promise.all([
    prisma.tournament.create({
      data: {
        name: "US Open Pickleball Championships 2024",
        slug: "us-open-2024",
        tier: TournamentTier.MAJOR,
        startDate: new Date("2024-04-13"),
        endDate: new Date("2024-04-21"),
        location: "Naples, FL",
      },
    }),
    prisma.tournament.create({
      data: {
        name: "PPA Masters 2024",
        slug: "ppa-masters-2024",
        tier: TournamentTier.PPA,
        startDate: new Date("2024-03-07"),
        endDate: new Date("2024-03-10"),
        location: "Mesa, AZ",
      },
    }),
    prisma.tournament.create({
      data: {
        name: "MLP Columbus 2024",
        slug: "mlp-columbus-2024",
        tier: TournamentTier.MLP,
        startDate: new Date("2024-06-13"),
        endDate: new Date("2024-06-16"),
        location: "Columbus, OH",
      },
    }),
    prisma.tournament.create({
      data: {
        name: "APP San Clemente Open 2024",
        slug: "app-san-clemente-2024",
        tier: TournamentTier.APP,
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-02-18"),
        location: "San Clemente, CA",
      },
    }),
    prisma.tournament.create({
      data: {
        name: "Beer City Open 2024",
        slug: "beer-city-open-2024",
        tier: TournamentTier.OTHER,
        startDate: new Date("2024-07-18"),
        endDate: new Date("2024-07-21"),
        location: "Grand Rapids, MI",
      },
    }),
  ]);

  // Create Match Results
  const matchResultsData = [
    // US Open 2024 - Men's Singles
    { playerId: players[0].id, tournamentId: tournaments[0].id, placement: 1, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Men's Singles" },
    { playerId: players[1].id, tournamentId: tournaments[0].id, placement: 2, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Men's Singles" },
    { playerId: players[2].id, tournamentId: tournaments[0].id, placement: 3, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Men's Singles" },
    { playerId: players[3].id, tournamentId: tournaments[0].id, placement: 4, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Men's Singles" },
    // US Open 2024 - Women's Singles
    { playerId: players[4].id, tournamentId: tournaments[0].id, placement: 1, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Women's Singles" },
    { playerId: players[5].id, tournamentId: tournaments[0].id, placement: 2, tier: TournamentTier.MAJOR, matchDate: new Date("2024-04-21"), eventType: "Women's Singles" },
    // PPA Masters 2024
    { playerId: players[0].id, tournamentId: tournaments[1].id, placement: 1, tier: TournamentTier.PPA, matchDate: new Date("2024-03-10"), eventType: "Men's Singles" },
    { playerId: players[2].id, tournamentId: tournaments[1].id, placement: 2, tier: TournamentTier.PPA, matchDate: new Date("2024-03-10"), eventType: "Men's Singles" },
    { playerId: players[4].id, tournamentId: tournaments[1].id, placement: 1, tier: TournamentTier.PPA, matchDate: new Date("2024-03-10"), eventType: "Women's Singles" },
    // MLP Columbus
    { playerId: players[1].id, tournamentId: tournaments[2].id, placement: 1, tier: TournamentTier.MLP, matchDate: new Date("2024-06-16"), eventType: "Team" },
    { playerId: players[3].id, tournamentId: tournaments[2].id, placement: 2, tier: TournamentTier.MLP, matchDate: new Date("2024-06-16"), eventType: "Team" },
    // APP San Clemente
    { playerId: players[2].id, tournamentId: tournaments[3].id, placement: 1, tier: TournamentTier.APP, matchDate: new Date("2024-02-18"), eventType: "Men's Singles" },
    { playerId: players[5].id, tournamentId: tournaments[3].id, placement: 1, tier: TournamentTier.APP, matchDate: new Date("2024-02-18"), eventType: "Women's Singles" },
    // Beer City Open
    { playerId: players[3].id, tournamentId: tournaments[4].id, placement: 1, tier: TournamentTier.OTHER, matchDate: new Date("2024-07-21"), eventType: "Men's Singles" },
  ];

  for (const data of matchResultsData) {
    const points = calculatePoints(data.placement, data.tier);
    await prisma.matchResult.create({
      data: {
        playerId: data.playerId,
        tournamentId: data.tournamentId,
        placement: data.placement,
        points,
        matchDate: data.matchDate,
        eventType: data.eventType,
      },
    });
  }

  console.log("Seeding complete!");
  console.log(`Created ${paddles.length} paddles`);
  console.log(`Created ${shoes.length} shoes`);
  console.log(`Created ${players.length} players`);
  console.log(`Created ${tournaments.length} tournaments`);
  console.log(`Created ${matchResultsData.length} match results`);
  console.log(`Created ${affiliateLinks.length} affiliate links`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
