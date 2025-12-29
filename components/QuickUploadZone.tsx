"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { processImageClient } from "@/lib/client-processing";
import { CloudUpload, Zap, AlertTriangle } from "lucide-react";

interface QuickUploadZoneProps {
  onUploadComplete: (photo: any) => void;
  uploaderName: string;
}

export function QuickUploadZone({ onUploadComplete, uploaderName }: QuickUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!uploaderName.trim()) {
      toast.error("请输入您的名字后再上传");
      return;
    }

    let wakeLock: any = null;
    
    // Log start of session
    fetch("/api/logs", {
        method: "POST",
        body: JSON.stringify({ 
            level: "info", 
            message: `快速上传开始: ${uploaderName}, ${acceptedFiles.length} 个文件`,
            details: { 
                uploaderName,
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
    setTotalFiles(acceptedFiles.length);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      setCurrentFileIndex(i + 1);
      
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
        formData.append("uploaderName", uploaderName);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "上传失败");
        }

        if (data.skipped) {
          toast.info(`跳过 ${file.name}: 已存在`, {
            description: "这张照片已经存在于画廊中。"
          });
        } else {
          onUploadComplete(data);
        }
        
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error: any) {
        console.error(error);
        const errorMsg = error?.message || "未知处理/上传错误";
        
        // Log detailed error to server
        fetch("/api/logs", {
            method: "POST",
            body: JSON.stringify({ 
                level: "error", 
                message: `上传失败: ${file.name} (上传者: ${uploaderName})`,
                details: { 
                    error: errorMsg,
                    stack: error?.stack,
                    fileName: file.name,
                    fileSize: file.size
                }
            })
        });

        toast.error(`失败: ${file.name} - ${errorMsg}`);
        setProcessing(false);
      }
    }

    setUploading(false);
    toast.success("所有照片上传完成");

    if (wakeLock) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  }, [uploaderName, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: !uploaderName.trim() || uploading,
  });

  return (
    <div className="space-y-6">
      {uploading && (
        <div className="bg-destructive/10 border-2 border-destructive p-4 rounded-2xl flex items-center gap-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
          <div>
            <p className="text-destructive font-black text-lg">正在上传中，请勿关闭或刷新此页面！</p>
            <p className="text-destructive/80 text-sm font-bold">关闭页面会导致上传中断</p>
          </div>
        </div>
      )}

      <Card
        {...getRootProps()}
        className={`relative p-6 md:p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 shadow-inner ${
          !uploaderName.trim() ? "opacity-50 cursor-not-allowed bg-muted" :
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
              {!uploaderName.trim() ? "请先输入名字" : processing ? "正在优化照片" : isDragActive ? "松开即可上传" : "点击或拖拽照片到这里"}
            </p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.1em]">
              {!uploaderName.trim() ? "输入名字后即可开始上传" : processing 
                ? "正在进行高质量压缩" 
                : "支持一次性选择多张照片"}
            </p>
          </div>

          {(uploading || processing) && (
            <div className="w-full max-w-xs space-y-3 pt-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> {processing ? "正在处理" : "正在传输"} ({currentFileIndex}/{totalFiles})
                  </span>
                  <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-muted overflow-hidden rounded-full" />
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter italic">
                {processing ? "正在您的浏览器中处理照片" : "照片正在飞往服务器"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
