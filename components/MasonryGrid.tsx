"use client";

import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface MasonryGridProps {
  photos: any[];
  onPhotoClick: (photo: any) => void;
}

import { motion, AnimatePresence } from "framer-motion";

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const breakpointColumnsObj = {
    default: 4,
    1400: 4,
    1100: 3,
    768: 2,
    500: 2
  };

  if (!mounted) return null;

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="mb-4 cursor-pointer overflow-hidden rounded-xl bg-muted/20 border border-muted-foreground/10 group relative"
            onClick={() => onPhotoClick(photo)}
            style={{ aspectRatio: photo.aspectRatio }}
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {!loadedImages[photo.id] && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <Image
              src={photo.medium}
              alt={photo.filename}
              width={800}
              height={800 / photo.aspectRatio}
              className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-110 ${
                loadedImages[photo.id] ? "opacity-100 grayscale-0" : "opacity-0 grayscale"
              }`}
              onLoad={() => setLoadedImages((prev) => ({ ...prev, [photo.id]: true }))}
              sizes="(max-width: 500px) 50vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
               <p className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {new Date(photo.dateTaken).toLocaleDateString()}
               </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      </Masonry>
    </div>
  );
}
