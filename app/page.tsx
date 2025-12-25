"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollingBackground } from "@/components/ScrollingBackground";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center overflow-hidden">
      <ScrollingBackground />
      <AdminSidebar />

      <div className="relative z-10 space-y-12 max-w-4xl">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <h1 className="flex flex-col items-center select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            <span className="text-xl md:text-3xl font-light tracking-[0.3em] uppercase opacity-80 mb-2">
              Moo's Family
            </span>
            <span className="text-6xl md:text-[120px] font-black tracking-[calc(-0.02em)] italic uppercase leading-[0.9] block">
              SHANGHAI
            </span>
            <span className="text-6xl md:text-[120px] font-black tracking-[calc(-0.02em)] italic uppercase leading-[0.9] block">
              HANGZHOU
            </span>
            <span className="text-6xl md:text-[120px] font-black tracking-[calc(-0.02em)] italic uppercase leading-[0.9] block">
              SUZHOU
            </span>
            <span className="text-white tracking-[0.3em] font-black text-4xl md:text-[60px] block mt-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              2025
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg md:text-2xl text-white/80 font-bold tracking-[0.1em] max-w-xl mx-auto leading-relaxed"
          >
            来自爸妈的礼，<br />
            全家一起的旅。
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          <Button asChild size="lg" className="rounded-full px-12 h-16 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 hover:shadow-primary/60 transition-all active:scale-95 group">
            <Link href="/gallery" className="flex items-center gap-3">
              Enter Gallery <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
            <div className="h-px w-8 bg-current" />
            Captured with Love
            <div className="h-px w-8 bg-current" />
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black to-transparent pointer-events-none z-[5]" />
    </div>
  );
}
