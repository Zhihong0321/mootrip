"use client";

import React from "react";
import { CloudUpload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  return (
    <div className="fixed top-6 right-6 z-[100]">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 rounded-full w-12 h-12 backdrop-blur-md border border-white/10 shadow-2xl"
      >
        <Link href="/upload">
          <CloudUpload className="w-6 h-6" />
        </Link>
      </Button>
    </div>
  );
}
