import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { reverseGeocode } from "@/lib/geocode";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const fullFile = formData.get("full") as File;
    const mediumFile = formData.get("medium") as File;
    const thumbFile = formData.get("thumbnail") as File;
    const metadataStr = formData.get("metadata") as string;
    const originalName = formData.get("originalName") as string;
    
    const dayId = formData.get("dayId") as string;
    let locationId = formData.get("locationId") as string;

    if (locationId === "undefined" || locationId === "null" || locationId === "") {
        locationId = "";
    }

    if (!fullFile || !metadataStr) {
      return NextResponse.json({ error: "Missing required upload data" }, { status: 400 });
    }

    const metadata = JSON.parse(metadataStr);
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${originalName}`;
    const thumbFilename = `${uniqueId}-${originalName.split('.')[0]}.webp`;

    // 1. Fallback: Auto-create location if missing
    if (!locationId && dayId) {
      // Option A: Use GPS
      if (metadata.latitude && metadata.longitude) {
        const geo = await reverseGeocode(metadata.latitude, metadata.longitude);
        if (geo) {
          const location = await prisma.location.create({
            data: {
              name_en: geo.name_en,
              latitude: metadata.latitude,
              longitude: metadata.longitude,
              dayId: dayId,
              order: 0,
            },
          });
          locationId = location.id;
        }
      }
      
      // Option B: Create/Use "Unsorted" location for that day
      if (!locationId) {
        const fallbackLoc = await prisma.location.upsert({
          where: { 
            // We don't have a unique constraint on name_en + dayId yet, 
            // so we'll just find first or create
            id: `fallback-${dayId}` 
          },
          update: {},
          create: {
            id: `fallback-${dayId}`,
            name_en: "Unsorted Photos",
            name_cn: "未分类",
            dayId: dayId,
            order: 999,
          }
        });
        locationId = fallbackLoc.id;
      }
    }

    if (!locationId || !dayId) {
        return NextResponse.json({ error: "Please select a Day before uploading." }, { status: 400 });
    }

    // 2. Save Files to Disk
    await Promise.all([
      fs.writeFile(
        path.join(UPLOADS_DIR, "full", filename),
        Buffer.from(await fullFile.arrayBuffer())
      ),
      fs.writeFile(
        path.join(UPLOADS_DIR, "medium", filename),
        Buffer.from(await mediumFile.arrayBuffer())
      ),
      fs.writeFile(
        path.join(UPLOADS_DIR, "thumbnails", thumbFilename),
        Buffer.from(await thumbFile.arrayBuffer())
      ),
    ]);

    // 3. Save to Database
    const photo = await prisma.photo.create({
      data: {
        filename,
        thumbnail: `/uploads/thumbnails/${thumbFilename}`,
        medium: `/uploads/medium/${filename}`,
        full: `/uploads/full/${filename}`,
        aspectRatio: metadata.aspectRatio,
        dateTaken: new Date(metadata.dateTaken),
        locationId: locationId,
        order: 0,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
