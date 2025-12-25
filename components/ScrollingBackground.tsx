"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

export function ScrollingBackground() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [breathingIds, setBreathingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/photos?all=true")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setPhotos(shuffled);
      })
      .catch((err) => console.error("Failed to fetch photos", err));
  }, []);

  // Breathing Logic
  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setBreathingIds((prev) => {
        const next = new Set(prev);
        const availablePhotos = photos.filter(p => !next.has(p.id));
        
        if (availablePhotos.length > 0) {
          // Pick 3 random photos to breathe at once for higher frequency
          for (let k = 0; k < 3; k++) {
            if (availablePhotos.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availablePhotos.length);
            const randomPhoto = availablePhotos.splice(randomIndex, 1)[0];
            next.add(randomPhoto.id);
            
            setTimeout(() => {
              setBreathingIds((current) => {
                const updated = new Set(current);
                updated.delete(randomPhoto.id);
                return updated;
              });
            }, 2000);
          }
        }
        return next;
      });
    }, 500); // Increased frequency to 0.5s

    return () => clearInterval(interval);
  }, [photos]);

  const columns = useMemo(() => {
    if (photos.length === 0) return [[], [], [], []];
    const cols: any[][] = [[], [], [], []];
    photos.forEach((photo, i) => {
      cols[i % 4].push(photo);
    });
    return cols;
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      <div className="flex gap-4 h-full">
        {columns.map((column, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: "-50%" }}
            transition={{
              duration: 60 + i * 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex-1 flex flex-col gap-4"
          >
            {[...column, ...column].map((photo, j) => {
              const isBreathing = breathingIds.has(photo.id);
              
              return (
                <motion.div 
                  key={`${photo.id}-${j}`}
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ paddingBottom: `${(1 / photo.aspectRatio) * 100}%` }}
                  animate={{ 
                    opacity: isBreathing ? 0.8 : 0.4,
                    scale: isBreathing ? 1.5 : 1
                  }}
                  initial={{ opacity: 0.4, scale: 1 }}
                  transition={{ 
                    duration: 1,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src={photo.medium}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
