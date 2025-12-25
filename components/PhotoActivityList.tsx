"use client";

import React, { useState } from "react";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PhotoItemProps {
  photo: any;
  onDelete?: (id: string) => void;
}

export function PhotoActivityItem({ photo: initialPhoto, onDelete }: PhotoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this photo?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/photos/${initialPhoto.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Photo deleted");
        onDelete?.(initialPhoto.id);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast.error("Failed to delete photo");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all group ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}>
      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-muted-foreground/10 relative">
        <img 
          src={initialPhoto.thumbnail} 
          alt="" 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
             (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a href={initialPhoto.full} target="_blank" rel="noreferrer" className="text-white">
                <ExternalLink className="w-4 h-4" />
            </a>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-none mb-1">
            {initialPhoto.filename.includes('-') ? initialPhoto.filename.split('-').slice(1).join('-') : initialPhoto.filename}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
            {initialPhoto.location?.name_en && initialPhoto.location.name_en !== "Unsorted Photos" ? initialPhoto.location.name_en : ''}
            {initialPhoto.location?.name_en && initialPhoto.location.name_en !== "Unsorted Photos" ? ' • ' : ''}
            {initialPhoto.dateTaken ? new Date(initialPhoto.dateTaken).toISOString().split('T')[0] : 'Unknown Date'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[9px] px-1.5 h-5 font-black uppercase hidden sm:flex border-primary/20 text-primary">
            {initialPhoto.location?.name_cn || 'N/A'}
        </Badge>
        <button 
          onClick={handleDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function PhotoActivityList({ initialPhotos }: { initialPhotos: any[] }) {
  const [photos, setPhotos] = useState(initialPhotos);

  const handleDelete = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-2">
      {photos.map((photo) => (
        <PhotoActivityItem key={photo.id} photo={photo} onDelete={handleDelete} />
      ))}
      {photos.length === 0 && (
        <p className="text-sm text-muted-foreground py-12 text-center font-medium italic">No memories captured yet.</p>
      )}
    </div>
  );
}
