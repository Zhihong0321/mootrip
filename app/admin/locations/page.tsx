"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, MapPin } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function SortableItem({ loc, openEdit, deleteLoc, dayTitle }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: loc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 group">
      {/* Desktop View */}
      <div className="hidden md:contents">
        <TableRow>
          <TableCell className="w-[50px]">
            <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </TableCell>
          <TableCell className="w-[80px] font-mono text-xs font-bold text-primary">#{loc.order}</TableCell>
          <TableCell className="font-medium text-muted-foreground text-xs uppercase tracking-tighter">{dayTitle}</TableCell>
          <TableCell className="font-semibold">{loc.name_en === "Unsorted Photos" ? "General" : loc.name_en}</TableCell>
          <TableCell>{loc.name_en === "Unsorted Photos" ? "-" : (loc.name_cn || "-")}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="ghost" size="icon" onClick={() => openEdit(loc)} className="h-8 w-8">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteLoc(loc.id)} className="h-8 w-8 text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      </div>

      {/* Mobile Card View */}
      <Card className="md:hidden border-muted-foreground/10 shadow-sm overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab p-2 bg-muted/50 rounded-lg">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">{dayTitle}</p>
                <p className="text-[10px] font-mono font-bold text-muted-foreground">ORD {loc.order}</p>
            </div>
            <h3 className="font-bold text-lg leading-tight">{loc.name_en === "Unsorted Photos" ? "General" : loc.name_en}</h3>
            {loc.name_cn && loc.name_en !== "Unsorted Photos" && (
                <p className="text-sm text-muted-foreground font-medium">{loc.name_cn}</p>
            )}
            <div className="flex gap-2 pt-1">
                {loc.latitude && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-mono">
                        {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                    </Badge>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="icon" onClick={() => openEdit(loc)} className="h-9 w-9 rounded-full">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => deleteLoc(loc.id)} className="h-9 w-9 rounded-full text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name_en: "", 
    name_cn: "", 
    dayId: "", 
    order: 0,
    latitude: 0,
    longitude: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [filterDayId, setFilterDayId] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    const [locRes, daysRes] = await Promise.all([
      fetch("/api/locations"),
      fetch("/api/days")
    ]);
    const locs = await locRes.json();
    const ds = await daysRes.json();
    setLocations(locs);
    setDays(ds);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (filterDayId === "all") {
        toast.error("Filter by day first to reorder");
        return;
    }

    if (over && active.id !== over.id) {
      setLocations((items) => {
        const filteredItems = items.filter(i => i.dayId === filterDayId);
        const nonFilteredItems = items.filter(i => i.dayId !== filterDayId);
        
        const oldIndex = filteredItems.findIndex((i) => i.id === active.id);
        const newIndex = filteredItems.findIndex((i) => i.id === over.id);
        const movedArray = arrayMove(filteredItems, oldIndex, newIndex);
        
        const updatedFiltered = movedArray.map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));

        const finalArray = [...nonFilteredItems, ...updatedFiltered];
        saveOrder(updatedFiltered);
        return finalArray;
      });
    }
  };

  const saveOrder = async (updatedLocs: any[]) => {
    try {
      const res = await fetch("/api/locations/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedLocs.map((l) => ({ id: l.id, order: l.order })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save order");
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to save order");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingLoc ? "PATCH" : "POST";
    const url = editingLoc ? `/api/locations/${editingLoc.id}` : "/api/locations";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to save location");

      toast.success(editingLoc ? "Location updated" : "Location created");
      setIsOpen(false);
      setEditingLoc(null);
      fetchData();
    } catch (error) {
      toast.error("Error saving location");
    }
  };

  const deleteLoc = async (id: string) => {
    if (!confirm("Are you sure? This will delete photos assigned to this location.")) return;

    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Location deleted");
      fetchData();
    } catch (error) {
      toast.error("Error deleting location");
    }
  };

  const openEdit = (loc: any) => {
    setEditingLoc(loc);
    setFormData({
      name_en: loc.name_en,
      name_cn: loc.name_cn || "",
      dayId: loc.dayId,
      order: loc.order,
      latitude: loc.latitude || 0,
      longitude: loc.longitude || 0
    });
    setIsOpen(true);
  };

  const getDayTitle = (dayId: string) => {
    return days.find(d => d.id === dayId)?.title || "Unknown Day";
  };

  const filteredLocations = locations
    .filter(loc => filterDayId === "all" || loc.dayId === filterDayId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Locations</h1>
          <div className="flex items-center gap-4">
            <div className="w-full max-w-[200px]">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block font-bold">Filter By Day</Label>
              <Select value={filterDayId} onValueChange={setFilterDayId}>
                <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-none">
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>{day.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingLoc(null);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg h-12 px-6 font-bold uppercase tracking-widest text-xs w-full md:w-auto" onClick={() => setFormData({ 
                name_en: "", name_cn: "", dayId: filterDayId !== "all" ? filterDayId : (days[0]?.id || ""), order: filteredLocations.length + 1, latitude: 0, longitude: 0 
            })}>
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">{editingLoc ? "Edit Location" : "New Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">English Name</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. The Bund"
                  className="h-12 text-lg font-medium bg-muted/30 border-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Chinese Name</Label>
                <Input
                  value={formData.name_cn}
                  onChange={(e) => setFormData({ ...formData, name_cn: e.target.value })}
                  placeholder="e.g. 外滩"
                  className="h-12 text-lg font-medium bg-muted/30 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Assigned Day</Label>
                <Select value={formData.dayId} onValueChange={(val) => setFormData({ ...formData, dayId: val })}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none">
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.id} value={day.id}>
                        {day.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="h-12 bg-muted/30 border-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="h-12 bg-muted/30 border-none font-mono"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                {editingLoc ? "Update Location" : "Create Location"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="hidden md:block border rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Name (CN)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={filteredLocations.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredLocations.map((loc) => (
                  <SortableItem
                    key={loc.id}
                    loc={loc}
                    dayTitle={getDayTitle(loc.dayId)}
                    openEdit={openEdit}
                    deleteLoc={deleteLoc}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-1">
          <SortableContext
            items={filteredLocations.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredLocations.map((loc) => (
              <SortableItem
                key={loc.id}
                loc={loc}
                dayTitle={getDayTitle(loc.dayId)}
                openEdit={openEdit}
                deleteLoc={deleteLoc}
              />
            ))}
          </SortableContext>
        </div>

        {filteredLocations.length === 0 && !loading && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/10">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No locations found</p>
          </div>
        )}
      </DndContext>
      <Toaster position="top-center" />
    </div>
  );
}
