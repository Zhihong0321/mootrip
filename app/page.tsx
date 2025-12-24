"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center overflow-hidden">
      {/* Abstract Background Decoration */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </motion.div>

      <div className="relative z-10 space-y-12 max-w-2xl">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block p-5 rounded-full bg-primary/10 mb-2"
          >
            <Camera className="w-12 h-12 text-primary" />
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase">
            Shanghai <br />
            <span className="text-primary tracking-normal not-italic lowercase font-light">Trip 2024</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
          >
            A visual journey through Shanghai & Hangzhou. <br className="hidden md:block" />
            <span className="font-medium text-foreground">800+</span> memories captured in pixels.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <Link href="/gallery">Start Exploring</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-medium backdrop-blur-sm hover:bg-primary/5 transition-all">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
          Built with Next.js & Prisma
        </span>
      </motion.div>
    </div>
  );
}
