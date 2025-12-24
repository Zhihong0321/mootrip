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
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
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

function SortableRow({ loc, openEdit, deleteLoc, dayTitle }: any) {
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
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[50px]">
        <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-[80px] font-mono text-xs">{loc.order}</TableCell>
      <TableCell className="font-medium">{dayTitle}</TableCell>
      <TableCell className="font-semibold">{loc.name_en}</TableCell>
      <TableCell>{loc.name_cn || "-"}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="icon" onClick={() => openEdit(loc)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => deleteLoc(loc.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
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
        toast.error("Please filter by day to reorder within that day");
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Manage Locations</h1>
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Filter by Day</Label>
              <Select value={filterDayId} onValueChange={setFilterDayId}>
                <SelectTrigger>
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
            {filterDayId !== "all" && (
                <p className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-medium self-end mb-1">
                    Drag enabled for Day {getDayTitle(filterDayId)}
                </p>
            )}
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingLoc(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ 
                name_en: "", name_cn: "", dayId: filterDayId !== "all" ? filterDayId : (days[0]?.id || ""), order: filteredLocations.length + 1, latitude: 0, longitude: 0 
            })}>
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLoc ? "Edit Location" : "Add New Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. The Bund"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Chinese)</Label>
                <Input
                  value={formData.name_cn}
                  onChange={(e) => setFormData({ ...formData, name_cn: e.target.value })}
                  placeholder="e.g. 外滩"
                />
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Select value={formData.dayId} onValueChange={(val) => setFormData({ ...formData, dayId: val })}>
                  <SelectTrigger>
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
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingLoc ? "Update Location" : "Create Location"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
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
                  <SortableRow
                    key={loc.id}
                    loc={loc}
                    dayTitle={getDayTitle(loc.dayId)}
                    openEdit={openEdit}
                    deleteLoc={deleteLoc}
                  />
                ))}
              </SortableContext>
              {filteredLocations.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    No locations found for this selection.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <Toaster />
    </div>
  );
}
