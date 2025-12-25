"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface MasonryGridProps {
  photos: any[];
  onPhotoClick: (photo: any) => void;
  magicIndices?: number[];
}

export function MasonryGrid({ photos, onPhotoClick, magicIndices = [] }: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      <AnimatePresence>
        {photos.map((photo, index) => {
          const isMagic = magicIndices.includes(index);
          
          return (
            <div key={photo.id} className="break-inside-avoid mb-4">
            <motion.div 
              initial={isMagic ? { opacity: 0, scale: 0.9, filter: "brightness(0.5) contrast(1.2)" } : { opacity: 0, y: 20 }}
              whileInView={isMagic ? { 
                opacity: 1, 
                scale: 1, 
                filter: ["brightness(0.5) contrast(1.2)", "brightness(1.5) contrast(1.5)", "brightness(1) contrast(1)"],
                transition: { 
                    duration: 1.2, 
                    times: [0, 0.6, 1],
                    ease: "easeOut"
                }
              } : { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: (index % 10) * 0.05 }
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="cursor-pointer overflow-hidden rounded-xl bg-muted/20 border border-muted-foreground/10 group relative shadow-sm"
              onClick={() => onPhotoClick(photo)}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Magic Border Effect */}
              {isMagic && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ 
                     opacity: [0, 1, 0], 
                     scale: [0.8, 1.05, 1],
                     transition: { duration: 1.5, times: [0, 0.4, 1] }
                   }}
                   className="absolute -inset-[2px] rounded-xl z-[-1] bg-gradient-to-r from-primary via-purple-500 to-primary blur-[4px]"
                />
              )}

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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
               {photo.profile?.name && (
                 <div className="mb-auto">
                    <span className="bg-primary/90 text-primary-foreground text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">
                      {photo.profile.name}
                    </span>
                 </div>
               )}
               <p className="text-white text-[10px] font-bold uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {new Date(photo.dateTaken).toLocaleDateString()}
               </p>
            </div>
          </motion.div>
          </div>
        );
      })}
      </AnimatePresence>
    </div>
  );
}
