import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dayId = searchParams.get("dayId");

  const photos = await prisma.photo.findMany({
    where: dayId ? {
      location: {
        dayId: dayId
      }
    } : {},
    include: {
      location: true
    },
    orderBy: {
      order: "asc"
    }
  });

  return NextResponse.json(photos);
}
