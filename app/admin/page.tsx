import React from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Calendar, MapPin, Database, ArrowRight, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [photoCount, dayCount, locationCount, recentPhotos] = await Promise.all([
    prisma.photo.count(),
    prisma.day.count(),
    prisma.location.count(),
    prisma.photo.findMany({
        take: 5,
        orderBy: { dateTaken: 'desc' },
        include: { location: true }
    })
  ]);

  const stats = [
    {
      title: "Photos",
      value: photoCount,
      icon: Camera,
      color: "text-blue-500",
    },
    {
      title: "Trip Days",
      value: dayCount,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Spots",
      value: locationCount,
      icon: MapPin,
      color: "text-red-500",
    },
    {
      title: "Storage",
      value: "SQLite",
      icon: Database,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="px-4 py-8 md:p-8 space-y-8 bg-muted/10 min-h-screen">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary leading-none">Admin</h1>
        <Button asChild variant="outline" className="rounded-full bg-white shadow-sm h-10 px-4 text-xs font-bold uppercase tracking-widest">
            <Link href="/" target="_blank">View Live <ArrowRight className="ml-2 w-3 h-3" /></Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-4">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-3 h-3 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-primary/5 bg-white/80">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-lg font-black uppercase italic tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <div className="space-y-2">
              {recentPhotos.map((photo: any) => (
                <div key={photo.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-muted-foreground/10">
                    <img src={photo.thumbnail} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-none mb-1">{photo.filename.split('-').slice(1).join('-')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {photo.location.name_en} • {new Date(photo.dateTaken).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 h-5 font-black uppercase hidden sm:flex border-primary/20 text-primary">{photo.location.name_cn || 'N/A'}</Badge>
                </div>
              ))}
              {recentPhotos.length === 0 && (
                  <p className="text-sm text-muted-foreground py-12 text-center font-medium italic">No memories captured yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-white/80 h-fit">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-lg font-black uppercase italic tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-6 pb-6">
             <Button asChild className="w-full justify-start h-14 rounded-2xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs" size="lg">
                <Link href="/admin/upload">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                        <Upload className="w-4 h-4" />
                    </div>
                    Bulk Upload
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl border-muted-foreground/10 hover:bg-muted font-bold uppercase tracking-widest text-xs" size="lg">
                <Link href="/admin/days">
                    <div className="bg-muted p-2 rounded-lg mr-3">
                        <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    Manage Days
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl border-muted-foreground/10 hover:bg-muted font-bold uppercase tracking-widest text-xs" size="lg">
                <Link href="/admin/locations">
                    <div className="bg-muted p-2 rounded-lg mr-3">
                        <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    Manage Spots
                </Link>
             </Button>
             <div className="pt-4 mt-2 border-t border-dashed border-muted-foreground/20">
                <Button asChild variant="secondary" className="w-full justify-center h-10 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] opacity-50 hover:opacity-100 transition-opacity" size="sm">
                    <Link href="/admin/settings">
                        <Settings className="mr-2 w-3 h-3" /> System Configuration
                    </Link>
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
