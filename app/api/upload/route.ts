import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { reverseGeocode } from "@/lib/geocode";
import crypto from "crypto";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// In production, we write to the persistent volume directly.
// In development, we write to the public folder.
const UPLOADS_BASE = process.env.NODE_ENV === "production" ? "/storage/uploads" : path.join(process.cwd(), "public", "uploads");

async function calculateHash(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const uploaderId = cookieStore.get("profile_session")?.value;

    if (!uploaderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const fullFile = formData.get("full") as File;
    const mediumFile = formData.get("medium") as File;
    const thumbFile = formData.get("thumbnail") as File;
    const metadataStr = formData.get("metadata") as string;
    const originalName = formData.get("originalName") as string;
    
    let dayId = formData.get("dayId") as string;
    let locationId = formData.get("locationId") as string;

    if (dayId === "undefined" || dayId === "null" || dayId === "") dayId = "";
    if (locationId === "undefined" || locationId === "null" || locationId === "") locationId = "";

    if (!fullFile || !metadataStr) {
      return NextResponse.json({ error: "Missing required upload data" }, { status: 400 });
    }

    // Deduplication check
    const fileHash = await calculateHash(fullFile);
    const existingPhoto = await prisma.photo.findUnique({
      where: { hash: fileHash }
    });

    if (existingPhoto) {
      return NextResponse.json({ 
        skipped: true, 
        message: "Duplicate photo detected", 
        photo: existingPhoto 
      });
    }

    const metadata = JSON.parse(metadataStr);
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${originalName}`;
    const thumbFilename = `${uniqueId}-${originalName.split('.')[0]}.webp`;

    // 1. SMART DAY INFERENCE
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!dayId && metadata.dateTaken) {
      const date = new Date(metadata.dateTaken);
      const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
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
        // Fallback for autoDateMode or if date inference failed
        const fallbackDay = await prisma.day.upsert({
          where: { id: "auto-day" },
          update: {},
          create: {
            id: "auto-day",
            title: "Auto-Sorted Photos",
            date: new Date(),
            order: 9999
          }
        });
        dayId = fallbackDay.id;
    }

    // 2. SMART LOCATION INFERENCE
    if (!locationId) {
      if (metadata.latitude && metadata.longitude) {
        const geo = await reverseGeocode(metadata.latitude, metadata.longitude);
        if (geo) {
          const existingLoc = await prisma.location.findFirst({
            where: { dayId: dayId, name_en: geo.name_en }
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

    // Ensure subdirectories exist
    await Promise.all([
        fs.mkdir(path.join(UPLOADS_BASE, "full"), { recursive: true }),
        fs.mkdir(path.join(UPLOADS_BASE, "medium"), { recursive: true }),
        fs.mkdir(path.join(UPLOADS_BASE, "thumbnails"), { recursive: true }),
    ]);

    // 3. SAVE FILES TO DISK
    await Promise.all([
      fs.writeFile(path.join(UPLOADS_BASE, "full", filename), Buffer.from(await fullFile.arrayBuffer())),
      fs.writeFile(path.join(UPLOADS_BASE, "medium", filename), Buffer.from(await mediumFile.arrayBuffer())),
      fs.writeFile(path.join(UPLOADS_BASE, "thumbnails", thumbFilename), Buffer.from(await thumbFile.arrayBuffer())),
    ]);

    // 4. SAVE TO DATABASE
    const photo = await prisma.photo.create({
      data: {
        filename,
        hash: fileHash,
        thumbnail: `/uploads/thumbnails/${thumbFilename}`,
        medium: `/uploads/medium/${filename}`,
        full: `/uploads/full/${filename}`,
        aspectRatio: metadata.aspectRatio,
        dateTaken: new Date(metadata.dateTaken),
        locationId: locationId,
        order: 0,
        uploaderId: uploaderId,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
