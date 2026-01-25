# feat: Pickleball Gear Win Tracker

Track pickleball equipment (paddles, shoes) used by professional players and aggregate win statistics to create equipment performance rankings.

## Enhancement Summary

**Deepened on:** 2026-01-25
**Research agents used:** 10 (architecture, performance, security, simplicity, TypeScript, data-integrity, patterns, best-practices, agent-native, frontend-design)

### Key Improvements
1. **Added API layer** for agent-native architecture (critical gap identified)
2. **Added data access layer** (`lib/data/`) for query encapsulation
3. **Fixed data integrity issues** - removed redundant `isCurrent` field, added composite indexes
4. **Added caching strategy** with `unstable_cache` and ISR
5. **Added type definitions** for JSON specs field
6. **Added security measures** - input validation, rate limiting, CSP headers

### Critical Changes from Review
- Route params use `[slug]` not `[id]` for SEO
- Remove `isCurrent` field (derive from `endDate IS NULL`)
- Add API routes for every user-facing feature
- Add composite indexes for temporal joins
- Use Neon connection pooling

---

## Overview

Build a website that answers: **"Which pickleball gear wins the most?"**

No existing site aggregates tournament wins by equipment - this is the unique value proposition.

## Problem Statement

Pickleball players want to know what gear the pros use and which equipment performs best. Current sites (The Slice, NoVolleys, Johnkew) track specs and player usage but don't aggregate tournament performance by equipment.

## Proposed Solution

A Next.js application with:
1. **Equipment leaderboards** - Paddles and shoes ranked by cumulative pro wins
2. **Player profiles** - Current gear loadout and equipment history
3. **Tournament results** - Match outcomes with equipment attribution
4. **Public API** - JSON endpoints for programmatic access

## Technical Approach

### Architecture

```
src/
├── app/
│   ├── page.tsx                    # Homepage with leaderboards
│   ├── layout.tsx                  # Root layout with metadata
│   ├── globals.css                 # Tailwind v4 theme
│   ├── error.tsx                   # Global error boundary
│   ├── not-found.tsx               # 404 page
│   ├── gear/
│   │   ├── page.tsx                # All equipment (filterable)
│   │   └── [slug]/page.tsx         # Equipment detail
│   ├── players/
│   │   └── [slug]/page.tsx         # Player profile
│   ├── tournaments/
│   │   ├── page.tsx                # Tournament list
│   │   └── [slug]/page.tsx         # Tournament results
│   └── api/                        # API routes (agent-native)
│       ├── equipment/
│       │   ├── route.ts            # GET /api/equipment
│       │   └── [slug]/route.ts     # GET /api/equipment/:slug
│       ├── players/
│       │   └── [slug]/route.ts     # GET /api/players/:slug
│       ├── leaderboard/route.ts    # GET /api/leaderboard
│       └── search/route.ts         # GET /api/search
├── components/
│   ├── ui/                         # Card, Badge, DataTable, Skeleton
│   ├── leaderboard/                # LeaderboardSection, LeaderboardRow
│   ├── gear/                       # GearCard, GearStats
│   ├── player/                     # PlayerCard, GearLoadout
│   └── tournament/                 # TournamentCard, ResultsTable
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── utils.ts                    # cn() helper
│   ├── calculations.ts             # Points calculation logic
│   ├── validation.ts               # Zod schemas
│   ├── rate-limit.ts               # Rate limiting
│   ├── types/
│   │   ├── equipment.ts            # PaddleSpecs, ShoeSpecs
│   │   └── api.ts                  # API response types
│   └── data/                       # Data access layer
│       ├── equipment.ts            # getEquipmentLeaderboard()
│       ├── players.ts              # getPlayerBySlug()
│       └── tournaments.ts          # getTournamentResults()
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Neon with connection pooling) |
| ORM | Prisma |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Deployment | Vercel |

### Research Insights: Next.js 15 Patterns

**Caching Changes (Breaking):**
- Fetch requests are NOT cached by default - must opt-in with `{ next: { revalidate: N } }`
- Use `unstable_cache` for database queries
- ISR via `export const revalidate = 3600`

**Server Components Pattern:**
```typescript
// app/page.tsx - Server Component (no "use client")
export const revalidate = 3600; // ISR every hour

export default async function HomePage() {
  const [paddles, shoes] = await Promise.all([
    getCachedLeaderboard('PADDLE'),
    getCachedLeaderboard('SHOES'),
  ]);

  return (
    <main>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardSection type="PADDLE" data={paddles} />
      </Suspense>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardSection type="SHOES" data={shoes} />
      </Suspense>
    </main>
  );
}
```

---

### Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // Pooled connection
  directUrl = env("DIRECT_URL")          // Direct for migrations
}

model Player {
  id              String            @id @default(cuid())
  name            String
  slug            String            @unique
  ranking         Int?
  country         String?
  imageUrl        String?
  deletedAt       DateTime?         // Soft delete
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  equipmentUsages EquipmentUsage[]
  matchResults    MatchResult[]

  @@index([slug])
  @@index([deletedAt])
}

model Equipment {
  id              String            @id @default(cuid())
  name            String
  slug            String            @unique
  brand           String
  type            EquipmentType
  imageUrl        String?
  description     String?
  specs           Json?             // Typed as PaddleSpecs | ShoeSpecs
  deletedAt       DateTime?         // Soft delete
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  usages          EquipmentUsage[]

  @@index([type, brand])
  @@index([slug])
  @@index([deletedAt])
}

enum EquipmentType {
  PADDLE
  SHOES
}

model EquipmentUsage {
  id            String     @id @default(cuid())
  playerId      String
  equipmentId   String
  startDate     DateTime   @default(now())
  endDate       DateTime?  // NULL = currently in use (replaces isCurrent)
  verified      Boolean    @default(false)
  source        String?    // "sponsor", "observed", "self-reported"

  player        Player     @relation(fields: [playerId], references: [id], onDelete: Restrict)
  equipment     Equipment  @relation(fields: [equipmentId], references: [id], onDelete: Restrict)

  @@unique([playerId, equipmentId, startDate])
  @@index([playerId, startDate, endDate])  // Composite for temporal joins
  @@index([equipmentId])
}

model Tournament {
  id            String          @id @default(cuid())
  name          String
  slug          String          @unique
  location      String?
  startDate     DateTime
  endDate       DateTime?
  tier          TournamentTier
  createdAt     DateTime        @default(now())

  matchResults  MatchResult[]

  @@index([slug])
  @@index([startDate])
}

enum TournamentTier {
  MAJOR
  PPA
  MLP
  APP
  OTHER
}

model MatchResult {
  id            String          @id @default(cuid())
  tournamentId  String
  playerId      String
  placement     Int             // CHECK (placement >= 1)
  points        Int             // CHECK (points >= 0)
  category      MatchCategory
  matchDate     DateTime
  createdAt     DateTime        @default(now())

  tournament    Tournament      @relation(fields: [tournamentId], references: [id], onDelete: Restrict)
  player        Player          @relation(fields: [playerId], references: [id], onDelete: Restrict)

  @@index([playerId, matchDate])  // Composite for temporal attribution
  @@index([tournamentId])
}

enum MatchCategory {
  MENS_SINGLES
  WOMENS_SINGLES
  MENS_DOUBLES
  WOMENS_DOUBLES
  MIXED_DOUBLES
}
```

### Research Insights: Data Integrity

**Critical Fix - Remove `isCurrent`:**
The `isCurrent` field is redundant with `endDate IS NULL`. Remove it to prevent data inconsistency.

```typescript
// Query for current equipment
const currentGear = await prisma.equipmentUsage.findMany({
  where: { playerId, endDate: null }
});
```

**Add PostgreSQL Check Constraints (migration):**
```sql
ALTER TABLE "MatchResult" ADD CONSTRAINT "valid_placement" CHECK (placement >= 1);
ALTER TABLE "MatchResult" ADD CONSTRAINT "valid_points" CHECK (points >= 0);
ALTER TABLE "EquipmentUsage" ADD CONSTRAINT "valid_date_range"
  CHECK (end_date IS NULL OR end_date > start_date);
```

---

### Type Definitions

```typescript
// lib/types/equipment.ts
export interface PaddleSpecs {
  weight: number;           // in ounces
  gripSize: number;         // circumference in inches
  length: number;           // in inches
  width: number;            // in inches
  coreMaterial: 'polymer' | 'nomex' | 'aluminum';
  surfaceMaterial: 'carbon' | 'fiberglass' | 'graphite' | 'composite';
  coreThickness: number;    // in mm
  swingWeight?: number;
}

export interface ShoeSpecs {
  weight: number;           // in ounces
  dropHeight: number;       // heel-to-toe drop in mm
  courtType: 'indoor' | 'outdoor' | 'both';
}

export type EquipmentSpecs = PaddleSpecs | ShoeSpecs;

// lib/types/api.ts
export interface EquipmentWithStats {
  id: string;
  name: string;
  slug: string;
  brand: string;
  type: EquipmentType;
  totalWins: number;
  totalPoints: number;
  activeProCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  equipment: EquipmentWithStats;
  trend?: 'up' | 'down' | 'stable';
}
```

---

### Points Calculation System

```typescript
// lib/calculations.ts
import type { TournamentTier } from '@prisma/client';

const BASE_POINTS = {
  1: 100,   // Winner
  2: 75,    // Runner-up
  3: 50, 4: 50,              // Semifinals
  5: 25, 6: 25, 7: 25, 8: 25, // Quarterfinals
} as const satisfies Record<number, number>;

const TIER_MULTIPLIERS = {
  MAJOR: 2.0,
  PPA: 1.5,
  MLP: 1.5,
  APP: 1.0,
  OTHER: 0.5,
} as const satisfies Record<TournamentTier, number>;

export function calculatePoints(placement: number, tier: TournamentTier): number {
  const base = BASE_POINTS[placement as keyof typeof BASE_POINTS]
    ?? (placement <= 16 ? 10 : 0);
  return Math.floor(base * TIER_MULTIPLIERS[tier]);
}
```

**Doubles Attribution:** Both partners' equipment receives full points.

---

### Data Access Layer

```typescript
// lib/data/equipment.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import type { EquipmentType } from '@prisma/client';
import type { EquipmentWithStats } from '@/lib/types/api';

export const getCachedLeaderboard = unstable_cache(
  async (type: EquipmentType, limit = 10): Promise<EquipmentWithStats[]> => {
    return prisma.$queryRaw<EquipmentWithStats[]>`
      SELECT
        e.id,
        e.name,
        e.slug,
        e.brand,
        e.type,
        e.image_url as "imageUrl",
        COUNT(CASE WHEN mr.placement = 1 THEN 1 END)::int as "totalWins",
        COALESCE(SUM(mr.points), 0)::int as "totalPoints",
        COUNT(DISTINCT CASE WHEN eu.end_date IS NULL THEN eu.player_id END)::int as "activeProCount"
      FROM "Equipment" e
      LEFT JOIN "EquipmentUsage" eu ON e.id = eu.equipment_id
      LEFT JOIN "MatchResult" mr ON eu.player_id = mr.player_id
        AND mr.match_date >= eu.start_date
        AND (eu.end_date IS NULL OR mr.match_date <= eu.end_date)
      WHERE e.type = ${type} AND e.deleted_at IS NULL
      GROUP BY e.id
      ORDER BY "totalPoints" DESC
      LIMIT ${limit}
    `;
  },
  ['equipment-leaderboard'],
  { revalidate: 3600, tags: ['leaderboard', 'equipment'] }
);
```

---

### API Routes (Agent-Native)

```typescript
// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCachedLeaderboard } from '@/lib/data/equipment';

const querySchema = z.object({
  type: z.enum(['PADDLE', 'SHOES']).default('PADDLE'),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const result = querySchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = await getCachedLeaderboard(result.data.type, result.data.limit);
  return NextResponse.json({ data });
}
```

---

### Prisma Client Singleton

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

### Connection Pooling (Neon)

```env
# .env
# Pooled connection (use -pooler endpoint)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=1"

# Direct connection for migrations
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)

#### 1.1 Project Setup
- [ ] `app/layout.tsx` - Root layout with metadata, fonts, security headers
- [ ] `app/globals.css` - Tailwind v4 theme configuration
- [ ] `app/error.tsx` - Global error boundary
- [ ] `app/not-found.tsx` - 404 page
- [ ] `lib/db.ts` - Prisma client singleton with connection pooling
- [ ] `lib/utils.ts` - cn() helper function
- [ ] `lib/validation.ts` - Zod schemas for input validation
- [ ] `lib/types/equipment.ts` - PaddleSpecs, ShoeSpecs interfaces
- [ ] `prisma/schema.prisma` - Database schema with proper constraints
- [ ] `next.config.ts` - Security headers, image domains

#### 1.2 Data Access Layer
- [ ] `lib/data/equipment.ts` - getEquipmentLeaderboard(), getEquipmentBySlug()
- [ ] `lib/data/players.ts` - getPlayerBySlug(), getPlayerStats()
- [ ] `lib/data/tournaments.ts` - getTournaments(), getTournamentResults()
- [ ] `lib/calculations.ts` - Points calculation logic (type-safe)

#### 1.3 Seed Data
- [ ] `prisma/seed.ts` - Type-safe initial data for top 20 players, 30 paddles, 10 shoes, 50 tournament results

#### 1.4 Homepage & Leaderboards
- [ ] `app/page.tsx` - Homepage with dual leaderboards (Suspense boundaries)
- [ ] `components/leaderboard/LeaderboardSection.tsx` - Leaderboard with title
- [ ] `components/leaderboard/LeaderboardRow.tsx` - Single row with rank badge
- [ ] `components/ui/Card.tsx` - Composable card component
- [ ] `components/ui/Badge.tsx` - Tier/type/rank badges
- [ ] `components/ui/Skeleton.tsx` - Loading skeletons

#### 1.5 Equipment Pages
- [ ] `app/gear/page.tsx` - All equipment (filterable by type via query params)
- [ ] `app/gear/[slug]/page.tsx` - Equipment detail with stats, pro users
- [ ] `app/gear/[slug]/loading.tsx` - Loading state
- [ ] `components/gear/GearCard.tsx` - Equipment display card (trading card aesthetic)
- [ ] `components/gear/GearStats.tsx` - Win/point statistics display

#### 1.6 Player Pages
- [ ] `app/players/[slug]/page.tsx` - Player profile with gear loadout
- [ ] `app/players/[slug]/loading.tsx` - Loading state
- [ ] `components/player/PlayerCard.tsx` - Player display card
- [ ] `components/player/GearLoadout.tsx` - Current equipment display

#### 1.7 Tournament Pages
- [ ] `app/tournaments/page.tsx` - Tournament listing
- [ ] `app/tournaments/[slug]/page.tsx` - Tournament results
- [ ] `components/tournament/TournamentCard.tsx` - Tournament card
- [ ] `components/tournament/ResultsTable.tsx` - Match results table

#### 1.8 API Routes
- [ ] `app/api/equipment/route.ts` - GET /api/equipment
- [ ] `app/api/equipment/[slug]/route.ts` - GET /api/equipment/:slug
- [ ] `app/api/players/[slug]/route.ts` - GET /api/players/:slug
- [ ] `app/api/leaderboard/route.ts` - GET /api/leaderboard
- [ ] `lib/rate-limit.ts` - Rate limiting middleware

#### 1.9 SEO & Metadata
- [ ] `app/gear/[slug]/page.tsx` - generateMetadata() for equipment
- [ ] `app/players/[slug]/page.tsx` - generateMetadata() for players
- [ ] `components/ProductSchema.tsx` - JSON-LD structured data
- [ ] `app/sitemap.ts` - Dynamic sitemap generation

### Phase 2: Enhancement

- [ ] Filtering by time period (all-time, year, season) via API query params
- [ ] Filtering by tournament tier
- [ ] Filtering by match category (singles/doubles)
- [ ] Search functionality (`/api/search`)
- [ ] Equipment comparison page (`/api/compare`)
- [ ] Brand directory pages

### Phase 3: Data Integration

- [ ] Pickleball.com API integration with validation
- [ ] Automated data sync (Vercel cron)
- [ ] Admin data entry interface
- [ ] Webhook endpoints for external data

---

## Security Considerations

### Input Validation (Zod)
```typescript
// lib/validation.ts
import { z } from 'zod';

export const equipmentFilterSchema = z.object({
  type: z.enum(['PADDLE', 'SHOES']).optional(),
  brand: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
```

### Security Headers
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

### Rate Limiting
- Public API: 100 requests/minute per IP
- Search endpoints: 30 requests/minute per IP

---

## UI Design Direction

**Aesthetic:** "Sports Data Editorial" - refined sports editorial meets data visualization

### Color System
```css
@theme {
  --color-court-blue: #0A1628;
  --color-court-surface: #1E3A5F;
  --color-gold-rank: linear-gradient(135deg, #FFD700 0%, #B8860B 50%, #FFD700 100%);
  --color-silver-rank: linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 50%, #E8E8E8 100%);
  --color-bronze-rank: linear-gradient(135deg, #CD7F32 0%, #8B4513 50%, #CD7F32 100%);
  --color-win-green: #00D26A;
  --color-paddle-accent: #FF6B35;
  --color-shoe-accent: #7C5CFF;
}
```

### Typography
- **Display:** Bebas Neue (athletic, headline-grabbing)
- **Body:** IBM Plex Sans (technical precision)
- **Stats:** JetBrains Mono (tabular numbers)

### Key UI Patterns
- Metallic rank badges for top 3 (gold, silver, bronze)
- Trading card aesthetic for equipment cards
- Staggered entrance animations for leaderboard rows
- Category color-coding (orange = paddles, purple = shoes)

---

## Acceptance Criteria

### Functional Requirements
- [ ] Homepage displays top 10 paddles and shoes by win points
- [ ] Equipment detail pages show all pros using that gear
- [ ] Player profiles show current and historical equipment
- [ ] All pages are server-rendered for SEO
- [ ] Responsive design works on mobile
- [ ] API returns JSON for all user-facing features

### Non-Functional Requirements
- [ ] Page load < 2 seconds (with caching)
- [ ] Lighthouse score > 90 for Performance, SEO
- [ ] Proper meta tags and Open Graph images
- [ ] JSON-LD structured data on equipment pages
- [ ] Rate limiting on API endpoints

### Agent-Native Requirements
- [ ] `/api/leaderboard` returns equipment rankings as JSON
- [ ] `/api/equipment/:slug` returns equipment with stats
- [ ] `/api/players/:slug` returns player with gear loadout
- [ ] All API endpoints have Zod validation
- [ ] OpenAPI spec documented

---

## ERD

```mermaid
erDiagram
    Player ||--o{ EquipmentUsage : "uses"
    Player ||--o{ MatchResult : "earns"
    Equipment ||--o{ EquipmentUsage : "used_by"
    Tournament ||--o{ MatchResult : "awards"

    Player {
        string id PK
        string name
        string slug UK
        int ranking
        string country
        string imageUrl
        datetime deletedAt
    }

    Equipment {
        string id PK
        string name
        string slug UK
        string brand
        enum type
        json specs
        datetime deletedAt
    }

    EquipmentUsage {
        string id PK
        string playerId FK
        string equipmentId FK
        datetime startDate
        datetime endDate
        boolean verified
        string source
    }

    Tournament {
        string id PK
        string name
        string slug UK
        enum tier
        datetime startDate
    }

    MatchResult {
        string id PK
        string tournamentId FK
        string playerId FK
        int placement
        int points
        enum category
        datetime matchDate
    }
```

---

## Performance Optimizations

### Caching Strategy
1. **ISR (Page Level):** `export const revalidate = 3600` on leaderboard pages
2. **Data Cache:** `unstable_cache` with tags for database queries
3. **On-Demand Revalidation:** `revalidateTag('leaderboard')` after data updates

### Database Indexes
- Composite index on `EquipmentUsage(playerId, startDate, endDate)` for temporal joins
- Composite index on `MatchResult(playerId, matchDate)` for equipment attribution
- Index on `Equipment(type, brand)` for filtered queries

### Future Consideration
If query times exceed 100ms at scale, add a materialized `EquipmentStats` table updated via cron.

---

## References

### Internal Patterns
- Prisma client singleton: `lib/db.ts`
- Data access layer: `lib/data/`
- Server components with Suspense for streaming
- Tailwind v4 with CSS-only theme config

### External Documentation
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching)
- [Prisma with Neon](https://neon.com/docs/guides/prisma)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)

### Data Sources
- [The Slice Pro Paddle Database](https://theslicepickleball.com/professional-pickleball-player-paddle-database/)
- [NoVolleys Paddle Tracker](https://www.novolleys.com/learn/pickleball-paddle-tracker/)
- [Pickleball.com API](https://apidoc.pickleball.com/PPA)

### Similar Sites
- [Johnkew Pickleball Database](https://www.johnkewpickleball.com/paddle-database)
- [ImpactingTennis ATP Specs](https://impactingtennis.com/pro_tour/pro-player-specs/)
