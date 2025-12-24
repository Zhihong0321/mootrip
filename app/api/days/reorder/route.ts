import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { items } = await req.json(); // Array of { id: string, order: number }

    const updates = items.map((item: any) =>
      prisma.day.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
