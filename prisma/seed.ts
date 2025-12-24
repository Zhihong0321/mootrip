import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const day1 = await prisma.day.upsert({
    where: { id: "day1" },
    update: {},
    create: {
      id: "day1",
      date: new Date("2024-10-01"),
      title: "Arrival in Shanghai",
      order: 1,
    },
  });

  const loc1 = await prisma.location.upsert({
    where: { id: "loc1" },
    update: {},
    create: {
      id: "loc1",
      name_en: "The Bund",
      name_cn: "外滩",
      latitude: 31.233,
      longitude: 121.484,
      dayId: day1.id,
      order: 1,
    },
  });

  console.log({ day1, loc1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
