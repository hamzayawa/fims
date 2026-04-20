import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase tracking-wider">Personnel Management</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage access levels and roles for all system users.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-4 py-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Access Active
        </Badge>
      </div>

      <Card className="bg-card border-border border-t-4 border-t-primary shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/5 border-b border-border py-6">
          <CardTitle className="text-xs font-black text-muted-foreground flex items-center gap-2 uppercase tracking-widest pl-1">
            <Users className="h-4 w-4 text-primary" />
            Registered Personnel Database
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Name</TableHead>
                  <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Email Address</TableHead>
                  <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">System Role</TableHead>
                  <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Access Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.id} className="border-border hover:bg-primary/[0.02] transition-all">
                    <TableCell className="px-6 py-6 font-black text-foreground tracking-tight text-base">{u.name}</TableCell>
                    <TableCell className="px-6 py-6 text-muted-foreground font-medium text-sm italic">{u.email}</TableCell>
                    <TableCell className="px-6 py-6">
                       <Badge variant="secondary" className="font-black text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-md shadow-sm">
                         {u.role.replace("_", " ")}
                       </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                       <RoleSelector userId={u.id} currentRole={u.role} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
