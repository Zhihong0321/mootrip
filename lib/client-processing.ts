import imageCompression from "browser-image-compression";
import exifr from "exifr";

export interface ProcessedImageResult {
  full: Blob;
  medium: Blob;
  thumbnail: Blob;
  metadata: {
    dateTaken: string;
    latitude?: number;
    longitude?: number;
    aspectRatio: number;
  };
}

export async function processImageClient(file: File): Promise<ProcessedImageResult> {
  // 1. Extract EXIF first (Browser-side)
  const exif = await exifr.parse(file, {
    pick: ["DateTimeOriginal", "latitude", "longitude"],
  });

  // Get image dimensions for aspect ratio
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((resolve) => (img.onload = resolve));
  const aspectRatio = img.width / img.height;
  URL.revokeObjectURL(img.src);

  // 2. Generate 3 versions
  const fullOptions = {
    maxWidthOrHeight: 2560,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: "image/jpeg",
  };

  const mediumOptions = {
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: "image/jpeg",
  };

  const thumbOptions = {
    maxWidthOrHeight: 400,
    useWebWorker: true,
    initialQuality: 0.7,
    fileType: "image/webp",
  };

  // Process sequentially to save memory on mobile devices
  try {
    const full = await imageCompression(file, fullOptions);
    const medium = await imageCompression(file, mediumOptions);
    const thumb = await imageCompression(file, thumbOptions);
    
    return {
      full,
      medium,
      thumbnail: thumb,
      metadata: {
        dateTaken: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : new Date().toISOString(),
        latitude: exif?.latitude,
        longitude: exif?.longitude,
        aspectRatio,
      },
    };
  } catch (err: any) {
    throw new Error(`Compression failed: ${err.message}`);
  }
}
