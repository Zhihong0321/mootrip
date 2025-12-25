import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryView } from "@/components/GalleryView";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (settings?.autoDateMode) {
      return <GalleryView autoDateMode={true} />;
    }

    const firstDay = await prisma.day.findFirst({
      orderBy: { order: "asc" },
    });

    if (firstDay) {
      redirect(`/gallery/${firstDay.id}`);
    }
  } catch (error) {
    console.error("GalleryPage DB Error:", error);
    // Fallback: render the gallery view in auto-mode or a safe state
    return <GalleryView autoDateMode={true} />;
  }

  return (
    <div className="flex items-center justify-center h-screen text-muted-foreground">
      No days found. Please add some days in the admin dashboard.
    </div>
  );
}
