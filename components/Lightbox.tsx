"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

interface LightboxProps {
  photo: any;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ photo, onClose, onNext, onPrev }: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const startDistance = useRef<number>(0);
  const initialZoom = useRef<number>(1);

  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Handle Android Back Button
  useEffect(() => {
    if (!photo) return;

    // Push a state so back button can be intercepted
    window.history.pushState({ lightbox: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      if (zoomRef.current > 1) {
        // If zoomed, reset zoom and push state back so lightbox stays open
        setZoom(1);
        window.history.pushState({ lightbox: true }, "");
      } else {
        // If not zoomed, close lightbox
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up state if closing manually via button
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [photo?.id, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") { setZoom(1); onNext(); }
      if (e.key === "ArrowLeft") { setZoom(1); onPrev(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    setZoom(1);
  }, [photo?.id]);

  if (!photo) return null;

  const toggleZoom = () => {
    setZoom(prev => prev === 1 ? 2 : 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      startDistance.current = dist;
      initialZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && startDistance.current > 0) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = dist / startDistance.current;
      const nextZoom = Math.min(Math.max(initialZoom.current * ratio, 1), 5);
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    startDistance.current = 0;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden touch-none"
        onWheel={(e) => {
          if (e.ctrlKey) {
            setZoom(prev => Math.min(Math.max(prev - e.deltaY * 0.01, 1), 5));
          }
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 right-6 z-50 flex gap-2"
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full w-12 h-12"
            onClick={toggleZoom}
          >
            {zoom > 1 ? <ZoomOut className="w-8 h-8" /> : <ZoomIn className="w-8 h-8" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full w-12 h-12"
            onClick={onClose}
          >
            <X className="w-8 h-8" />
          </Button>
        </motion.div>

        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {zoom === 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/10 rounded-full w-14 h-14 hidden md:flex"
              onClick={() => { setZoom(1); onPrev(); }}
            >
              <ChevronLeft className="w-10 h-10" />
            </Button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 1.1 }}
              drag={zoom > 1 ? true : "x"}
              dragConstraints={zoom > 1 ? false : { left: 0, right: 0 }}
              dragElastic={zoom > 1 ? 0 : 0.5}
              onDragEnd={(e, { offset, velocity }) => {
                if (zoom === 1) {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                  if (swipe && offset.x > 0) {
                    onPrev();
                  } else if (swipe && offset.x < 0) {
                    onNext();
                  }
                }
              }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
              onClick={() => zoom > 1 && setZoom(1)}
            >
              <img
                src={photo.full}
                alt={photo.filename}
                className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm pointer-events-none"
                onDoubleClick={toggleZoom}
              />
              
              {zoom === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 text-center text-white max-w-lg"
                >
                  {photo.location?.name_en && photo.location.name_en !== "Unsorted Photos" && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-px w-8 bg-primary/50" />
                      <h3 className="text-2xl font-light tracking-widest uppercase">
                        {photo.location?.name_en}
                      </h3>
                      <div className="h-px w-8 bg-primary/50" />
                    </div>
                  )}
                  {photo.location?.name_cn && photo.location.name_en !== "Unsorted Photos" && (
                    <p className="text-primary font-medium mb-2">{photo.location.name_cn}</p>
                  )}
                  <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase">
                    {new Date(photo.dateTaken).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {photo.uploader?.name && ` • BY ${photo.uploader.name}`}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {zoom === 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/10 rounded-full w-14 h-14 hidden md:flex"
              onClick={() => { setZoom(1); onNext(); }}
            >
              <ChevronRight className="w-10 h-10" />
            </Button>
          )}
        </div>
        
        {/* Mobile Navigation */}
        {zoom === 1 && (
          <div className="flex gap-12 mt-4 md:hidden z-50">
             <Button variant="ghost" className="text-white h-12 px-6 rounded-full border border-white/20" onClick={() => { setZoom(1); onPrev(); }}>
               <ChevronLeft className="w-6 h-6 mr-2" /> Prev
             </Button>
             <Button variant="ghost" className="text-white h-12 px-6 rounded-full border border-white/20" onClick={() => { setZoom(1); onNext(); }}>
               Next <ChevronRight className="w-6 h-6 ml-2" />
             </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
