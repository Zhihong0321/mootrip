"use client";

import React, { useState, useEffect } from "react";
import { QuickUploadZone } from "@/components/QuickUploadZone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";
import { User, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickUploadPage() {
  const [uploaderName, setUploaderName] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  // Load name from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem("uploader_name");
    if (savedName) setUploaderName(savedName);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUploaderName(newName);
    localStorage.setItem("uploader_name", newName);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="container max-w-2xl px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">快速传图</h1>
          <p className="text-muted-foreground text-sm font-medium">随时随地分享你的旅行瞬间</p>
        </div>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-muted/50 pb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-primary" />
                <Label htmlFor="uploaderName" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">您的称呼 (必填)</Label>
              </div>
              <Input
                id="uploaderName"
                placeholder="请输入您的名字，例如：小王"
                value={uploaderName}
                onChange={handleNameChange}
                className="h-14 rounded-2xl bg-muted/50 border-none text-lg font-bold placeholder:font-normal placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <QuickUploadZone
              uploaderName={uploaderName}
              onUploadComplete={(photo) => setUploadedPhotos((prev) => [photo, ...prev])}
            />
          </CardContent>
        </Card>

        <AnimatePresence>
          {uploadedPhotos.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> 本次上传 ({uploadedPhotos.length})
                </h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {uploadedPhotos.map((photo) => (
                  <motion.div 
                    key={photo.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm border border-muted-foreground/10"
                  >
                    <img
                      src={photo.thumbnail}
                      alt="uploaded"
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
