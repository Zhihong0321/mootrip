import React from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Calendar, MapPin, Database, ArrowRight, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      title: "Total Photos",
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
      title: "Locations",
      value: locationCount,
      icon: MapPin,
      color: "text-red-500",
    },
    {
      title: "Active Data",
      value: "SQLite",
      icon: Database,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-muted/10 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-primary">Dashboard</h1>
        <Button asChild variant="outline" className="rounded-full bg-white">
            <Link href="/" target="_blank">View Live Site <ArrowRight className="ml-2 w-4 h-4" /></Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                    <img src={photo.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{photo.filename.split('-').slice(1).join('-')}</p>
                    <p className="text-xs text-muted-foreground">{photo.location.name_en} • {new Date(photo.dateTaken).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">{photo.location.name_cn || 'N/A'}</Badge>
                </div>
              ))}
              {recentPhotos.length === 0 && (
                  <p className="text-sm text-muted-foreground py-10 text-center">No photos uploaded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             <Button asChild className="w-full justify-start h-12 rounded-xl shadow-lg shadow-primary/10" size="lg">
                <Link href="/admin/upload">
                    <Upload className="mr-3 w-5 h-5" /> Bulk Upload Photos
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start h-12 rounded-xl border-dashed" size="lg">
                <Link href="/admin/days">
                    <Calendar className="mr-3 w-5 h-5" /> Manage Trip Days
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start h-12 rounded-xl border-dashed" size="lg">
                <Link href="/admin/locations">
                    <MapPin className="mr-3 w-5 h-5" /> Manage Locations
                </Link>
             </Button>
             <div className="pt-4 mt-4 border-t border-dashed">
                <p className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest px-1">System</p>
                <Button asChild variant="secondary" className="w-full justify-start h-12 rounded-xl" size="lg">
                    <Link href="/admin/settings">
                        <Settings className="mr-3 w-5 h-5" /> System Settings
                    </Link>
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
