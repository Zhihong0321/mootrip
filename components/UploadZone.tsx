"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { processImageClient } from "@/lib/client-processing";

interface UploadZoneProps {
  onUploadComplete: (photo: any) => void;
  dayId?: string;
  locationId?: string;
}

export function UploadZone({ onUploadComplete, dayId, locationId }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // 1. Process Client-Side
        setProcessing(true);
        const processed = await processImageClient(file);
        setProcessing(false);

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append("full", processed.full, `full-${file.name}`);
        formData.append("medium", processed.medium, `medium-${file.name}`);
        formData.append("thumbnail", processed.thumbnail, `thumb-${file.name.split('.')[0]}.webp`);
        formData.append("metadata", JSON.stringify(processed.metadata));
        formData.append("originalName", file.name);
        
        if (dayId) formData.append("dayId", dayId);
        if (locationId) formData.append("locationId", locationId);

        // 3. Upload Optimized Files
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onUploadComplete(data);
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error) {
        console.error(error);
        toast.error(`Failed to process or upload ${file.name}`);
        setProcessing(false);
      }
    }

    setUploading(false);
    toast.success("Upload session complete");
  }, [dayId, locationId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <Card
      {...getRootProps()}
      className={`p-10 border-2 border-dashed cursor-pointer transition-colors ${
        isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium">
            {processing ? "Optimizing photo..." : isDragActive ? "Drop photos here" : "Click or drag photos here"}
          </p>
          <p className="text-sm text-muted-foreground">
            {processing ? "Heavier lifting is being done in your browser" : "Upload images from your Shanghai trip"}
          </p>
        </div>
        {uploading && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {processing ? "Crunching pixels..." : `Uploading optimized assets (${Math.round(progress)}%)`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
