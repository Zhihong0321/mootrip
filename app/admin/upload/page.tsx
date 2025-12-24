"use client";

import React, { useEffect, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { Plus, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadPage() {
  const [days, setDays] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  const [newDayOpen, setNewDayOpen] = useState(false);
  const [newLocOpen, setNewLocOpen] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newLocName, setNewLocName] = useState("");

  const fetchDays = async () => {
    const res = await fetch("/api/days");
    const data = await res.json();
    setDays(data);
    if (!selectedDay && data.length > 0) setSelectedDay(data[0].id);
  };

  useEffect(() => {
    fetchDays();
  }, []);

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/days", {
      method: "POST",
      body: JSON.stringify({
        title: newDayTitle,
        date: new Date().toISOString().split("T")[0],
        order: days.length + 1
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Day created");
      setNewDayOpen(false);
      setNewDayTitle("");
      fetchDays();
      setSelectedDay(data.id);
    }
  };

  const handleCreateLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    const res = await fetch("/api/locations", {
      method: "POST",
      body: JSON.stringify({
        name_en: newLocName,
        dayId: selectedDay,
        order: locations.length + 1
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Location created");
      setNewLocOpen(false);
      setNewLocName("");
      fetchDays();
      setSelectedLocation(data.id);
    }
  };

  useEffect(() => {
    if (selectedDay) {
      const day = days.find((d) => d.id === selectedDay);
      setLocations(day?.locations || []);
      if (!day?.locations?.find((l: any) => l.id === selectedLocation)) {
        if (day?.locations?.length > 0) {
          setSelectedLocation(day.locations[0].id);
        } else {
          setSelectedLocation("");
        }
      }
    }
  }, [selectedDay, days, selectedLocation]);

  return (
    <div className="container px-4 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Upload</h1>
        <p className="text-muted-foreground text-sm font-medium">Add new memories to your trip gallery</p>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" /> Destination Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="day" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Trip Day</Label>
                <Dialog open={newDayOpen} onOpenChange={setNewDayOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold uppercase tracking-tighter text-primary hover:bg-primary/10">
                      <Plus className="w-3 h-3 mr-1" /> New Day
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-t-3xl sm:rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase italic">Quick Create Day</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDay} className="space-y-4 pt-4">
                      <Input
                        placeholder="e.g. Day 8: Departure"
                        value={newDayTitle}
                        onChange={(e) => setNewDayTitle(e.target.value)}
                        className="h-12 bg-muted/30 border-none text-lg font-medium"
                        required
                      />
                      <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Create Day</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none text-base font-medium">
                  <SelectValue placeholder="Choose Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id} className="h-10">
                      Day {day.order}: {day.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="location" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Specific Spot</Label>
                <Dialog open={newLocOpen} onOpenChange={setNewLocOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-bold uppercase tracking-tighter text-primary hover:bg-primary/10" disabled={!selectedDay}>
                      <Plus className="w-3 h-3 mr-1" /> New Spot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-t-3xl sm:rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase italic">Quick Create Spot</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateLoc} className="space-y-4 pt-4">
                      <Input
                        placeholder="e.g. Pudong Airport"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        className="h-12 bg-muted/30 border-none text-lg font-medium"
                        required
                      />
                      <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Create Spot</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none text-base font-medium">
                  <SelectValue placeholder="Choose Spot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id} className="h-10">
                      {loc.name_en} {loc.name_cn && `/ ${loc.name_cn}`}
                    </SelectItem>
                  ))}
                  {locations.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground italic">No spots found for this day</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <UploadZone
                dayId={selectedDay}
                locationId={selectedLocation}
                onUploadComplete={(photo) => setUploadedPhotos((prev) => [photo, ...prev])}
            />
          </div>
        </CardContent>
      </Card>

      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-black tracking-[0.2em] text-muted-foreground px-1">Session History</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm border border-muted-foreground/10 group">
                <img
                  src={photo.thumbnail}
                  alt={photo.filename}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
