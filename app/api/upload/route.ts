import { NextRequest, NextResponse } from "next/server";
import { extractMetadata } from "@/lib/exif";
import { processImage } from "@/lib/image";
import { reverseGeocode } from "@/lib/geocode";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const dayId = formData.get("dayId") as string;
    const locationId = formData.get("locationId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;

    // Extract Metadata
    const meta = await extractMetadata(buffer);

    // Process Image
    const { aspectRatio } = await processImage(buffer, filename);

    let finalLocationId = locationId;

    // If no locationId provided, try to find/create based on GPS
    if (!finalLocationId && meta.latitude && meta.longitude) {
      const geo = await reverseGeocode(meta.latitude, meta.longitude);
      if (geo && dayId) {
        const location = await prisma.location.create({
          data: {
            name_en: geo.name_en,
            latitude: meta.latitude,
            longitude: meta.longitude,
            dayId: dayId,
            order: 0, // Default order
          },
        });
        finalLocationId = location.id;
      }
    }

    if (!finalLocationId || !dayId) {
        // Return meta for manual assignment if not enough info to auto-save
        return NextResponse.json({
            message: "File processed but needs assignment",
            filename,
            metadata: meta,
            aspectRatio
        });
    }

    // Save to DB
    const photo = await prisma.photo.create({
      data: {
        filename,
        thumbnail: `/uploads/thumbnails/${filename}`,
        medium: `/uploads/medium/${filename}`,
        full: `/uploads/full/${filename}`,
        aspectRatio,
        dateTaken: meta.dateTaken,
        locationId: finalLocationId,
        order: 0, // Default order
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
