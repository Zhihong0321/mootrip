import React from "react";
import { prisma } from "@/lib/prisma";
import { DayNavigator } from "@/components/DayNavigator";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <DayNavigator days={days} />
      <main>{children}</main>
    </div>
  );
}
