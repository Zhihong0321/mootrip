import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    status: "unknown",
    timestamp: new Date().toISOString(),
    user: process.env.USER || "unknown",
    env: process.env.NODE_ENV,
    storage: {
      volume_exists: false,
      writable: false,
      symlink_valid: false,
      error: null
    },
    database: {
      connected: false,
      path: process.env.DATABASE_URL || "default",
      error: null
    }
  };

  // 1. DATABASE TEST
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.database.connected = true;
  } catch (e: any) {
    diagnostics.database.error = e.message;
  }

  // 2. STORAGE TEST
  const storagePath = "/storage";
  const testFile = path.join(storagePath, ".write_test");
  const publicUploadsPath = path.join(process.cwd(), "public", "uploads");

  try {
    if (fs.existsSync(storagePath)) {
      diagnostics.storage.volume_exists = true;
      
      // Test Write
      fs.writeFileSync(testFile, `Test write at ${diagnostics.timestamp}`);
      const content = fs.readFileSync(testFile, "utf8");
      
      if (content.includes("Test write")) {
        diagnostics.storage.writable = true;
        fs.unlinkSync(testFile); // Clean up
      }
    }
  } catch (e: any) {
    diagnostics.storage.error = e.message;
  }

  // 3. SYMLINK TEST
  try {
    const stats = fs.lstatSync(publicUploadsPath);
    if (stats.isSymbolicLink()) {
      const target = fs.readlinkSync(publicUploadsPath);
      diagnostics.storage.symlink_valid = target.includes("/storage/uploads");
      diagnostics.storage.symlink_target = target;
    }
  } catch (e: any) {
    diagnostics.storage.symlink_error = e.message;
  }

  // Final Status
  if (diagnostics.database.connected && diagnostics.storage.writable && diagnostics.storage.symlink_valid) {
    diagnostics.status = "healthy";
  } else {
    diagnostics.status = "degraded";
  }

  return NextResponse.json(diagnostics);
}
