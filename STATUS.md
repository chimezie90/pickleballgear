# Pickleball Gear Win Tracker - Project Status

**Last Updated:** January 27, 2026

## Current State: ✅ MVP Deployed

The app is live at: **https://pickleballgear.vercel.app**

GitHub repo: **https://github.com/chimezie90/pickleballgear**

---

## What's Been Completed

### 1. Core Application
- Next.js 16.1.4 with TypeScript
- Tailwind CSS for styling
- Prisma ORM with PostgreSQL (Neon)

### 2. Database (Neon Postgres via Vercel)
- **Production DB:** `ep-raspy-tree-ahfpfh9p` (Neon)
- **Development DB:** `ep-young-credit-ah2sv7cj` (Neon)
- Schema includes: Equipment, Players, Tournaments, MatchResults, EquipmentUsage, AffiliateLinks

### 3. Features Implemented
- Equipment leaderboard (paddles & shoes ranked by pro wins/points)
- Player profiles with gear usage
- Tournament listings
- Affiliate purchase links (Amazon search URLs)
- FTC-compliant disclosure on affiliate links

### 4. Seed Data
- 5 paddles (JOOLA, Selkirk, Franklin, Paddletek, Engage)
- 4 shoes (K-Swiss, ASICS, Nike, New Balance)
- 6 players (Ben Johns, Tyson McGuffin, JW Johnson, etc.)
- 5 tournaments (US Open 2024, PPA Masters, MLP Columbus, etc.)
- 14 match results
- 11 affiliate links

### 5. Infrastructure
- Deployed on Vercel
- Neon Postgres database (via Vercel Marketplace)
- Environment variables configured for both dev and prod
- Cron job configured for daily tournament sync (6 AM UTC)

---

## What's NOT Yet Implemented (from original plan)

### Data Sourcing (Phase 1 of plan)
- [ ] PPA Tour API integration
- [ ] AllPickleballTournaments.com scraping
- [ ] MLP/APP data sources
- [ ] Automated player equipment detection

### Sync Pipeline (Phase 2 of plan)
- [ ] Real tournament data sync (endpoint exists but uses mock data)
- [ ] Conflict resolution for data updates
- [ ] Data validation and error handling

### Affiliate System Enhancements
- [ ] Real affiliate program signups (Amazon Associates, etc.)
- [ ] Link validation/expiry checking
- [ ] Commission tracking
- [ ] Multiple retailer support (currently placeholder URLs for JustPaddles, Selkirk)

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed data script |
| `src/lib/db.ts` | Prisma client with Neon adapter |
| `src/lib/data/equipment.ts` | Equipment data fetching (cached) |
| `src/components/gear/purchase-button.tsx` | Affiliate link button component |
| `src/app/api/sync/tournaments/route.ts` | Tournament sync endpoint |
| `vercel.json` | Cron job configuration |

---

## Commands

```bash
# Development
npm run dev

# Database
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Deployment
vercel --prod        # Deploy to production

# Environment
vercel env pull .env.local              # Pull dev env vars
vercel env pull .env.production --environment production  # Pull prod env vars
```

---

## To Resume Work

1. **To add real data sources:** Start with `src/lib/data-sources/` adapters
2. **To add more affiliate retailers:** Update `src/lib/affiliates/retailers.ts` and seed data
3. **To modify the schema:** Edit `prisma/schema.prisma`, run `npm run db:push`
4. **To reseed production:**
   ```bash
   export $(grep -v '^#' .env.production | xargs)
   npx tsx prisma/seed.ts
   ```

---

## Known Issues

1. **Affiliate links use placeholder tag:** `tag=pickleballgear-20` - need to sign up for Amazon Associates and replace with real affiliate ID
2. **Caching:** Equipment data is cached for 1 hour (`unstable_cache` with `revalidate: 3600`)
3. **No real tournament data:** The sync endpoint exists but returns mock data
