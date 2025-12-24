import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
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
