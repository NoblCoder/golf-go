-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "par" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Hole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "handicap" INTEGER,
    "pinLat" REAL NOT NULL,
    "pinLng" REAL NOT NULL,
    "teeBoxPolygon" TEXT,
    "fairwayPolygon" TEXT,
    "greenPolygon" TEXT,
    "teeElevation" REAL,
    "greenElevation" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalScore" INTEGER,
    "weather" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoundHole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "score" INTEGER,
    "putts" INTEGER,
    "fairwayHit" BOOLEAN,
    "greenInReg" BOOLEAN,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoundHole_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoundHole_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "clubId" TEXT,
    "startLat" REAL NOT NULL,
    "startLng" REAL NOT NULL,
    "startElevation" REAL,
    "startAccuracy" REAL,
    "startTimestamp" DATETIME NOT NULL,
    "endLat" REAL NOT NULL,
    "endLng" REAL NOT NULL,
    "endElevation" REAL,
    "endAccuracy" REAL,
    "endTimestamp" DATETIME NOT NULL,
    "carryDistance" REAL,
    "totalDistance" REAL,
    "lateralDist" REAL,
    "elevationChange" REAL,
    "shotType" TEXT,
    "shotTag" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shot_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Shot_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "loft" REAL,
    "brand" TEXT,
    "model" TEXT,
    "avgDistance" REAL,
    "stdDeviation" REAL,
    "totalShots" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Club_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Hole_courseId_idx" ON "Hole"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Hole_courseId_holeNumber_key" ON "Hole"("courseId", "holeNumber");

-- CreateIndex
CREATE INDEX "Round_userId_idx" ON "Round"("userId");

-- CreateIndex
CREATE INDEX "Round_courseId_idx" ON "Round"("courseId");

-- CreateIndex
CREATE INDEX "Round_startedAt_idx" ON "Round"("startedAt");

-- CreateIndex
CREATE INDEX "RoundHole_roundId_idx" ON "RoundHole"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundHole_roundId_holeNumber_key" ON "RoundHole"("roundId", "holeNumber");

-- CreateIndex
CREATE INDEX "Shot_roundId_idx" ON "Shot"("roundId");

-- CreateIndex
CREATE INDEX "Shot_clubId_idx" ON "Shot"("clubId");

-- CreateIndex
CREATE INDEX "Shot_holeNumber_idx" ON "Shot"("holeNumber");

-- CreateIndex
CREATE INDEX "Club_userId_idx" ON "Club"("userId");
