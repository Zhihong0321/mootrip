import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dayId = searchParams.get("dayId");
  const all = searchParams.get("all") === "true";

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
  });

  const photos = await prisma.photo.findMany({
    where: all ? {} : (dayId ? {
      location: {
        dayId: dayId
      }
    } : {}),
    include: {
      location: {
        include: {
          day: true
        }
      },
      uploader: {
        select: {
          name: true,
          role: true
        }
      }
    },
    orderBy: settings?.autoDateMode ? {
      dateTaken: "asc"
    } : {
      order: "asc"
    }
  });

  return NextResponse.json(photos);
}
