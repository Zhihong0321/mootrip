"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Calendar, Trash2, ExternalLink, RefreshCw, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoManagementPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [photosRes, daysRes] = await Promise.all([
        fetch("/api/photos"),
        fetch("/api/days")
      ]);
      const photosData = await photosRes.json();
      const daysData = await daysRes.json();
      setPhotos(photosData);
      setDays(daysData);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePhoto = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const updated = await res.json();
        setPhotos(prev => prev.map(p => p.id === id ? updated : p));
        toast.success("Photo updated");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this photo?")) return;
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos(prev => prev.filter(p => p.id !== id));
        toast.success("Photo deleted");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredPhotos = filterDay === "all" 
    ? photos 
    : photos.filter(p => p.location?.dayId === filterDay);

  return (
    <div className="container px-4 py-8 md:py-12 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary leading-none">Management</h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">Adjust photo dates and locations</p>
        </div>
        <div className="flex gap-2">
            <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-muted/30 border-none font-bold text-xs uppercase tracking-widest">
                    <Filter className="w-3 h-3 mr-2" />
                    <SelectValue placeholder="Filter Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="all">All Days</SelectItem>
                    {days.map(day => (
                        <SelectItem key={day.id} value={day.id}>Day {day.order}: {day.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData} className="rounded-xl h-10 w-10">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden group">
            <CardContent className="p-0 flex h-40">
              <div className="w-1/3 relative h-full bg-muted">
                <img src={photo.thumbnail} alt="" className="w-full h-full object-cover" />
                <a href={photo.full} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                        <Input 
                            type="date" 
                            className="h-7 px-1 py-0 text-[11px] font-bold border-none bg-muted/50 rounded-lg w-32"
                            value={new Date(photo.dateTaken).toISOString().split('T')[0]}
                            onChange={(e) => handleUpdatePhoto(photo.id, { dateTaken: e.target.value })}
                        />
                    </div>
                    <button onClick={() => handleDelete(photo.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                    <Select 
                        value={photo.locationId} 
                        onValueChange={(val) => handleUpdatePhoto(photo.id, { locationId: val })}
                    >
                        <SelectTrigger className="h-7 px-2 py-0 text-[11px] font-bold border-none bg-muted/50 rounded-lg w-full truncate">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl max-h-60">
                            {days.map(day => (
                                <React.Fragment key={day.id}>
                                    <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-dashed mb-1 mt-2">Day {day.order}</div>
                                    {day.locations.map((loc: any) => (
                                        <SelectItem key={loc.id} value={loc.id} className="text-[11px]">
                                            {loc.name_en === "Unsorted Photos" ? "General" : loc.name_en}
                                        </SelectItem>
                                    ))}
                                </React.Fragment>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Uploader</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <User className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[10px] font-bold text-foreground">
                                {photo.uploader?.name || "System"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Original Data</span>
                        <div className="flex gap-2 mt-0.5">
                            {photo.location?.latitude ? (
                                <Badge variant="secondary" className="text-[8px] px-1 h-3.5 font-bold tabular-nums">
                                    {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}
                                </Badge>
                            ) : (
                                <span className="text-[9px] font-bold italic text-muted-foreground/40">No GPS</span>
                            )}
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-black uppercase border-primary/20 text-primary">
                        {photo.location?.name_en === "Unsorted Photos" ? 'General' : (photo.location?.name_cn || 'N/A')}
                    </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPhotos.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center text-muted-foreground italic">
                No photos found matching your criteria.
            </div>
        )}
      </div>
    </div>
  );
}
