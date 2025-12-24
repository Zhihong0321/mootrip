import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: Request) {
  const data = await req.json();
  const location = await prisma.location.create({
    data,
  });
  return NextResponse.json(location);
}
