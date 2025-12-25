"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Lightbox } from "@/components/Lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GalleryViewProps {
  autoDateMode?: boolean;
}

export function GalleryView({ autoDateMode = false }: GalleryViewProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/photos?all=true").then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json())
    ])
      .then(([photoData, settingsData]) => {
        setPhotos(photoData);
        setSettings(settingsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => 
      new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime()
    );
  }, [photos]);

  const magicIndices = useMemo(() => {
    if (!settings || !photos.length) return [];
    
    const freq = settings.magicEffectFrequency || "mild";
    let step = 15;
    if (freq === "frequent") step = 10;
    if (freq === "low") step = 20;

    const indices: number[] = [];
    for (let i = step; i < sortedPhotos.length; i += step) {
        // Randomize within a small range (e.g., 12-15)
        const offset = Math.floor(Math.random() * 4) - 2; // -2 to +1
        const index = Math.max(0, Math.min(sortedPhotos.length - 1, i + offset));
        indices.push(index);
    }
    return indices;
  }, [settings, sortedPhotos]);

  const photosByDate = useMemo(() => {
    const groups: { [key: string]: { photos: any[], startGlobalIndex: number } } = {};
    let globalIndex = 0;
    
    sortedPhotos.forEach((photo) => {
      const dateKey = new Date(photo.dateTaken).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = { photos: [], startGlobalIndex: globalIndex };
      }
      groups[dateKey].photos.push(photo);
      globalIndex++;
    });
    return groups;
  }, [sortedPhotos]);

  const handleNext = () => {
    const currentIndex = sortedPhotos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex < sortedPhotos.length - 1) {
      setSelectedPhoto(sortedPhotos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = sortedPhotos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(sortedPhotos[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="container mx-auto px-4 py-10 text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Live Gallery</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
          {photos.length} Memories Captured • Sorted by Date
        </p>
      </div>

      <div className="container mx-auto px-4 space-y-16">
        {Object.entries(photosByDate).map(([date, group]) => (
          <div key={date} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
              <h2 className="text-xl font-black tracking-tighter uppercase italic bg-background px-4">
                {date}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
            </div>
            <MasonryGrid
              photos={group.photos}
              onPhotoClick={(p) => setSelectedPhoto(p)}
              magicIndices={magicIndices
                .filter(idx => idx >= group.startGlobalIndex && idx < group.startGlobalIndex + group.photos.length)
                .map(idx => idx - group.startGlobalIndex)
              }
            />
          </div>
        ))}
        {photos.length === 0 && (
          <div className="py-20 text-center text-muted-foreground uppercase tracking-widest text-xs font-bold">
            No photos found in the visual archives.
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
    </div>
  );
}
