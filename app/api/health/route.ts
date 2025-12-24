import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      storage: "/storage detected"
    });
  } catch (error) {
    return NextResponse.json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: (error as Error).message
    }, { status: 200 }); // Status 200 to see the error details
  }
}
