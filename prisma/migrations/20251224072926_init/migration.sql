-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_cn" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "dayId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Location_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "full" TEXT NOT NULL,
    "aspectRatio" REAL NOT NULL,
    "dateTaken" DATETIME NOT NULL,
    "caption" TEXT,
    "locationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Photo_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
