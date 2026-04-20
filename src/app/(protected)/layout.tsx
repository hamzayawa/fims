import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, AlertCircle, Database, Users, FileText, Droplet, Layers } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { NotificationBell } from "@/components/notification-bell";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role as string;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border gap-2 text-primary">
          <Droplet className="w-6 h-6 fill-current" />
          <span className="font-bold text-lg tracking-tight text-foreground">FIMS Portal</span>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>

          {(role === "ADMIN" || role === "DATA_OFFICER" || role === "FIELD_AGENT") && (
            <Link href="/incidents" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
              <Database className="w-4 h-4" /> Incident Registry
            </Link>
          )}

          {(role === "ADMIN" || role === "DATA_OFFICER") && (
            <Link href="/alerts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
              <AlertCircle className="w-4 h-4" /> Alerts & Notices
            </Link>
          )}

          <Link href="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
            <FileText className="w-4 h-4" /> Reports
          </Link>

          {(role === "ADMIN" || role === "DATA_OFFICER") && (
            <Link href="/resources" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
              <Layers className="w-4 h-4" /> Resource Inventory
            </Link>
          )}

          {role === "ADMIN" && (
            <Link href="/settings/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all font-medium text-sm">
              <Users className="w-4 h-4" /> Personnel Management
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-muted p-3 rounded-xl border border-border mb-3">
             <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
             <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{role.replace('_', ' ')}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-bold text-foreground">System Overview</h1>
             <div className="h-4 w-[1px] bg-border hidden md:block" />
             <NotificationBell />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-muted/20">
           {children}
        </div>
      </main>
    </div>
  );
}
