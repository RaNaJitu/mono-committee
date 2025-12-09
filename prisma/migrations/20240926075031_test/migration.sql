-- CreateEnum
CREATE TYPE "WlType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('WOLF', 'CS');

-- CreateEnum
CREATE TYPE "SettledStatus" AS ENUM ('ASSIGNED', 'NOT_ASSIGNED', 'GENERATED', 'VOIDED', 'SETTLED', 'CLEARED');

-- CreateEnum
CREATE TYPE "SettlementMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPER', 'MASTER', 'AGENT', 'PLAYER', 'SUBUSER');

-- CreateEnum
CREATE TYPE "betEntityType" AS ENUM ('SPORT', 'TOURNAMENT', 'MATCH', 'MARKET');

-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('SPORTS_BETS', 'CASINO_BETS', 'EXCHANGE_GAME_BETS', 'FANCY_BETS');

-- CreateEnum
CREATE TYPE "BetCurrentStatus" AS ENUM ('INQUEUE', 'PROCESSING', 'MATCHED', 'UNMATCHED', 'VOID', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('SETTLED', 'UNSETTLED', 'VOIDED');

-- CreateEnum
CREATE TYPE "MarketBetType" AS ENUM ('BACK_OR_LAY', 'YES_OR_NO');

-- CreateEnum
CREATE TYPE "BetResult" AS ENUM ('WON', 'LOST');

-- CreateEnum
CREATE TYPE "transactionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'HOLD');

-- CreateEnum
CREATE TYPE "marketType" AS ENUM ('BOOKMAKER', 'LINE', 'MATCH_ODDS', 'FANCY', 'MINI_BOOKMAKER');

-- CreateTable
CREATE TABLE "WhiteLabel" (
    "id" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "defaultPassword" TEXT NOT NULL DEFAULT '238771c86b53ec9bff3ba22f2e9f3399d168fd299989b46ed5b721b6b68a69f681ea3eb9b11e6f487e8c3d4d5e017270a88c29a255056245280d3ca8f9edd0e4',
    "ownerId" INTEGER NOT NULL,
    "salt" TEXT NOT NULL,
    "defaultSalt" TEXT NOT NULL DEFAULT '35c002dc7bbecda73897ebc9b45d214a',
    "myShare" DECIMAL(9,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "groupName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wlType" "WlType" NOT NULL DEFAULT 'B2B',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "hasConfig" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "wlServerConfig" (
    "id" INTEGER NOT NULL,
    "dbName" TEXT,
    "dbPassword" TEXT,
    "dbUser" TEXT,
    "dbHost" TEXT,
    "endPointUrl" TEXT,
    "config" JSONB,
    "serverIp" TEXT[],
    "domains" TEXT[],
    "whiteLabelId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "defaultPassword" TEXT NOT NULL DEFAULT '238771c86b53ec9bff3ba22f2e9f3399d168fd299989b46ed5b721b6b68a69f681ea3eb9b11e6f487e8c3d4d5e017270a88c29a255056245280d3ca8f9edd0e4',
    "whiteLabelId" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "parentId" INTEGER,
    "myShare" DECIMAL(9,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "groupName" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "salt" TEXT NOT NULL,
    "defaultSalt" TEXT NOT NULL DEFAULT '35c002dc7bbecda73897ebc9b45d214a',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isBetlock" BOOLEAN NOT NULL DEFAULT false,
    "isFundFreeze" BOOLEAN NOT NULL DEFAULT false,
    "isQuickBetEnable" BOOLEAN DEFAULT false,
    "isSubUser" BOOLEAN DEFAULT false,
    "isAcceptAnyOdds" BOOLEAN DEFAULT false,
    "quickBetAmount" DOUBLE PRECISION DEFAULT 100,
    "profileImage" TEXT,
    "otp" INTEGER,
    "ip" TEXT,
    "settlementDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exposure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditLimit" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubuserPermissions" (
    "id" SERIAL NOT NULL,
    "subUserId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubuserPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,
    "userId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "sender" JSONB,
    "receiver" JSONB,
    "betId" TEXT,
    "transactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "nature" TEXT,
    "runningBalance" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT,
    "refreshToken" TEXT,
    "ipAddress" TEXT,
    "logType" TEXT NOT NULL,
    "device" TEXT,
    "browserInfo" TEXT,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrowserToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrowserToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QtBet" (
    "id" SERIAL NOT NULL,
    "txnType" TEXT,
    "txnId" TEXT NOT NULL,
    "playerId" INTEGER,
    "roundId" TEXT,
    "amount" DOUBLE PRECISION,
    "gameId" TEXT,
    "clientRoundId" TEXT,
    "category" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betId" TEXT,
    "completed" TEXT,
    "betResult" "BetResult",

    CONSTRAINT "QtBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapBet" (
    "id" SERIAL NOT NULL,
    "operatorId" TEXT,
    "token" TEXT,
    "playerId" INTEGER,
    "reqId" TEXT,
    "txnId" TEXT,
    "roundId" TEXT,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "gameId" TEXT,
    "clientRoundId" TEXT,
    "txnType" TEXT,
    "betType" TEXT,
    "category" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betId" TEXT,
    "completed" TEXT,
    "betResult" "BetResult",

    CONSTRAINT "GapBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonBet" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "betId" TEXT,
    "stake" INTEGER,
    "betType" TEXT,
    "marketId" TEXT,
    "runnerId" INTEGER,
    "isBack" BOOLEAN,
    "isSettled" BOOLEAN,
    "marketExpo" DOUBLE PRECISION,
    "betCurrentStatus" "BetCurrentStatus",
    "betStatus" "BetStatus",
    "marketRunnerId" INTEGER,
    "matchId" TEXT,
    "marketType" TEXT,
    "matchedTime" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "settledTime" TIMESTAMP(3),
    "marketBetType" "MarketBetType" DEFAULT 'BACK_OR_LAY',
    "betResult" "BetResult",
    "matchedOdds" DOUBLE PRECISION DEFAULT 0,
    "placedOdds" DOUBLE PRECISION,
    "profitPercentage" DOUBLE PRECISION,
    "keepAlive" BOOLEAN DEFAULT false,
    "mPlaced" BOOLEAN DEFAULT false,
    "mPlacedReason" TEXT,
    "deviceInfo" JSONB DEFAULT '{}',
    "lostBonus" DOUBLE PRECISION,
    "isBlocked" BOOLEAN DEFAULT false,
    "isFlagged" BOOLEAN DEFAULT false,
    "acceptAnyOdds" BOOLEAN,
    "tournamentId" TEXT,
    "sportsId" TEXT,
    "iP" TEXT,
    "operatorId" TEXT,
    "token" TEXT,
    "reqId" TEXT,
    "txnId" TEXT,
    "roundId" TEXT,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "gameId" TEXT,
    "clientRoundId" TEXT,
    "txnType" TEXT,
    "gapBetType" TEXT,
    "category" TEXT,
    "completed" TEXT,

    CONSTRAINT "CommonBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsBookBet" (
    "id" SERIAL NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "operatorId" TEXT,
    "userId" TEXT,
    "token" TEXT,
    "eventId" TEXT,
    "marketId" TEXT,
    "reqId" TEXT,
    "betStatus" TEXT,
    "txnType" TEXT,
    "betType" TEXT,
    "oddValue" DOUBLE PRECISION DEFAULT 0,
    "sportId" TEXT,
    "competitionId" TEXT,
    "competitionName" TEXT,
    "marketName" TEXT,
    "selectionId" TEXT,
    "selectionName" TEXT,
    "berfairEventId" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportsBookBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumOddsBet" (
    "id" SERIAL NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "operatorId" TEXT,
    "userId" TEXT,
    "token" TEXT,
    "eventId" TEXT,
    "marketId" TEXT,
    "reqId" TEXT,
    "betStatus" TEXT,
    "txnType" TEXT,
    "betType" TEXT,
    "oddValue" DOUBLE PRECISION DEFAULT 0,
    "sportId" TEXT,
    "competitionId" TEXT,
    "competitionName" TEXT,
    "marketName" TEXT,
    "selectionId" TEXT,
    "selectionName" TEXT,
    "berfairEventId" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PremiumOddsBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WhiteLabelPaymentMethod" (
    "id" INTEGER NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "paymentMethodId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "minDeposit" INTEGER NOT NULL,
    "maxDeposit" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "qrCodeImg" TEXT NOT NULL,
    "showQR" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethodId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "launchUrl" TEXT NOT NULL,
    "gameSession" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSports" (
    "id" SERIAL NOT NULL,
    "sportsId" TEXT NOT NULL,
    "sportsName" TEXT,
    "marketCount" INTEGER,
    "displaySort" INTEGER DEFAULT 9999,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "sourceId" INTEGER,
    "providers" "Provider"[],

    CONSTRAINT "GlobalSports_pkey" PRIMARY KEY ("sportsId")
);

-- CreateTable
CREATE TABLE "GlobalTournaments" (
    "id" SERIAL NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "tournamentName" TEXT NOT NULL,
    "sportsId" TEXT NOT NULL,
    "marketCount" INTEGER NOT NULL,
    "displaySort" INTEGER NOT NULL DEFAULT 9999,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "sourceId" INTEGER,
    "providers" "Provider"[],

    CONSTRAINT "GlobalTournaments_pkey" PRIMARY KEY ("tournamentId")
);

-- CreateTable
CREATE TABLE "GlobalMatches" (
    "id" SERIAL NOT NULL,
    "matchId" TEXT NOT NULL,
    "matchName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "marketCount" INTEGER NOT NULL,
    "displaySort" INTEGER NOT NULL DEFAULT 9999,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "runners" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "scoreBoardUrl" TEXT,
    "sportsRadarUrl" TEXT,
    "sourceId" INTEGER,
    "isEnabled" BOOLEAN DEFAULT false,
    "showScoreBoard" BOOLEAN NOT NULL DEFAULT true,
    "showStreaming" BOOLEAN NOT NULL DEFAULT true,
    "inplay" BOOLEAN NOT NULL DEFAULT false,
    "providers" "Provider"[],
    "wolfShow" BOOLEAN DEFAULT false,
    "csShow" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalMatches_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "GlobalMarkets" (
    "id" SERIAL NOT NULL,
    "marketId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "isMarketDataDelayed" BOOLEAN,
    "isPersistenceEnabled" BOOLEAN,
    "isBspMarket" BOOLEAN,
    "marketTime" TIMESTAMP(3),
    "suspendtime" TIMESTAMP(3),
    "settleTime" TIMESTAMP(3),
    "bettingType" INTEGER,
    "isTurnTnplayEnabled" BOOLEAN,
    "marketType" TEXT,
    "regulator" TEXT,
    "marketBaseRate" INTEGER,
    "isDiscountAllowed" BOOLEAN,
    "wallet" TEXT,
    "rules" TEXT,
    "rulesHasDate" BOOLEAN,
    "clarifications" TEXT,
    "marketStatus" INTEGER DEFAULT 2,
    "marketStatusName" TEXT,
    "categoryTypeId" INTEGER,
    "marketIsActive" BOOLEAN,
    "centralId" TEXT,
    "runners" JSONB NOT NULL,
    "settledStatus" "SettledStatus" NOT NULL DEFAULT 'NOT_ASSIGNED',
    "winner" TEXT,
    "isImported" BOOLEAN DEFAULT false,
    "isSubscribed" BOOLEAN DEFAULT false,
    "isShow" BOOLEAN DEFAULT true,
    "announcement" TEXT,
    "cashback" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION,
    "isEnabled" BOOLEAN DEFAULT false,
    "whitelabelId" INTEGER,
    "displaySort" INTEGER DEFAULT 9999,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "settlementMode" "SettlementMode" DEFAULT 'AUTOMATIC',
    "providers" "Provider"[],
    "priority" SMALLINT,
    "sourceId" INTEGER,

    CONSTRAINT "GlobalMarkets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetConfiguration" (
    "id" SERIAL NOT NULL,
    "entityType" "betEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "minBetAmount" DOUBLE PRECISION,
    "maxBetAmount" DOUBLE PRECISION,
    "minBetVolume" DOUBLE PRECISION,
    "maxBetVolume" DOUBLE PRECISION,
    "maxprofit" DOUBLE PRECISION,
    "maxOdds" DOUBLE PRECISION,
    "betDelay" INTEGER,
    "allowBet" BOOLEAN NOT NULL DEFAULT true,
    "allowBetTime" INTEGER,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whiteLabelId" INTEGER NOT NULL,

    CONSTRAINT "BetConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WlEnabledSports" (
    "id" SERIAL NOT NULL,
    "sportsId" TEXT NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "displaySort" INTEGER NOT NULL DEFAULT 1,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "betConfigurationId" INTEGER
);

-- CreateTable
CREATE TABLE "WlEnabledTournaments" (
    "id" SERIAL NOT NULL,
    "sportsId" TEXT NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "displaySort" INTEGER NOT NULL DEFAULT 1,
    "betConfigurationId" INTEGER
);

-- CreateTable
CREATE TABLE "WlEnabledMatches" (
    "id" SERIAL NOT NULL,
    "sportsId" TEXT NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "displaySort" INTEGER NOT NULL DEFAULT 1,
    "betConfigurationId" INTEGER
);

-- CreateTable
CREATE TABLE "WlEnabledMarkets" (
    "id" SERIAL NOT NULL,
    "sportsId" TEXT NOT NULL,
    "whitelabelId" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "displaySort" INTEGER NOT NULL DEFAULT 1,
    "betConfigurationId" INTEGER
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "panelId" INTEGER NOT NULL,
    "wlId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canAdd" BOOLEAN NOT NULL DEFAULT false,
    "wlId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleModulePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleModulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelUser" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "roleId" INTEGER NOT NULL,
    "wlId" INTEGER NOT NULL,
    "salt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAssingToDwUser" (
    "id" SERIAL NOT NULL,
    "panelUserId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "AgentAssingToDwUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Features" (
    "id" INTEGER NOT NULL,
    "name" TEXT,
    "config" JSONB,
    "userName" TEXT,
    "password" TEXT,
    "apiBaseUrl" TEXT,
    "publicKey" TEXT,
    "privateKey" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WlFeature" (
    "id" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "commission" DOUBLE PRECISION DEFAULT 0,
    "multiplier" DOUBLE PRECISION DEFAULT 1,
    "currency" TEXT,
    "country" TEXT,
    "language" TEXT,
    "config" JSONB,
    "featureProviderId" TEXT[],
    "whiteLabelId" INTEGER NOT NULL,
    "Provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branding" (
    "id" SERIAL NOT NULL,
    "themeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attributeKey" TEXT NOT NULL,
    "attributeValue" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMSConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "configLink" TEXT NOT NULL,
    "icon" TEXT,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "themeId" INTEGER NOT NULL,
    "langId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "CMSConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Navigation" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT NOT NULL DEFAULT '',
    "icon" TEXT,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "themeId" INTEGER NOT NULL,
    "langId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMSLogger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "themeId" INTEGER,
    "entityId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CMSLogger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "CategoryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "categoryTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "hrefTitle" TEXT NOT NULL,
    "hrefLink" TEXT NOT NULL,
    "image" TEXT,
    "isSlide" BOOLEAN NOT NULL,
    "isLogin" BOOLEAN NOT NULL,
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDetails" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleKey" TEXT NOT NULL,
    "generalField" TEXT NOT NULL,
    "imageMobile" TEXT,
    "image" TEXT,
    "video" TEXT,
    "videoPoster" TEXT,
    "eventId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL,
    "isMobile" BOOLEAN NOT NULL,
    "isLogin" BOOLEAN NOT NULL,
    "displayFor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "CategoryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "themeId" INTEGER NOT NULL,
    "imageName" TEXT,
    "isActive" BOOLEAN,
    "langId" INTEGER NOT NULL,
    "blogUrl" TEXT,
    "sort" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "themeId" INTEGER NOT NULL,
    "pageDesignId" INTEGER,
    "isActive" BOOLEAN,
    "langId" INTEGER NOT NULL,
    "nameKey" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicFields" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "titleKey" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "TopicFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaTags" (
    "id" SERIAL NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "url" TEXT,
    "themeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "MetaTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeBet" (
    "betId" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "stake" INTEGER NOT NULL,
    "betType" "BetType" NOT NULL,
    "marketId" TEXT NOT NULL,
    "runnerId" INTEGER NOT NULL,
    "isBack" BOOLEAN NOT NULL,
    "isSettled" BOOLEAN,
    "marketExpo" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "betCurrentStatus" "BetCurrentStatus" NOT NULL,
    "betStatus" "BetStatus",
    "marketRunnerId" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketType" TEXT,
    "matchedTime" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "settledTime" TIMESTAMP(3),
    "marketBetType" "MarketBetType" NOT NULL DEFAULT 'BACK_OR_LAY',
    "betResult" "BetResult",
    "matchedOdds" DOUBLE PRECISION DEFAULT 0,
    "placedOdds" DOUBLE PRECISION,
    "profitPercentage" DOUBLE PRECISION,
    "keepAlive" BOOLEAN NOT NULL DEFAULT false,
    "mPlaced" BOOLEAN NOT NULL DEFAULT false,
    "mPlacedReason" TEXT,
    "deviceInfo" JSONB DEFAULT '{}',
    "lostBonus" DOUBLE PRECISION,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "acceptAnyOdds" BOOLEAN,
    "tournamentId" TEXT NOT NULL,
    "sportsId" TEXT NOT NULL,
    "iP" TEXT,

    CONSTRAINT "ExchangeBet_pkey" PRIMARY KEY ("betId")
);

-- CreateTable
CREATE TABLE "ExchangeUnMatchedBet" (
    "betId" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "stake" INTEGER NOT NULL,
    "betType" "BetType" NOT NULL,
    "marketId" TEXT NOT NULL,
    "runnerId" INTEGER NOT NULL,
    "isBack" BOOLEAN NOT NULL,
    "isSettled" BOOLEAN,
    "marketExpo" DOUBLE PRECISION,
    "marketType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "betCurrentStatus" "BetCurrentStatus" NOT NULL,
    "betStatus" "BetStatus",
    "marketRunnerId" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,
    "matchedTime" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "settledTime" TIMESTAMP(3),
    "marketBetType" "MarketBetType" NOT NULL DEFAULT 'BACK_OR_LAY',
    "betResult" "BetResult",
    "matchedOdds" DOUBLE PRECISION DEFAULT 0,
    "placedOdds" DOUBLE PRECISION,
    "profitPercentage" DOUBLE PRECISION,
    "keepAlive" BOOLEAN NOT NULL DEFAULT false,
    "mPlaced" BOOLEAN NOT NULL DEFAULT false,
    "mPlacedReason" TEXT,
    "deviceInfo" JSONB DEFAULT '{}',
    "lostBonus" DOUBLE PRECISION,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "acceptAnyOdds" BOOLEAN,
    "tournamentId" TEXT NOT NULL,
    "sportsId" TEXT NOT NULL,
    "iP" TEXT,

    CONSTRAINT "ExchangeUnMatchedBet_pkey" PRIMARY KEY ("betId")
);

-- CreateTable
CREATE TABLE "Games" (
    "id" SERIAL NOT NULL,
    "wlId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "GameName" TEXT,
    "ProviderCode" TEXT,
    "GameID" TEXT,
    "filter" TEXT,
    "namekey" TEXT,
    "GameType" TEXT,
    "GameCode" TEXT,
    "ProviderID" TEXT,
    "displayCode" TEXT,
    "min" TEXT,
    "max" TEXT,
    "SupportDemo" TEXT,
    "Provider" TEXT,
    "Mode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerBankDetails" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "minDeposit" INTEGER NOT NULL,
    "maxDeposit" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethodId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "withdrawPin" INTEGER NOT NULL,

    CONSTRAINT "PlayerBankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketExpo" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "marketId" TEXT NOT NULL,
    "marketExpo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketExpo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavouriteGames" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "GameName" TEXT,
    "GameID" TEXT,
    "ProviderCode" TEXT,
    "favourite" BOOLEAN,
    "status" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "UserFavouriteGames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPaymentDetails" (
    "id" SERIAL NOT NULL,
    "playerName" TEXT,
    "phoneNo" TEXT,
    "slipImage" TEXT,
    "statusId" INTEGER NOT NULL DEFAULT 1,
    "transactionStatus" "transactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER,
    "paymentMethodId" INTEGER NOT NULL,
    "transactionType" TEXT,
    "bankName" TEXT,
    "bankHolderName" TEXT,
    "branchCode" TEXT,
    "accountNumber" TEXT,
    "approvedOn" TIMESTAMP(3),
    "rejectedOn" TIMESTAMP(3),
    "utr" TEXT,
    "firstDeposit" BOOLEAN DEFAULT false,
    "bankId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerPaymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavouriteMatches" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportsId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "betConfigurationId" INTEGER,
    "centralId" TEXT,
    "displaySort" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "whiteLabelId" INTEGER NOT NULL,
    "favourite" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "UserFavouriteMatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WlEnabledMarketType" (
    "id" SERIAL NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "sportId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketType" "marketType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WlEnabledMarketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetStakeButtons" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "buttonName" TEXT,
    "buttonValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "BetStakeButtons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityNotifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "message" TEXT,
    "markRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivityNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementHistory" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "whiteLabelId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "userId" INTEGER NOT NULL,
    "balanceUpLine" DECIMAL(9,2) DEFAULT 0,
    "clientBalance" DECIMAL(9,2) DEFAULT 0,
    "totalRevenue" DECIMAL(9,2) DEFAULT 0,
    "profit" DECIMAL(9,2) DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettlementHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BetConfigurationToGlobalMarkets" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_id_key" ON "WhiteLabel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_userName_key" ON "WhiteLabel"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_phoneNo_key" ON "WhiteLabel"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "wlServerConfig_id_key" ON "wlServerConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wlServerConfig_whiteLabelId_key" ON "wlServerConfig"("whiteLabelId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accountNumber_key" ON "Wallet"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_userType_key" ON "Wallet"("userId", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionId_key" ON "Transaction"("transactionId");

-- CreateIndex
CREATE INDEX "idxWalletId" ON "Transaction"("walletId");

-- CreateIndex
CREATE INDEX "idxUserId" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrowserToken_token_key" ON "BrowserToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "QtBet_txnId_key" ON "QtBet"("txnId");

-- CreateIndex
CREATE INDEX "QtBet_playerId_idx" ON "QtBet"("playerId");

-- CreateIndex
CREATE INDEX "GapBet_playerId_idx" ON "GapBet"("playerId");

-- CreateIndex
CREATE INDEX "CommonBet_marketId_idx" ON "CommonBet"("marketId");

-- CreateIndex
CREATE INDEX "CommonBet_matchId_idx" ON "CommonBet"("matchId");

-- CreateIndex
CREATE INDEX "CommonBet_tournamentId_idx" ON "CommonBet"("tournamentId");

-- CreateIndex
CREATE INDEX "CommonBet_sportId_idx" ON "CommonBet"("sportsId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_id_key" ON "PaymentMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabelPaymentMethod_id_key" ON "WhiteLabelPaymentMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabelPaymentMethod_whiteLabelId_paymentMethodId_key" ON "WhiteLabelPaymentMethod"("whiteLabelId", "paymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_accountNumber_key" ON "BankDetails"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_paymentMethodId_agentId_accountNumber_key" ON "BankDetails"("paymentMethodId", "agentId", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSports_sportsId_key" ON "GlobalSports"("sportsId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalTournaments_tournamentId_key" ON "GlobalTournaments"("tournamentId");

-- CreateIndex
CREATE INDEX "GlobalTournaments_tournamentId_idx" ON "GlobalTournaments"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalMatches_matchId_key" ON "GlobalMatches"("matchId");

-- CreateIndex
CREATE INDEX "GlobalMatches_matchId_idx" ON "GlobalMatches"("matchId");

-- CreateIndex
CREATE INDEX "GlobalMatches_inplay_idx" ON "GlobalMatches"("inplay");

-- CreateIndex
CREATE INDEX "GlobalMatches_isClosed_idx" ON "GlobalMatches"("isClosed");

-- CreateIndex
CREATE INDEX "GlobalMatches_openDate_idx" ON "GlobalMatches"("openDate");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalMarkets_marketId_key" ON "GlobalMarkets"("marketId");

-- CreateIndex
CREATE INDEX "GlobalMarkets_matchId_idx" ON "GlobalMarkets"("matchId");

-- CreateIndex
CREATE INDEX "GlobalMarkets_marketId_idx" ON "GlobalMarkets"("marketId");

-- CreateIndex
CREATE INDEX "GlobalMarkets_marketType_idx" ON "GlobalMarkets"("marketType");

-- CreateIndex
CREATE INDEX "GlobalMarkets_categoryTypeId_idx" ON "GlobalMarkets"("categoryTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BetConfiguration_entityType_entityId_whiteLabelId_key" ON "BetConfiguration"("entityType", "entityId", "whiteLabelId");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledSports_id_key" ON "WlEnabledSports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledSports_sportsId_whiteLabelId_key" ON "WlEnabledSports"("sportsId", "whiteLabelId");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledTournaments_id_key" ON "WlEnabledTournaments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledTournaments_sportsId_whiteLabelId_tournamentId_key" ON "WlEnabledTournaments"("sportsId", "whiteLabelId", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledMatches_id_key" ON "WlEnabledMatches"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledMatches_sportsId_whiteLabelId_tournamentId_matchId_key" ON "WlEnabledMatches"("sportsId", "whiteLabelId", "tournamentId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledMarkets_id_key" ON "WlEnabledMarkets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledMarkets_sportsId_whitelabelId_tournamentId_matchId_key" ON "WlEnabledMarkets"("sportsId", "whitelabelId", "tournamentId", "matchId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PanelUser_userName_key" ON "PanelUser"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Features_id_key" ON "Features"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Features_name_key" ON "Features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WlFeature_id_key" ON "WlFeature"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WlFeature_whiteLabelId_featureId_key" ON "WlFeature"("whiteLabelId", "featureId");

-- CreateIndex
CREATE INDEX "ExchangeBet_marketId_idx" ON "ExchangeBet"("marketId");

-- CreateIndex
CREATE INDEX "ExchangeBet_matchId_idx" ON "ExchangeBet"("matchId");

-- CreateIndex
CREATE INDEX "ExchangeBet_tournamentId_idx" ON "ExchangeBet"("tournamentId");

-- CreateIndex
CREATE INDEX "ExchangeBet_sportId_idx" ON "ExchangeBet"("sportsId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerBankDetails_accountNumber_key" ON "PlayerBankDetails"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerBankDetails_paymentMethodId_playerId_accountNumber_key" ON "PlayerBankDetails"("paymentMethodId", "playerId", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MarketExpo_playerId_marketId_key" ON "MarketExpo"("playerId", "marketId");

-- CreateIndex
CREATE INDEX "PlayerPaymentDetails_playerId_idx" ON "PlayerPaymentDetails"("playerId");

-- CreateIndex
CREATE INDEX "PlayerPaymentDetails_bankId_idx" ON "PlayerPaymentDetails"("bankId");

-- CreateIndex
CREATE INDEX "PlayerPaymentDetails_accountNumber_idx" ON "PlayerPaymentDetails"("accountNumber");

-- CreateIndex
CREATE INDEX "PlayerPaymentDetails_bankName_idx" ON "PlayerPaymentDetails"("bankName");

-- CreateIndex
CREATE INDEX "event_index" ON "WlEnabledMarketType"("whiteLabelId", "sportId", "tournamentId", "matchId", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "WlEnabledMarketType_whiteLabelId_sportId_tournamentId_match_key" ON "WlEnabledMarketType"("whiteLabelId", "sportId", "tournamentId", "matchId", "marketType");

-- CreateIndex
CREATE UNIQUE INDEX "_BetConfigurationToGlobalMarkets_AB_unique" ON "_BetConfigurationToGlobalMarkets"("A", "B");

-- CreateIndex
CREATE INDEX "_BetConfigurationToGlobalMarkets_B_index" ON "_BetConfigurationToGlobalMarkets"("B");

-- AddForeignKey
ALTER TABLE "wlServerConfig" ADD CONSTRAINT "wlServerConfig_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserPermissions" ADD CONSTRAINT "SubuserPermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserPermissions" ADD CONSTRAINT "SubuserPermissions_subUserId_fkey" FOREIGN KEY ("subUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowserToken" ADD CONSTRAINT "BrowserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QtBet" ADD CONSTRAINT "QtBet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GapBet" ADD CONSTRAINT "GapBet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLabelPaymentMethod" ADD CONSTRAINT "WhiteLabelPaymentMethod_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLabelPaymentMethod" ADD CONSTRAINT "WhiteLabelPaymentMethod_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalTournaments" ADD CONSTRAINT "GlobalTournaments_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalMatches" ADD CONSTRAINT "GlobalMatches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalMarkets" ADD CONSTRAINT "GlobalMarkets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledSports" ADD CONSTRAINT "WlEnabledSports_betConfigurationId_fkey" FOREIGN KEY ("betConfigurationId") REFERENCES "BetConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledSports" ADD CONSTRAINT "WlEnabledSports_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledSports" ADD CONSTRAINT "WlEnabledSports_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledTournaments" ADD CONSTRAINT "WlEnabledTournaments_betConfigurationId_fkey" FOREIGN KEY ("betConfigurationId") REFERENCES "BetConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledTournaments" ADD CONSTRAINT "WlEnabledTournaments_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledTournaments" ADD CONSTRAINT "WlEnabledTournaments_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledTournaments" ADD CONSTRAINT "WlEnabledTournaments_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMatches" ADD CONSTRAINT "WlEnabledMatches_betConfigurationId_fkey" FOREIGN KEY ("betConfigurationId") REFERENCES "BetConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMatches" ADD CONSTRAINT "WlEnabledMatches_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMatches" ADD CONSTRAINT "WlEnabledMatches_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMatches" ADD CONSTRAINT "WlEnabledMatches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMatches" ADD CONSTRAINT "WlEnabledMatches_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_betConfigurationId_fkey" FOREIGN KEY ("betConfigurationId") REFERENCES "BetConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_whitelabelId_fkey" FOREIGN KEY ("whitelabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlEnabledMarkets" ADD CONSTRAINT "WlEnabledMarkets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "GlobalMarkets"("marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_wlId_fkey" FOREIGN KEY ("wlId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roles" ADD CONSTRAINT "Roles_wlId_fkey" FOREIGN KEY ("wlId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleModulePermission" ADD CONSTRAINT "RoleModulePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleModulePermission" ADD CONSTRAINT "RoleModulePermission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelUser" ADD CONSTRAINT "PanelUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelUser" ADD CONSTRAINT "PanelUser_wlId_fkey" FOREIGN KEY ("wlId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssingToDwUser" ADD CONSTRAINT "AgentAssingToDwUser_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssingToDwUser" ADD CONSTRAINT "AgentAssingToDwUser_panelUserId_fkey" FOREIGN KEY ("panelUserId") REFERENCES "PanelUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlFeature" ADD CONSTRAINT "WlFeature_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WlFeature" ADD CONSTRAINT "WlFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branding" ADD CONSTRAINT "Branding_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSConfig" ADD CONSTRAINT "CMSConfig_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSConfig" ADD CONSTRAINT "CMSConfig_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSConfig" ADD CONSTRAINT "CMSConfig_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLogger" ADD CONSTRAINT "CMSLogger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PanelUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLogger" ADD CONSTRAINT "CMSLogger_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_categoryTypeId_fkey" FOREIGN KEY ("categoryTypeId") REFERENCES "CategoryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDetails" ADD CONSTRAINT "CategoryDetails_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicFields" ADD CONSTRAINT "TopicFields_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaTags" ADD CONSTRAINT "MetaTags_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBet" ADD CONSTRAINT "ExchangeBet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBet" ADD CONSTRAINT "ExchangeBet_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "GlobalMarkets"("marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBet" ADD CONSTRAINT "ExchangeBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBet" ADD CONSTRAINT "ExchangeBet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBet" ADD CONSTRAINT "ExchangeBet_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeUnMatchedBet" ADD CONSTRAINT "ExchangeUnMatchedBet_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "GlobalMarkets"("marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeUnMatchedBet" ADD CONSTRAINT "ExchangeUnMatchedBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeUnMatchedBet" ADD CONSTRAINT "ExchangeUnMatchedBet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeUnMatchedBet" ADD CONSTRAINT "ExchangeUnMatchedBet_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBankDetails" ADD CONSTRAINT "PlayerBankDetails_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBankDetails" ADD CONSTRAINT "PlayerBankDetails_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketExpo" ADD CONSTRAINT "MarketExpo_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketExpo" ADD CONSTRAINT "MarketExpo_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "GlobalMarkets"("marketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteGames" ADD CONSTRAINT "UserFavouriteGames_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPaymentDetails" ADD CONSTRAINT "PlayerPaymentDetails_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPaymentDetails" ADD CONSTRAINT "PlayerPaymentDetails_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPaymentDetails" ADD CONSTRAINT "PlayerPaymentDetails_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "BankDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_betConfigurationId_fkey" FOREIGN KEY ("betConfigurationId") REFERENCES "BetConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_sportsId_fkey" FOREIGN KEY ("sportsId") REFERENCES "GlobalSports"("sportsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "GlobalTournaments"("tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavouriteMatches" ADD CONSTRAINT "UserFavouriteMatches_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "GlobalMatches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetStakeButtons" ADD CONSTRAINT "BetStakeButtons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityNotifications" ADD CONSTRAINT "UserActivityNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityNotifications" ADD CONSTRAINT "UserActivityNotifications_whiteLabelId_fkey" FOREIGN KEY ("whiteLabelId") REFERENCES "WhiteLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementHistory" ADD CONSTRAINT "SettlementHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BetConfigurationToGlobalMarkets" ADD CONSTRAINT "_BetConfigurationToGlobalMarkets_A_fkey" FOREIGN KEY ("A") REFERENCES "BetConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BetConfigurationToGlobalMarkets" ADD CONSTRAINT "_BetConfigurationToGlobalMarkets_B_fkey" FOREIGN KEY ("B") REFERENCES "GlobalMarkets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
