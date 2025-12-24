import exifr from "exifr";

export interface PhotoMetadata {
  dateTaken: Date;
  latitude?: number;
  longitude?: number;
  width: number;
  height: number;
}

export async function extractMetadata(
  buffer: Buffer
): Promise<PhotoMetadata> {
  const output = await exifr.parse(buffer, {
    pick: ["DateTimeOriginal", "latitude", "longitude", "ExifImageWidth", "ExifImageHeight"],
  });

  return {
    dateTaken: output?.DateTimeOriginal || new Date(),
    latitude: output?.latitude,
    longitude: output?.longitude,
    width: output?.ExifImageWidth || 0,
    height: output?.ExifImageHeight || 0,
  };
}
