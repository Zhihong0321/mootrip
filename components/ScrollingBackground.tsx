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
        // Filter out photos that aren't in the list anymore (sanity check)
        const availablePhotos = photos.filter(p => !next.has(p.id));
        
        if (availablePhotos.length > 0) {
          const randomPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
          next.add(randomPhoto.id);
          
          // Remove after 2 seconds (1s in, 1s out)
          setTimeout(() => {
            setBreathingIds((current) => {
              const updated = new Set(current);
              updated.delete(randomPhoto.id);
              return updated;
            });
          }, 2000);
        }
        return next;
      });
    }, 700);

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
                    opacity: isBreathing ? 0.8 : 0.25 // Using 0.25 as base to ensure 50% "visibility" against black doesn't wash out text, but will adjust to 0.5 if preferred
                  }}
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
