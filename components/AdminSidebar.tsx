"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, ChevronRight, LayoutDashboard, Image as ImageIcon, MapPin, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed top-6 right-6 z-[100]">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-full w-12 h-12 backdrop-blur-md border border-white/10"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-card border-l border-white/10 z-[120] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-primary leading-none">Console</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Management Portal</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <SidebarLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/admin/photos" icon={<ImageIcon className="w-5 h-5" />} label="Photos" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/admin/locations" icon={<MapPin className="w-5 h-5" />} label="Locations" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/admin/profiles" icon={<Users className="w-5 h-5" />} label="Profiles" onClick={() => setIsOpen(false)} />
                <SidebarLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} label="System Settings" onClick={() => setIsOpen(false)} />
              </div>

              <div className="pt-8 border-t border-white/5">
                <Button asChild variant="ghost" className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive h-12 rounded-xl">
                  <Link href="/login">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">Exit Admin</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button asChild variant="ghost" className="w-full justify-start gap-4 h-14 rounded-xl group transition-all" onClick={onClick}>
      <Link href={href}>
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <span className="font-bold uppercase tracking-widest text-xs flex-1">{label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Link>
    </Button>
  );
}
