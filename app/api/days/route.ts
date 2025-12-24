import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
    include: {
      locations: {
        orderBy: { order: "asc" },
      },
    },
  });
  return NextResponse.json(days);
}

export async function POST(req: Request) {
  const data = await req.json();
  const day = await prisma.day.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
  });
  return NextResponse.json(day);
}
