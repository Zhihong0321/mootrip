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
import { Toaster, toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, Calendar as CalendarIcon, MapPin } from "lucide-react";
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

function SortableItem({ day, openEdit, deleteDay }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 group">
      {/* Desktop Table Row (Visible on md+) */}
      <div className="hidden md:contents">
        <TableRow>
          <TableCell className="w-[50px]">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </TableCell>
          <TableCell className="w-[80px] font-mono text-xs font-bold text-primary">#{day.order}</TableCell>
          <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
          <TableCell className="font-semibold">{day.title}</TableCell>
          <TableCell>
            <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" /> {day.locations?.length || 0}
            </Badge>
          </TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="ghost" size="icon" onClick={() => openEdit(day)} className="h-8 w-8">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteDay(day.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      </div>

      {/* Mobile Card (Visible on <md) */}
      <Card className="md:hidden border-muted-foreground/10 overflow-hidden shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 bg-muted/50 rounded-lg">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">Day {day.order}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>
            </div>
            <h3 className="font-bold text-lg leading-tight">{day.title}</h3>
            <div className="flex items-center gap-3 pt-1">
                <Badge variant="outline" className="text-[10px] py-0 h-5 font-bold uppercase tracking-tighter">
                    {day.locations?.length || 0} Locations
                </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="icon" onClick={() => openEdit(day)} className="h-9 w-9 rounded-full shadow-sm">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => deleteDay(day.id)} className="h-9 w-9 rounded-full text-destructive shadow-sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DaysPage() {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", date: "", order: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchDays = async () => {
    const res = await fetch("/api/days");
    const data = await res.json();
    setDays(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDays();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDays((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        const updatedArray = newArray.map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));

        saveOrder(updatedArray);
        return updatedArray;
      });
    }
  };

  const saveOrder = async (updatedDays: any[]) => {
    try {
      const res = await fetch("/api/days/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedDays.map((d) => ({ id: d.id, order: d.order })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save new order");
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to save new order");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingDay ? "PATCH" : "POST";
    const url = editingDay ? `/api/days/${editingDay.id}` : "/api/days";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to save day");

      toast.success(editingDay ? "Day updated" : "Day created");
      setIsOpen(false);
      setEditingDay(null);
      setFormData({ title: "", date: "", order: 0 });
      fetchDays();
    } catch (error) {
      toast.error("Error saving day");
    }
  };

  const deleteDay = async (id: string) => {
    if (!confirm("Are you sure? This will delete all locations and photos assigned to this day.")) return;

    try {
      const res = await fetch(`/api/days/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Day deleted");
      fetchDays();
    } catch (error) {
      toast.error("Error deleting day");
    }
  };

  const openEdit = (day: any) => {
    setEditingDay(day);
    setFormData({
      title: day.title,
      date: new Date(day.date).toISOString().split("T")[0],
      order: day.order,
    });
    setIsOpen(true);
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Manage Days</h1>
          <p className="text-muted-foreground text-sm font-medium">Reorder and organize your trip timeline</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingDay(null);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg h-12 px-6 font-bold uppercase tracking-widest text-xs" onClick={() => setFormData({ title: "", date: "", order: days.length + 1 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Day
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">{editingDay ? "Edit Day" : "New Day"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Trip Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Arrival in Shanghai"
                  className="h-12 text-lg font-medium bg-muted/30 border-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-12 bg-muted/30 border-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Sequence Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="h-12 bg-muted/30 border-none font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                {editingDay ? "Update Information" : "Create New Day"}
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
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={days.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {days.map((day) => (
                  <SortableItem
                    key={day.id}
                    day={day}
                    openEdit={openEdit}
                    deleteDay={deleteDay}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-1">
          <SortableContext
            items={days.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {days.map((day) => (
              <SortableItem
                key={day.id}
                day={day}
                openEdit={openEdit}
                deleteDay={deleteDay}
              />
            ))}
          </SortableContext>
        </div>

        {days.length === 0 && !loading && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/10">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No days found</p>
          </div>
        )}
      </DndContext>
      <Toaster position="top-center" />
    </div>
  );
}
