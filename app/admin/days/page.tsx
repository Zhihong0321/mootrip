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

function SortableRow({ day, openEdit, deleteDay }: any) {
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
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[50px]">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-[80px] font-mono text-xs">{day.order}</TableCell>
      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
      <TableCell className="font-medium">{day.title}</TableCell>
      <TableCell>{day.locations?.length || 0}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="icon" onClick={() => openEdit(day)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => deleteDay(day.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
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
        
        // Update order numbers
        const updatedArray = newArray.map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));

        // Send to API
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Days</h1>
          <p className="text-muted-foreground text-sm">Drag rows to reorder</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingDay(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ title: "", date: "", order: days.length + 1 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Day
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDay ? "Edit Day" : "Add New Day"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Arrival in Shanghai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
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
                {editingDay ? "Update Day" : "Create Day"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader>
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
                  <SortableRow
                    key={day.id}
                    day={day}
                    openEdit={openEdit}
                    deleteDay={deleteDay}
                  />
                ))}
              </SortableContext>
              {days.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No days found. Add one to get started.
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
