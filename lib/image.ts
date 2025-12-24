import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function processImage(buffer: Buffer, filename: string) {
  const thumbnailPath = path.join(UPLOADS_DIR, "thumbnails", filename);
  const mediumPath = path.join(UPLOADS_DIR, "medium", filename);
  const fullPath = path.join(UPLOADS_DIR, "full", filename);

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Generate thumbnail (200px width)
  await image
    .resize({ width: 200 })
    .toFile(thumbnailPath);

  // Generate medium (800px max dimension)
  await image
    .resize({
      width: 800,
      height: 800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(mediumPath);

  // Generate full (1920px max dimension)
  await image
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(fullPath);

  return {
    aspectRatio: (metadata.width || 1) / (metadata.height || 1),
    width: metadata.width,
    height: metadata.height,
  };
}
