"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Cloud, Info, ScrollText, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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

        <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Application Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
