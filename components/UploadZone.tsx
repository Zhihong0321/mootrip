"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { processImageClient } from "@/lib/client-processing";
import { CloudUpload, Zap } from "lucide-react";

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
    let wakeLock: any = null;
    
    // Log start of session
    fetch("/api/logs", {
        method: "POST",
        body: JSON.stringify({ 
            level: "info", 
            message: `Upload session started: ${acceptedFiles.length} files`,
            details: { 
                ua: navigator.userAgent,
                files: acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
            }
        })
    });

    if ('wakeLock' in navigator) {
      try {
        wakeLock = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }

    setUploading(true);
    setProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        setProcessing(true);
        const processed = await processImageClient(file);
        setProcessing(false);

        const formData = new FormData();
        formData.append("full", processed.full, `full-${file.name}`);
        formData.append("medium", processed.medium, `medium-${file.name}`);
        formData.append("thumbnail", processed.thumbnail, `thumb-${file.name.split('.')[0]}.webp`);
        formData.append("metadata", JSON.stringify(processed.metadata));
        formData.append("originalName", file.name);
        
        if (dayId) formData.append("dayId", dayId);
        if (locationId) formData.append("locationId", locationId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        if (data.skipped) {
          toast.info(`Skipped ${file.name}: Duplicate detected`, {
            description: "This photo already exists in the gallery."
          });
        } else {
          onUploadComplete(data);
        }
        
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error: any) {
        console.error(error);
        const errorMsg = error?.message || "Unknown processing/upload error";
        
        // Log detailed error to server
        fetch("/api/logs", {
            method: "POST",
            body: JSON.stringify({ 
                level: "error", 
                message: `Upload failed for ${file.name}`,
                details: { 
                    error: errorMsg,
                    stack: error?.stack,
                    fileName: file.name,
                    fileSize: file.size
                }
            })
        });

        toast.error(`Failed: ${file.name} - ${errorMsg}`);
        setProcessing(false);
        setUploading(false); // Ensure UI resets
      }
    }

    setUploading(false);
    toast.success("Upload session complete");

    if (wakeLock) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  }, [dayId, locationId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <Card
      {...getRootProps()}
      className={`relative p-6 md:p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 shadow-inner ${
        isDragActive 
          ? "border-primary bg-primary/5 scale-[0.99] ring-4 ring-primary/10" 
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-2xl transition-colors duration-300 ${isDragActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
          <CloudUpload className={`w-8 h-8 ${isDragActive ? 'animate-bounce' : ''}`} />
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-black uppercase italic tracking-tight">
            {processing ? "Optimizing Assets" : isDragActive ? "Release to Drop" : "Tap to Select"}
          </p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.1em]">
            {processing 
              ? "Applying high-quality compression" 
              : "Multiple files supported"}
          </p>
        </div>

        {(uploading || processing) && (
          <div className="w-full max-w-xs space-y-3 pt-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> {processing ? "Processing" : "Transferring"}
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted overflow-hidden" />
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter italic">
              {processing ? "Heavier lifting is being done in your browser" : "Optimized payloads arriving at destination"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
