import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const profiles = await prisma.profile.findMany({
      include: {
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await req.json();

    // Check duplicate code
    const existing = await prisma.profile.findUnique({
      where: { accessCode: data.accessCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Access code already taken" }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        accessCode: data.accessCode,
        role: data.role || "user",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { id } = await req.json();

    // Prevent deleting self? Or the last admin?
    // For now simple delete.

    await prisma.profile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
