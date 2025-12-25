"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Shield, Key, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfiles = () => {
    fetch("/api/admin/profiles")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error("Unauthorized");
        } else {
          setProfiles(data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, accessCode: newCode, role: newRole }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile created");
        setNewName("");
        setNewCode("");
        fetchProfiles();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this profile? Photos uploaded by them will remain but lose attribution.")) return;
    
    try {
      const res = await fetch("/api/admin/profiles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        toast.success("Profile deleted");
        fetchProfiles();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting profile");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profiles...</div>;

  return (
    <div className="container px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">Profiles</h1>
        <p className="text-muted-foreground font-medium">Manage family access and permissions</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Create Form */}
        <Card className="md:col-span-1 h-fit border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> New Profile
            </CardTitle>
            <CardDescription>Create a new access code for a family member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Display Name (e.g. Dad)" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="font-bold"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  placeholder="Access Code (Password)" 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  type="text"
                  className="font-mono tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Upload Only)</SelectItem>
                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full font-bold uppercase" disabled={submitting}>
                {submitting ? "Creating..." : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-2 border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Active Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border bg-background/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Name</th>
                        <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Role</th>
                        <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Code</th>
                        <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-center">Photos</th>
                        <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-bold">{profile.name}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                              profile.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {profile.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">{profile.accessCode}</td>
                          <td className="p-3 text-center font-bold">{profile._count.photos}</td>
                          <td className="p-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
