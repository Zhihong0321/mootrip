import React from "react";
import Link from "next/link";
import { LayoutDashboard, Upload, Calendar, MapPin } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted/30 border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Shanghai Trip Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/upload"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Photos</span>
          </Link>
          <Link
            href="/admin/days"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Manage Days</span>
          </Link>
          <Link
            href="/admin/locations"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>Manage Locations</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
