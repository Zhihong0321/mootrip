import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { reverseGeocode } from "@/lib/geocode";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const fullFile = formData.get("full") as File;
    const mediumFile = formData.get("medium") as File;
    const thumbFile = formData.get("thumbnail") as File;
    const metadataStr = formData.get("metadata") as string;
    const originalName = formData.get("originalName") as string;
    
    let dayId = formData.get("dayId") as string;
    let locationId = formData.get("locationId") as string;

    // Normalize IDs from client
    if (dayId === "undefined" || dayId === "null" || dayId === "") dayId = "";
    if (locationId === "undefined" || locationId === "null" || locationId === "") locationId = "";

    if (!fullFile || !metadataStr) {
      return NextResponse.json({ error: "Missing required upload data" }, { status: 400 });
    }

    const metadata = JSON.parse(metadataStr);
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${originalName}`;
    const thumbFilename = `${uniqueId}-${originalName.split('.')[0]}.webp`;

    // 1. SMART DAY INFERENCE (If no dayId provided)
    if (!dayId && metadata.dateTaken) {
      const date = new Date(metadata.dateTaken);
      const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Find existing day for this date
      const existingDay = await prisma.day.findFirst({
        where: {
          date: {
            gte: dayDate,
            lt: new Date(dayDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingDay) {
        dayId = existingDay.id;
      } else {
        // Auto-create a new Day record for this date
        const allDays = await prisma.day.findMany();
        const newDay = await prisma.day.create({
          data: {
            title: `Trip Day - ${dayDate.toLocaleDateString()}`,
            date: dayDate,
            order: allDays.length + 1
          }
        });
        dayId = newDay.id;
      }
    }

    if (!dayId) {
        return NextResponse.json({ error: "Could not determine Day for this photo. Please select one manually." }, { status: 400 });
    }

    // 2. SMART LOCATION INFERENCE
    if (!locationId) {
      // Try GPS first
      if (metadata.latitude && metadata.longitude) {
        const geo = await reverseGeocode(metadata.latitude, metadata.longitude);
        if (geo) {
          // Check if this location name already exists for this day
          const existingLoc = await prisma.location.findFirst({
            where: {
                dayId: dayId,
                name_en: geo.name_en
            }
          });

          if (existingLoc) {
            locationId = existingLoc.id;
          } else {
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
      }
      
      // Fallback to "Unsorted" for the day
      if (!locationId) {
        const fallbackLoc = await prisma.location.upsert({
          where: { id: `unsorted-${dayId}` },
          update: {},
          create: {
            id: `unsorted-${dayId}`,
            name_en: "Unsorted Photos",
            name_cn: "未分类",
            dayId: dayId,
            order: 999,
          }
        });
        locationId = fallbackLoc.id;
      }
    }

    // 3. SAVE FILES TO DISK
    await Promise.all([
      fs.writeFile(path.join(UPLOADS_DIR, "full", filename), Buffer.from(await fullFile.arrayBuffer())),
      fs.writeFile(path.join(UPLOADS_DIR, "medium", filename), Buffer.from(await mediumFile.arrayBuffer())),
      fs.writeFile(path.join(UPLOADS_DIR, "thumbnails", thumbFilename), Buffer.from(await thumbFile.arrayBuffer())),
    ]);

    // 4. SAVE TO DATABASE
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
