"use client";

import React, { useEffect, useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
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

  // New state for inline creation
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
      fetchDays(); // Refresh days to get updated locations
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
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Batch Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="day">Target Day</Label>
                <Dialog open={newDayOpen} onOpenChange={setNewDayOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      <Plus className="w-3 h-3 mr-1" /> New Day
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Day</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDay} className="space-y-4">
                      <Input
                        placeholder="Day Title"
                        value={newDayTitle}
                        onChange={(e) => setNewDayTitle(e.target.value)}
                        required
                      />
                      <Button type="submit" className="w-full">Create</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.title} ({new Date(day.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Target Location</Label>
                <Dialog open={newLocOpen} onOpenChange={setNewLocOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled={!selectedDay}>
                      <Plus className="w-3 h-3 mr-1" /> New Loc
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Location</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateLoc} className="space-y-4">
                      <Input
                        placeholder="Location Name"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        required
                      />
                      <Button type="submit" className="w-full">Create</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name_en} / {loc.name_cn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <UploadZone
            dayId={selectedDay}
            locationId={selectedLocation}
            onUploadComplete={(photo) => setUploadedPhotos((prev) => [photo, ...prev])}
          />
        </CardContent>
      </Card>

      {uploadedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.thumbnail}
                    alt={photo.filename}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
}
