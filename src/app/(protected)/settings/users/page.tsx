import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck } from "lucide-react";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleSelector } from "@/components/role-selector";
import { Badge } from "@/components/ui/badge";
import { AccessRequestsTable } from "@/components/access-requests-table";
import { accessRequests } from "@/db/schema";
import { UserActionButtons } from "@/components/user-action-buttons";
import { cn } from "@/lib/utils";

export default async function PersonnelManagement() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const allUsers = await db.query.user.findMany({
    orderBy: (users, { asc }) => [asc(users.name)],
  });

  const pendingRequests = await db.query.accessRequests.findMany({
    orderBy: (req, { desc }) => [desc(req.createdAt)],
  });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase tracking-wider">Personnel Management</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage access levels and roles for all system users.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 px-4 py-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Access Active
          </Badge>
          <CreateUserDialog />
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse">
              {pendingRequests.filter(r => r.status === 'PENDING').length} PENDING
            </Badge>
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Access Applications</h3>
          </div>
          <AccessRequestsTable requests={pendingRequests} />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Authorized Personnel Database</h3>
        <Card className="bg-card border-border border-t-4 border-t-primary shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Name</TableHead>
                    <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Email Address</TableHead>
                    <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">System Role</TableHead>
                    <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id} className={cn(
                      "border-border transition-all",
                      !u.isActive ? "bg-muted/30 opacity-70" : "hover:bg-primary/[0.02]"
                    )}>
                      <TableCell className="px-6 py-6 font-black text-foreground tracking-tight text-base">
                        {u.name}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-muted-foreground font-medium text-sm italic">{u.email}</TableCell>
                      <TableCell className="px-6 py-6">
                         <Badge variant="secondary" className="font-black text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-md shadow-sm">
                           {u.role.replace("_", " ")}
                         </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge 
                          variant={u.isActive ? "default" : "outline"} 
                          className={cn(
                            "font-black text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border",
                            u.isActive 
                              ? "bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-600 shadow-sm" 
                              : "text-muted-foreground border-border"
                          )}
                        >
                          {u.isActive ? "ACTIVE" : "DISABLED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right">
                         <div className="flex items-center justify-end gap-4">
                            <RoleSelector userId={u.id} currentRole={u.role} />
                            <div className="h-4 w-[1px] bg-border" />
                            <UserActionButtons userId={u.id} isActive={u.isActive} userName={u.name} />
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
