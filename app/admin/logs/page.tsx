"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Trash2, RefreshCcw, AlertCircle, Info as InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Clear all system logs?")) return;
    try {
      await fetch("/api/logs", { method: "DELETE" });
      setLogs([]);
      toast.success("Logs cleared");
    } catch (err) {
      toast.error("Failed to clear logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container px-4 py-8 md:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary leading-none">System Logs</h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">Real-time session diagnostics and error tracking</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-4">
                <RefreshCcw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLogs} className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-4 shadow-lg shadow-destructive/20">
                <Trash2 className="w-3 h-3 mr-2" /> Clear All
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" /> Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-dashed">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.level === "error" ? (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                        <InfoIcon className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                
                {log.details && (
                  <pre className="text-[10px] bg-black/5 p-3 rounded-xl overflow-x-auto font-mono text-muted-foreground whitespace-pre-wrap">
                    {log.details}
                  </pre>
                )}
              </div>
            ))}
            
            {logs.length === 0 && !loading && (
              <div className="p-12 text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium italic">The log is empty. Everything looks clean.</p>
              </div>
            )}
            
            {loading && (
                 <div className="p-12 text-center">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto text-primary opacity-20" />
                 </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
