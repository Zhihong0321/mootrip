import React from "react";
import { prisma } from "@/lib/prisma";
import { DayNavigator } from "@/components/DayNavigator";

export const dynamic = "force-dynamic";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
  });

  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      {!settings?.autoDateMode && <DayNavigator days={days} />}
      <main>{children}</main>
    </div>
  );
}
