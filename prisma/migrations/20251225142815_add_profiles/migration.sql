-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "hash" TEXT,
    "thumbnail" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "full" TEXT NOT NULL,
    "aspectRatio" REAL NOT NULL,
    "dateTaken" DATETIME NOT NULL,
    "caption" TEXT,
    "locationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "uploaderId" TEXT,
    CONSTRAINT "Photo_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Photo_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("aspectRatio", "caption", "dateTaken", "filename", "full", "hash", "id", "locationId", "medium", "order", "thumbnail") SELECT "aspectRatio", "caption", "dateTaken", "filename", "full", "hash", "id", "locationId", "medium", "order", "thumbnail" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE UNIQUE INDEX "Photo_hash_key" ON "Photo"("hash");
CREATE INDEX "Photo_locationId_idx" ON "Photo"("locationId");
CREATE INDEX "Photo_order_idx" ON "Photo"("order");
CREATE INDEX "Photo_uploaderId_idx" ON "Photo"("uploaderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_accessCode_key" ON "Profile"("accessCode");
