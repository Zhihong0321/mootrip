import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePathArray } = await params;
    const filePath = filePathArray.join("/");
    
    // Ensure we are only accessing the correct base directory
    const UPLOADS_BASE = process.env.NODE_ENV === "production" 
        ? "/storage/uploads" 
        : path.join(process.cwd(), "public", "uploads");

    const storagePath = path.join(UPLOADS_BASE, filePath);

    if (!fs.existsSync(storagePath)) {
      console.error(`File not found at: ${storagePath}`);
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(storagePath);
    const ext = path.extname(storagePath).toLowerCase();
    
    let contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Storage serve error:", error);
    return new NextResponse("Error serving file", { status: 500 });
  }
}
