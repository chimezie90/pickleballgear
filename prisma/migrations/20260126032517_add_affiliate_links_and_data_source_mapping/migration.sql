-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ranking" INTEGER,
    "country" TEXT,
    "imageUrl" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "specs" JSONB,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EquipmentUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    CONSTRAINT "EquipmentUsage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EquipmentUsage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "matchDate" DATETIME NOT NULL,
    "eventType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "retailer" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "commission" REAL,
    "validatedAt" DATETIME,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliateLink_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSourceMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "internalId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_slug_idx" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_deletedAt_idx" ON "Player"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");

-- CreateIndex
CREATE INDEX "Equipment_type_brand_idx" ON "Equipment"("type", "brand");

-- CreateIndex
CREATE INDEX "Equipment_slug_idx" ON "Equipment"("slug");

-- CreateIndex
CREATE INDEX "Equipment_deletedAt_idx" ON "Equipment"("deletedAt");

-- CreateIndex
CREATE INDEX "EquipmentUsage_playerId_startDate_endDate_idx" ON "EquipmentUsage"("playerId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "EquipmentUsage_equipmentId_idx" ON "EquipmentUsage"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentUsage_playerId_equipmentId_startDate_key" ON "EquipmentUsage"("playerId", "equipmentId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_slug_idx" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_tier_idx" ON "Tournament"("tier");

-- CreateIndex
CREATE INDEX "Tournament_startDate_idx" ON "Tournament"("startDate");

-- CreateIndex
CREATE INDEX "Tournament_deletedAt_idx" ON "Tournament"("deletedAt");

-- CreateIndex
CREATE INDEX "MatchResult_playerId_matchDate_idx" ON "MatchResult"("playerId", "matchDate");

-- CreateIndex
CREATE INDEX "MatchResult_tournamentId_idx" ON "MatchResult"("tournamentId");

-- CreateIndex
CREATE INDEX "MatchResult_placement_idx" ON "MatchResult"("placement");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResult_playerId_tournamentId_eventType_key" ON "MatchResult"("playerId", "tournamentId", "eventType");

-- CreateIndex
CREATE INDEX "AffiliateLink_equipmentId_priority_idx" ON "AffiliateLink"("equipmentId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateLink_equipmentId_retailer_key" ON "AffiliateLink"("equipmentId", "retailer");

-- CreateIndex
CREATE INDEX "DataSourceMapping_entityType_internalId_idx" ON "DataSourceMapping"("entityType", "internalId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceMapping_sourceName_entityType_externalId_key" ON "DataSourceMapping"("sourceName", "entityType", "externalId");
