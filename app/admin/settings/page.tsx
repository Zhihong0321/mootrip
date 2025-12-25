"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Cloud, Info, ScrollText, Calendar, Loader2, Trash2, HardDrive, FileWarning, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Storage Diagnostics State
  const [storageData, setStorageData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Fetch profile
    fetch("/api/admin/profiles/me")
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                setProfile(data);
                setNewName(data.name);
            }
        });

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load settings");
        setLoading(false);
      });
  }, []);

  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        setSettings({ ...settings, [key]: value });
        toast.success("Settings updated");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleAutoDateMode = () => updateSetting("autoDateMode", !settings.autoDateMode);

  const scanStorage = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/storage");
      const data = await res.json();
      setStorageData(data);
      if (data.orphans.length === 0) {
        toast.success("Storage is clean! No orphaned files found.");
      } else {
        toast.warning(`Found ${data.orphans.length} orphaned files.`);
      }
    } catch (e) {
      toast.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const cleanOrphans = async () => {
    if (!storageData?.orphans?.length) return;
    if (!confirm(`Permanently delete ${storageData.orphans.length} files? This cannot be undone.`)) return;

    setCleaning(true);
    try {
      const filesToDelete = storageData.orphans.map((o: any) => o.path);
      const res = await fetch("/api/admin/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesToDelete }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(`Deleted ${result.deletedCount} files, freed ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB`);
        scanStorage(); // Refresh
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error("Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditingName(false);
        toast.success("Profile updated");
      }
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Settings</h1>
        <p className="text-muted-foreground text-sm font-medium">System configuration and diagnostics</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Auto Date Mode
                </CardTitle>
                <CardDescription>
                  When enabled, the gallery will ignore manual Day/Spot settings and organize photos automatically by their capture date.
                </CardDescription>
              </div>
              <Button 
                variant={settings?.autoDateMode ? "default" : "outline"}
                onClick={toggleAutoDateMode}
                disabled={saving}
                className="font-bold uppercase tracking-tighter"
              >
                {saving ? "Saving..." : settings?.autoDateMode ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-xs font-medium text-muted-foreground space-y-1">
              <p>• Gallery will group photos by date taken</p>
              <p>• Section headers will display the date</p>
              <p>• Photos will be shown in chronological order (oldest first)</p>
            </div>

            <div className="pt-4 border-t border-dashed space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Magic Effect Frequency</Label>
                  <Select 
                    value={settings?.magicEffectFrequency || "mild"} 
                    onValueChange={(v) => updateSetting("magicEffectFrequency", v)}
                    disabled={saving}
                  >
                    <SelectTrigger className="h-10 bg-muted/30 border-none font-bold uppercase tracking-tighter">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="border-none shadow-2xl rounded-xl">
                      <SelectItem value="frequent" className="font-bold uppercase tracking-tighter">Frequent (Every 9-12)</SelectItem>
                      <SelectItem value="mild" className="font-bold uppercase tracking-tighter">Mild (Every 12-15)</SelectItem>
                      <SelectItem value="low" className="font-bold uppercase tracking-tighter">Low (Every 18-20)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground font-medium italic">
                    Determines how often the Disney Magic Fade-in effect appears while scrolling.
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* STORAGE DIAGNOSTICS */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-orange-500" /> Storage Diagnostics
                </CardTitle>
                <CardDescription>
                  Scan persistent storage for orphaned files (files not linked to any database record).
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={scanStorage}
                disabled={scanning || cleaning}
                className="font-bold uppercase tracking-tighter"
              >
                {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <HardDrive className="w-4 h-4 mr-2" />}
                {scanning ? "Scanning..." : "Scan Storage"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {storageData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Total Usage</span>
                            <span className="text-2xl font-black tracking-tighter">{(storageData.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Total Files</span>
                            <span className="text-2xl font-black tracking-tighter">{storageData.fileCount}</span>
                        </div>
                    </div>

                    {storageData.orphans.length > 0 ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-red-500">
                                    <FileWarning className="w-5 h-5" />
                                    <span className="font-bold">Found {storageData.orphans.length} Orphans ({(storageData.orphans.reduce((acc:any, curr:any) => acc + curr.size, 0) / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={cleanOrphans}
                                    disabled={cleaning}
                                >
                                    {cleaning ? "Cleaning..." : "Clean All Orphans"}
                                </Button>
                            </div>
                            
                            <div className="h-40 rounded border bg-background/50 overflow-auto">
                                <div className="p-2 space-y-1">
                                    {storageData.orphans.map((o: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0">
                                            <span className="font-mono text-muted-foreground truncate max-w-[70%]">{o.displayPath}</span>
                                            <span className="font-medium">{(o.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground bg-green-500/5 rounded-lg border border-green-500/10">
                            <p className="text-sm font-medium text-green-600">Storage is clean. No anomalies detected.</p>
                        </div>
                    )}
                </div>
            )}
            {!storageData && (
                 <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <p className="text-sm">Click "Scan Storage" to analyze disk usage.</p>
                 </div>
            )}
          </CardContent>
        </Card>

        {/* PROFILE CARD */}
        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Profile & System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4 mb-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Active Profile</span>
                            {editingName ? (
                                <div className="flex gap-2 mt-1">
                                    <Input 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-8 text-sm font-bold"
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={handleUpdateName} disabled={saving} className="h-8 px-3 font-bold">Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => {setEditingName(false); setNewName(profile.name);}} className="h-8 px-3 font-bold">Cancel</Button>
                                </div>
                            ) : (
                                <h3 className="text-xl font-black tracking-tighter italic uppercase text-primary flex items-center gap-2">
                                    {profile.name}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingName(true)}>
                                        <RefreshCw className="w-3 h-3" />
                                    </Button>
                                </h3>
                            )}
                        </div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px]">
                            {profile.role}
                        </Badge>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Environment</span>
                <span className="text-sm font-bold text-green-500 uppercase tracking-tighter">Production (Railway)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Storage Volume</span>
                <span className="text-sm font-bold uppercase tracking-tighter">/storage (Persistent)</span>
            </div>
            <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Image Optimizer</span>
                <span className="text-sm font-bold uppercase tracking-tighter italic">Pro Client-Side Pipeline</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" /> Session Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Access detailed error logs and processing diagnostics from your recent upload sessions.</p>
            <Link 
              href="/admin/logs" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"
            >
              <Info className="w-4 h-4" /> View Full Activity Log
            </Link>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" /> Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You can verify system integrity at any time via the diagnostics endpoint.</p>
            <a 
              href="/api/health" 
              target="_blank" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"
            >
              <Info className="w-4 h-4" /> Run System Health Check
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}