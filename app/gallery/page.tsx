import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryView } from "@/components/GalleryView";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
  });

  if (settings?.autoDateMode) {
    // If auto date mode is on, we don't redirect to a specific day.
    // We render the gallery view directly with all photos.
    return <GalleryView autoDateMode={true} />;
  }

  const firstDay = await prisma.day.findFirst({
    orderBy: { order: "asc" },
  });

  if (firstDay) {
    redirect(`/gallery/${firstDay.id}`);
  }

  return (
    <div className="flex items-center justify-center h-screen text-muted-foreground">
      No days found. Please add some days in the admin dashboard.
    </div>
  );
}
