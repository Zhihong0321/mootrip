/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "hash" TEXT;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "autoDateMode" BOOLEAN NOT NULL DEFAULT false,
    "magicEffectFrequency" TEXT NOT NULL DEFAULT 'mild'
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_hash_key" ON "Photo"("hash");
