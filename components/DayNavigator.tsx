"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DayNavigatorProps {
  days: any[];
}

export function DayNavigator({ days }: DayNavigatorProps) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex overflow-x-auto no-scrollbar space-x-4 pb-2">
          {days.map((day) => {
            const href = `/gallery/${day.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={day.id}
                href={href}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full transition-all flex items-center space-x-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <span className="font-medium whitespace-nowrap">Day {day.order}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
