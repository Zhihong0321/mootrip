import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await prisma.log.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  try {
    const { level, message, details } = await req.json();
    const log = await prisma.log.create({
      data: {
        level: level || "info",
        message,
        details: typeof details === "object" ? JSON.stringify(details) : details,
      },
    });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}

export async function DELETE() {
  await prisma.log.deleteMany();
  return NextResponse.json({ success: true });
}
