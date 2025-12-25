"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Lightbox } from "@/components/Lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function DayDetailPage() {
  const { dayId } = useParams();
  const router = useRouter();
  const [day, setDay] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    // Check settings first
    fetch("/api/settings")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      })
      .then(settings => {
        if (settings.autoDateMode) {
          router.replace("/gallery");
        }
      })
      .catch(err => console.error("Error loading settings:", err));

    fetch(`/api/days`) // We need to filter by ID but the current API returns all with locations
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch days");
        return res.json();
      })
      .then(days => {
        const currentDay = days.find((d: any) => d.id === dayId);
        setDay(currentDay);
      })
      .catch(err => console.error("Error loading days:", err));
  }, [dayId]);

  // We need an API for photos by day/location
  const [photos, setPhotos] = useState<any[]>([]);
  
  useEffect(() => {
    if (dayId) {
        // For now, let's fetch all photos and filter client-side 
        // Better: create /api/gallery/[dayId]
        fetch(`/api/photos?dayId=${dayId}`)
            .then(res => {
              if (!res.ok) throw new Error("Failed to fetch photos");
              return res.json();
            })
            .then(data => setPhotos(data))
            .catch(err => console.error("Error loading photos:", err));
    }
  }, [dayId]);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => a.order - b.order);
  }, [photos]);

  const handleNext = () => {
    const currentIndex = sortedPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex < sortedPhotos.length - 1) {
      setSelectedPhoto(sortedPhotos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = sortedPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(sortedPhotos[currentIndex - 1]);
    }
  };

  // Group photos by location
  const locationsWithPhotos = useMemo(() => {
    const groups: { [key: string]: any } = {};
    photos.forEach(photo => {
      const locId = photo.locationId;
      if (!groups[locId]) {
        groups[locId] = {
          info: photo.location,
          photos: []
        };
      }
      groups[locId].photos.push(photo);
    });
    return Object.values(groups).sort((a, b) => a.info.order - b.info.order);
  }, [photos]);

  if (!day) return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );

  return (
    <motion.div 
      key={dayId as string}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pb-20"
    >
      <div className="container mx-auto px-4 py-10 text-center space-y-4">
        <h1 className="text-4xl font-bold">{day.title}</h1>
        <p className="text-muted-foreground">{new Date(day.date).toLocaleDateString("en-US", { dateStyle: 'full' })}</p>
      </div>

      <div className="container mx-auto px-4 space-y-12">
        {locationsWithPhotos.map((group) => (
          <div key={group.info.id} className="space-y-6">
            <div className="flex items-baseline space-x-3 border-l-4 border-primary pl-4">
              <h2 className="text-2xl font-bold">{group.info.name_en}</h2>
              <span className="text-xl text-muted-foreground font-light">{group.info.name_cn}</span>
            </div>
            <MasonryGrid 
              photos={group.photos} 
              onPhotoClick={(p) => setSelectedPhoto(p)} 
            />
          </div>
        ))}
        {photos.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
                No photos found for this day.
            </div>
        )}
      </div>

      {selectedPhoto && (
        <Lightbox 
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </motion.div>
  );
}
