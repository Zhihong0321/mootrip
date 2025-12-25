"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

export function ScrollingBackground() {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/photos?all=true")
      .then((res) => res.json())
      .then((data) => {
        // Shuffle photos for randomness
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setPhotos(shuffled);
      })
      .catch((err) => console.error("Failed to fetch photos", err));
  }, []);

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
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="flex gap-4 h-full">
        {columns.map((column, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: "-50%" }}
            transition={{
              duration: 40 + i * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Double the photos to make the loop seamless */}
            {[...column, ...column].map((photo, j) => (
              <div 
                key={`${photo.id}-${j}`}
                className="relative w-full rounded-xl overflow-hidden grayscale contrast-125 opacity-20"
                style={{ paddingBottom: `${(1 / photo.aspectRatio) * 100}%` }}
              >
                <img
                  src={photo.medium}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      {/* 50% Black Masking */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
