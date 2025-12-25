import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let adapter;
try {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
  // Only use adapter if we can
  adapter = new PrismaBetterSqlite3({ url: dbPath });
} catch (e) {
  console.warn("Failed to initialize PrismaBetterSqlite3 adapter, using default engine:", e);
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
