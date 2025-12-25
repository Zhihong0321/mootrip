"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface MasonryGridProps {
  photos: any[];
  onPhotoClick: (photo: any) => void;
}

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="break-inside-avoid mb-4 cursor-pointer overflow-hidden rounded-xl bg-muted/20 border border-muted-foreground/10 group relative shadow-sm"
            onClick={() => onPhotoClick(photo)}
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="relative w-full" 
              style={{ paddingBottom: `${(1 / photo.aspectRatio) * 100}%` }}
            >
              {!loadedImages[photo.id] && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              <Image
                src={photo.medium}
                alt={photo.filename}
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                  loadedImages[photo.id] ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setLoadedImages((prev) => ({ ...prev, [photo.id]: true }))}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
               <p className="text-white text-[10px] font-bold uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {new Date(photo.dateTaken).toLocaleDateString()}
               </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
