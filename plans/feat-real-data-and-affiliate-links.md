# feat: Source Real Tournament Data and Add Affiliate Purchase Links

## Overview

Transform the Pickleball Gear Win Tracker from demo data to real tournament data by integrating with official APIs and web scraping sources, then add affiliate purchase links for equipment to generate revenue.

**Goals:**
1. Source real tournament results from PPA/MLP/APP tours
2. Track actual player equipment usage
3. Add purchase links with affiliate commissions for paddles and shoes

## Problem Statement

The current MVP uses fictional sponsorship pairings and tournament results. To provide real value to pickleball enthusiasts researching gear, we need:
- Accurate tournament results from professional tours
- Real player-equipment associations
- Working purchase links that generate affiliate revenue

## Proposed Solution

### Phase 1: Data Source Integration

Integrate multiple data sources with a unified adapter pattern:

**Primary Sources:**
| Source | Data Type | Access Method | Cost |
|--------|-----------|---------------|------|
| PPA Tour API | Tournaments, matches, rankings | REST API (token required) | Free |
| AllPickleballTournaments | Tournament schedules, results | REST API | $25/month |
| The Slice Pro Paddle Database | Player equipment | Web scraping | Free |
| NoVolleys Paddle Tracker | Equipment changes | Web scraping | Free |

**Data Source Adapter Interface:**
```typescript
// src/lib/data-sources/adapter.ts
interface DataSourceAdapter {
  fetchTournaments(since?: Date): Promise<TournamentData[]>;
  fetchResults(tournamentId: string): Promise<MatchResultData[]>;
  fetchPlayerEquipment(playerId: string): Promise<EquipmentUsageData[]>;
  getSourceName(): string;
  getSourcePriority(): number;
}
```

### Phase 2: Affiliate Link System

Add multi-retailer affiliate support with commission tracking:

**Affiliate Programs:**
| Retailer | Commission | Cookie Duration | Network |
|----------|------------|-----------------|---------|
| Selkirk | 15% | 30 days | AvantLink |
| JustPaddles | 4-10% | 30 days | Refersion |
| Pickleball Superstore | Up to 32% | 30 days | Direct |
| Amazon Associates | 3% | 24 hours | Amazon |

### Phase 3: Automated Sync Pipeline

Vercel Cron Jobs for scheduled data synchronization with conflict resolution.

## Technical Approach

### Database Schema Changes

Add AffiliateLink model and external IDs for data source mapping:

```prisma
// prisma/schema.prisma additions

model AffiliateLink {
  id          String    @id @default(cuid())
  equipmentId String
  retailer    String    // "selkirk", "justpaddles", "pickleballsuperstore", "amazon"
  url         String
  priority    Int       @default(0)  // Higher = preferred
  commission  Float?    // Percentage for tracking
  validatedAt DateTime?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  equipment   Equipment @relation(fields: [equipmentId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([equipmentId, retailer])
  @@index([equipmentId, priority])
}

model DataSourceMapping {
  id           String   @id @default(cuid())
  entityType   String   // "player", "tournament", "equipment"
  internalId   String
  sourceName   String   // "ppa", "apt", "theslice"
  externalId   String
  lastSyncedAt DateTime

  @@unique([sourceName, entityType, externalId])
  @@index([entityType, internalId])
}

// Add to Equipment model
model Equipment {
  // ... existing fields
  affiliateLinks AffiliateLink[]
}
```

### Implementation Phases

#### Phase 1: AllPickleballTournaments Integration (Fastest to implement)

**Files to create:**
- `src/lib/data-sources/apt-adapter.ts` - API client
- `src/lib/data-sources/types.ts` - Shared types
- `src/app/api/sync/tournaments/route.ts` - Sync endpoint

```typescript
// src/lib/data-sources/apt-adapter.ts
import { z } from "zod";

const APTTournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
  tier: z.enum(["MAJOR", "PPA", "MLP", "APP", "OTHER"]),
});

export class APTAdapter implements DataSourceAdapter {
  private apiKey: string;
  private baseUrl = "https://api.allpickleballtournaments.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchTournaments(since?: Date): Promise<TournamentData[]> {
    const response = await fetch(`${this.baseUrl}/tournaments`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await response.json();
    return z.array(APTTournamentSchema).parse(data);
  }

  // ... other methods
}
```

#### Phase 2: Affiliate Links Integration

**Files to create:**
- `src/lib/affiliates/link-generator.ts` - Generate affiliate URLs
- `src/lib/affiliates/retailers.ts` - Retailer configurations
- `src/components/gear/purchase-button.tsx` - UI component

```typescript
// src/lib/affiliates/retailers.ts
export const AFFILIATE_RETAILERS = {
  selkirk: {
    name: "Selkirk",
    baseUrl: "https://www.selkirk.com",
    affiliateParam: "avad",
    affiliateId: process.env.SELKIRK_AFFILIATE_ID,
    commission: 0.15,
  },
  justpaddles: {
    name: "JustPaddles",
    baseUrl: "https://www.justpaddles.com",
    affiliateParam: "ref",
    affiliateId: process.env.JUSTPADDLES_AFFILIATE_ID,
    commission: 0.07,
  },
  amazon: {
    name: "Amazon",
    baseUrl: "https://www.amazon.com",
    affiliateParam: "tag",
    affiliateId: process.env.AMAZON_ASSOCIATE_TAG,
    commission: 0.03,
  },
} as const;
```

```tsx
// src/components/gear/purchase-button.tsx
import { AffiliateLink } from "@prisma/client";

interface PurchaseButtonProps {
  affiliateLinks: AffiliateLink[];
  equipmentName: string;
}

export function PurchaseButton({ affiliateLinks, equipmentName }: PurchaseButtonProps) {
  const primaryLink = affiliateLinks
    .filter(l => l.isActive)
    .sort((a, b) => b.priority - a.priority)[0];

  if (!primaryLink) return null;

  return (
    <div className="space-y-2">
      <a
        href={primaryLink.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Buy {equipmentName}
        <ExternalLinkIcon className="ml-2 h-4 w-4" />
      </a>
      <p className="text-xs text-muted">
        Affiliate link - we may earn a commission
      </p>
    </div>
  );
}
```

#### Phase 3: Web Scraping for Equipment Data

**Files to create:**
- `src/lib/data-sources/theslice-scraper.ts` - Paddle database scraper
- `src/lib/data-sources/novolleys-scraper.ts` - Equipment tracker scraper

```typescript
// src/lib/data-sources/theslice-scraper.ts
import * as cheerio from "cheerio";

export class TheSliceScraper {
  private baseUrl = "https://www.theslice.co";

  async fetchPlayerEquipment(playerName: string): Promise<EquipmentUsageData[]> {
    const response = await fetch(`${this.baseUrl}/pro-paddle-database`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const equipment: EquipmentUsageData[] = [];

    // Parse the paddle database table
    $("table tr").each((_, row) => {
      const cells = $(row).find("td");
      const name = $(cells[0]).text().trim();

      if (name.toLowerCase().includes(playerName.toLowerCase())) {
        equipment.push({
          playerName: name,
          paddleBrand: $(cells[1]).text().trim(),
          paddleModel: $(cells[2]).text().trim(),
          source: "theslice",
        });
      }
    });

    return equipment;
  }
}
```

#### Phase 4: Automated Sync Pipeline

**Files to create:**
- `src/app/api/cron/sync-tournaments/route.ts` - Tournament sync cron
- `src/app/api/cron/sync-equipment/route.ts` - Equipment sync cron
- `src/lib/sync/conflict-resolver.ts` - Multi-source conflict resolution

```typescript
// src/app/api/cron/sync-tournaments/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run sync
  const aptAdapter = new APTAdapter(process.env.APT_API_KEY!);
  const tournaments = await aptAdapter.fetchTournaments();

  // Upsert tournaments with conflict resolution
  for (const tournament of tournaments) {
    await prisma.tournament.upsert({
      where: { slug: slugify(tournament.name) },
      create: { /* ... */ },
      update: { /* ... */ },
    });
  }

  return NextResponse.json({ synced: tournaments.length });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-tournaments",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/sync-equipment",
      "schedule": "0 12 * * 1"
    }
  ]
}
```

### Conflict Resolution Strategy

When multiple sources provide conflicting data:

```typescript
// src/lib/sync/conflict-resolver.ts
const SOURCE_PRIORITY = {
  ppa: 100,      // Official source - highest priority
  apt: 80,       // Paid API - reliable
  theslice: 60,  // Community-maintained
  novolleys: 40, // Fan-sourced
  manual: 200,   // Admin override - always wins
};

export function resolveConflict<T>(
  records: Array<{ source: string; data: T; timestamp: Date }>
): T {
  // Sort by priority (desc), then recency (desc)
  const sorted = records.sort((a, b) => {
    const priorityDiff = SOURCE_PRIORITY[b.source] - SOURCE_PRIORITY[a.source];
    if (priorityDiff !== 0) return priorityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return sorted[0].data;
}
```

## Acceptance Criteria

### Data Integration
- [ ] Tournament data syncs from AllPickleballTournaments API daily
- [ ] Player equipment data scraped from The Slice weekly
- [ ] Data source mappings track external IDs for all entities
- [ ] Conflict resolution handles multi-source disagreements

### Affiliate Links
- [ ] Equipment pages show "Buy Now" buttons with affiliate links
- [ ] Multiple retailers supported per equipment item
- [ ] FTC-compliant disclosure shown near affiliate links
- [ ] Links track which retailer has priority/highest commission

### Sync Pipeline
- [ ] Cron jobs run on schedule via Vercel
- [ ] Failed syncs logged and alertable
- [ ] Manual sync trigger available for admins
- [ ] Cache invalidation after successful syncs

### UI Updates
- [ ] Equipment cards show purchase buttons
- [ ] Player gear sections link to purchase
- [ ] "Last updated" timestamp visible on data
- [ ] Loading states during sync operations

## Dependencies & Risks

### Dependencies
| Dependency | Status | Mitigation |
|------------|--------|------------|
| PPA Tour API token | Requires application | Start with AllPickleballTournaments |
| AllPickleballTournaments subscription | $25/month | Budget allocation needed |
| Affiliate program approvals | 1-2 weeks | Apply immediately |

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | Sync failures | Implement exponential backoff |
| Scraping blocked | Equipment data gaps | Multiple source fallbacks |
| Affiliate links expire | Broken purchase flow | Weekly link validation job |
| Data conflicts | Inconsistent display | Clear source hierarchy |

## Environment Variables Required

```env
# Data Sources
APT_API_KEY=               # AllPickleballTournaments API key
PPA_API_TOKEN=             # PPA Tour API token (when approved)
CRON_SECRET=               # Vercel cron authentication

# Affiliate Programs
SELKIRK_AFFILIATE_ID=      # AvantLink affiliate ID
JUSTPADDLES_AFFILIATE_ID=  # Refersion affiliate ID
AMAZON_ASSOCIATE_TAG=      # Amazon Associates tag
PICKLEBALLSUPERSTORE_ID=   # Direct affiliate ID
```

## Implementation Order

**Week 1: Foundation**
- [x] Add Prisma schema changes (AffiliateLink, DataSourceMapping)
- [x] Run migration
- [x] Create data source adapter interface
- [ ] Implement APT adapter (requires API subscription)

**Week 2: Affiliate System**
- [ ] Apply to affiliate programs (Selkirk, JustPaddles, Amazon)
- [x] Create affiliate link generator
- [x] Add PurchaseButton component
- [x] Update equipment cards with purchase links

**Week 3: Web Scraping**
- [ ] Implement The Slice scraper
- [ ] Implement NoVolleys scraper
- [ ] Add equipment sync logic
- [ ] Create manual sync admin endpoint

**Week 4: Automation**
- [ ] Set up Vercel Cron jobs
- [ ] Implement conflict resolver
- [ ] Add sync status dashboard
- [ ] Test end-to-end data flow

## Success Metrics

- Real tournament data for 90%+ of PPA/MLP/APP events
- Equipment tracking for top 50 pro players
- Affiliate links on 80%+ of equipment items
- Sync reliability >99% uptime

## References

### External Documentation
- [PPA Tour API](https://developers.ppatour.com/) - Official API docs
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) - Scheduling documentation
- [Cheerio](https://cheerio.js.org/) - Web scraping library
- [FTC Affiliate Disclosure](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers) - Compliance requirements

### Internal References
- `prisma/schema.prisma` - Current database schema
- `src/lib/data/equipment.ts:1-50` - Existing data fetching pattern
- `src/components/gear/equipment-card.tsx` - Equipment display component

### Affiliate Program Links
- [AvantLink (Selkirk)](https://www.avantlink.com/)
- [Refersion (JustPaddles)](https://www.refersion.com/)
- [Amazon Associates](https://affiliate-program.amazon.com/)
