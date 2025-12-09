-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('BET', 'ROLLBACK');

-- CreateEnum
CREATE TYPE "UsingOn" AS ENUM ('DASHBOARD', 'MARKETS');

-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'STR';

-- DropForeignKey
ALTER TABLE "CategoryDetails" DROP CONSTRAINT "CategoryDetails_categoryId_fkey";

-- AlterTable
ALTER TABLE "BetConfiguration" ADD COLUMN     "allowUnmatchBets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bookMakerDelay" INTEGER,
ADD COLUMN     "customNews" TEXT,
ADD COLUMN     "delayBetTime" INTEGER,
ADD COLUMN     "marketType" "marketType",
ADD COLUMN     "maxMarketProfit" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CommonBet" ADD COLUMN     "betTakenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nature" TEXT,
ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "ExchangeBet" ADD COLUMN     "betPlaceAt" TIMESTAMP(3),
ADD COLUMN     "betTakenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cashout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "runnerName" TEXT,
ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "ExchangeUnMatchedBet" ADD COLUMN     "runnerName" TEXT;

-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "isShow" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GapBet" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isSettled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GlobalMarkets" ADD COLUMN     "hasMarketVoided" BOOLEAN DEFAULT false,
ADD COLUMN     "isBetLock" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "GlobalMatches" ADD COLUMN     "channelId" TEXT;

-- AlterTable
ALTER TABLE "PremiumOddsBet" ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "QtBet" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isSettled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "isSuper" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "SettlementHistory" ADD COLUMN     "creditBalance" DECIMAL(15,2) DEFAULT 0,
ADD COLUMN     "creditLimit" DECIMAL(15,2) DEFAULT 0,
ADD COLUMN     "myShare" DECIMAL(15,2) DEFAULT 0,
ALTER COLUMN "balanceUpLine" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "clientBalance" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "totalRevenue" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "profit" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "SportsBookBet" ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "QR2FA" TEXT,
ADD COLUMN     "is2FAEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDemo" BOOLEAN DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT,
ADD COLUMN     "walletType" INTEGER;

-- AlterTable
ALTER TABLE "UserActivityNotifications" ADD COLUMN     "sportsName" TEXT;

-- AlterTable
ALTER TABLE "WhiteLabel" ADD COLUMN     "QR2FA" TEXT,
ADD COLUMN     "is2FAEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "settlementDate" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecret" TEXT,
ADD COLUMN     "walletType" INTEGER;

-- AlterTable
ALTER TABLE "WlEnabledMarkets" ADD COLUMN     "marketType" "marketType";

-- AlterTable
ALTER TABLE "WlEnabledMatches" ADD COLUMN     "isTrending" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "CommonExposures" (
    "id" SERIAL NOT NULL,
    "txnId" TEXT,
    "betId" TEXT,
    "roundId" TEXT,
    "gameId" TEXT,
    "amount" DOUBLE PRECISION,
    "userId" TEXT,
    "runnerId" TEXT,
    "sportId" TEXT,
    "tournamentId" TEXT,
    "marketId" TEXT,
    "matchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommonExposures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderResponseLogs" (
    "id" SERIAL NOT NULL,
    "txnType" TEXT,
    "txnId" TEXT,
    "playerId" TEXT,
    "roundId" TEXT,
    "amount" DOUBLE PRECISION,
    "gameId" TEXT,
    "clientRoundId" TEXT,
    "category" TEXT,
    "completed" TEXT,
    "betId" TEXT,
    "provider" TEXT,
    "action" "ActionType",
    "token" TEXT,
    "operatorId" TEXT,
    "reqId" TEXT,
    "eventId" TEXT,
    "marketId" TEXT,
    "betStatus" TEXT,
    "betType" TEXT,
    "oddValue" DOUBLE PRECISION,
    "sportId" TEXT,
    "competitionId" TEXT,
    "competitionName" TEXT,
    "marketName" TEXT,
    "selectionId" TEXT,
    "selectionName" TEXT,
    "berfairEventId" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderResponseLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "sportsId" TEXT NOT NULL,
    "whitelabelId" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rules" (
    "id" SERIAL NOT NULL,
    "marketType" "marketType",
    "wlEnabledMarketId" TEXT,
    "matchId" TEXT,
    "rules" TEXT,

    CONSTRAINT "Rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardNews" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "displaySort" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "userId" INTEGER,
    "wlId" INTEGER,
    "themeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "GameCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignGameCategories" (
    "id" SERIAL NOT NULL,
    "gameCategoryId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER,
    "wlId" INTEGER,
    "displaySort" INTEGER DEFAULT 9999,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "AssignGameCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWiseMarketLock" (
    "id" SERIAL NOT NULL,
    "marketId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWiseMarketLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FancyMarketType" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isScore" BOOLEAN NOT NULL,

    CONSTRAINT "FancyMarketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FancyBetConfiguration" (
    "id" SERIAL NOT NULL,
    "entityType" "betEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "minBetAmount" DOUBLE PRECISION,
    "maxBetAmount" DOUBLE PRECISION,
    "maxprofit" DOUBLE PRECISION,
    "maxMarketProfit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whiteLabelId" INTEGER NOT NULL,
    "typeCode" TEXT NOT NULL,

    CONSTRAINT "FancyBetConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommonExposures_txnId_roundId_amount_userId_key" ON "CommonExposures"("txnId", "roundId", "amount", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommonExposures_betId_runnerId_amount_userId_key" ON "CommonExposures"("betId", "runnerId", "amount", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "News_sportsId_whitelabelId_tournamentId_matchId_marketId_key" ON "News"("sportsId", "whitelabelId", "tournamentId", "matchId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWiseMarketLock_playerId_marketId_key" ON "UserWiseMarketLock"("playerId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "FancyBetConfiguration_entityType_entityId_whiteLabelId_type_key" ON "FancyBetConfiguration"("entityType", "entityId", "whiteLabelId", "typeCode");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_sportsId_whitelabelId_tournamentId_matchId_marketId_fkey" FOREIGN KEY ("sportsId", "whitelabelId", "tournamentId", "matchId", "marketId") REFERENCES "WlEnabledMarkets"("sportsId", "whitelabelId", "tournamentId", "matchId", "marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDetails" ADD CONSTRAINT "CategoryDetails_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignGameCategories" ADD CONSTRAINT "AssignGameCategories_gameCategoryId_fkey" FOREIGN KEY ("gameCategoryId") REFERENCES "GameCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignGameCategories" ADD CONSTRAINT "AssignGameCategories_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWiseMarketLock" ADD CONSTRAINT "UserWiseMarketLock_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWiseMarketLock" ADD CONSTRAINT "UserWiseMarketLock_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "GlobalMarkets"("marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWiseMarketLock" ADD CONSTRAINT "UserWiseMarketLock_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;
