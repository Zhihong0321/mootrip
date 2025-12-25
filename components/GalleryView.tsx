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
  const [visibleCount, setVisibleCount] = useState(40);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/photos?all=true").then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/admin/profiles/me").then((res) => res.ok ? res.json() : null)
    ])
      .then(([photoData, settingsData, profileData]) => {
        setPhotos(photoData);
        setSettings(settingsData);
        setCurrentProfile(profileData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => 
      new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    );
  }, [photos]);

  const visiblePhotos = useMemo(() => {
    return sortedPhotos.slice(0, visibleCount);
  }, [sortedPhotos, visibleCount]);

  const magicIndices = useMemo(() => {
    if (!settings || !sortedPhotos.length) return [];
    
    const freq = settings.magicEffectFrequency || "mild";
    let step = 15;
    if (freq === "frequent") step = 10;
    if (freq === "low") step = 20;

    const indices: number[] = [];
    sortedPhotos.forEach((photo, index) => {
        const hash = photo.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        if (hash % step === 0) {
            indices.push(index);
        }
    });
    return indices;
  }, [settings, sortedPhotos]);

  const photosByDate = useMemo(() => {
    const groups: { 
      [dateKey: string]: { 
        startGlobalIndex: number,
        timeChunks: { timeKey: string, startTime: number, photos: any[], startIdx: number }[] 
      } 
    } = {};
    let globalIndex = 0;
    
    visiblePhotos.forEach((photo) => {
      const date = new Date(photo.dateTaken);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = { startGlobalIndex: globalIndex, timeChunks: [] };
      }
      
      const hour = date.getHours();
      const startHour = Math.floor(hour / 3) * 3;
      const endHour = startHour + 3;
      
      const formatHour = (h: number) => {
        const period = h >= 12 ? "pm" : "am";
        const displayHour = h % 12 || 12;
        return `${displayHour}:00${period}`;
      };
      
      const timeKey = `${formatHour(startHour)} — ${formatHour(endHour)}`;
      
      let chunk = groups[dateKey].timeChunks.find(c => c.timeKey === timeKey);
      if (!chunk) {
        chunk = { timeKey, startTime: startHour, photos: [], startIdx: globalIndex };
        groups[dateKey].timeChunks.push(chunk);
      }
      
      chunk.photos.push(photo);
      globalIndex++;
    });

    // Sort dates descending
    const sortedDateEntries = Object.entries(groups).sort((a, b) => {
        return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });

    // Sort time chunks descending within each date
    sortedDateEntries.forEach(([_, group]) => {
        group.timeChunks.sort((a, b) => b.startTime - a.startTime);
    });

    return Object.fromEntries(sortedDateEntries);
  }, [visiblePhotos]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || visibleCount >= sortedPhotos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 40, sortedPhotos.length));
        }
      },
      { threshold: 0.1, rootMargin: "400px" }
    );

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loading, visibleCount, sortedPhotos.length]);

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

  const handleDelete = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
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
            
            <div className="space-y-12">
              {group.timeChunks.map((chunk) => (
                <div key={chunk.timeKey} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {chunk.timeKey}
                    </span>
                    <div className="h-px flex-1 bg-muted/30" />
                  </div>
                  <MasonryGrid
                    photos={chunk.photos}
                    onPhotoClick={(p) => setSelectedPhoto(p)}
                    magicIndices={magicIndices
                      .filter(idx => idx >= chunk.startIdx && idx < chunk.startIdx + chunk.photos.length)
                      .map(idx => idx - chunk.startIdx)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="py-20 text-center text-muted-foreground uppercase tracking-widest text-xs font-bold">
            No photos found in the visual archives.
          </div>
        )}

        {/* Scroll Sentinel */}
        {visibleCount < sortedPhotos.length && (
          <div id="scroll-sentinel" className="h-20 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          currentProfile={currentProfile}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
