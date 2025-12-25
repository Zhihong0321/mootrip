import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { locationId, dateTaken } = await req.json();

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        locationId: locationId || undefined,
        dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      },
      include: {
        location: true
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Get photo data to find filenames and check ownership
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (profile.role !== "admin" && photo.uploaderId !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Delete from Database
    await prisma.photo.delete({
      where: { id },
    });

    // 3. Delete from Disk (Optional but recommended)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    
    const filesToDelete = [
      path.join(uploadsDir, "full", photo.filename),
      path.join(uploadsDir, "medium", photo.filename),
      // Handle potential .webp extension for thumbnails
      path.join(uploadsDir, "thumbnails", photo.thumbnail.split("/").pop() || ""),
    ];

    for (const filePath of filesToDelete) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
