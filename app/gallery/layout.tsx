import React from "react";
import { prisma } from "@/lib/prisma";
import { DayNavigator } from "@/components/DayNavigator";

export const dynamic = "force-dynamic";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let days: any[] = [];

  try {
    settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    days = await prisma.day.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to load gallery data:", error);
    // Continue with defaults
  }

  return (
    <div className="min-h-screen bg-background">
      {!settings?.autoDateMode && <DayNavigator days={days} />}
      <main>{children}</main>
    </div>
  );
}
