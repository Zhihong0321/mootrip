import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Cloud, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container px-4 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Settings</h1>
        <p className="text-muted-foreground text-sm font-medium">System configuration and diagnostics</p>
      </div>

      <div className="grid gap-6">
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
