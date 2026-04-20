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
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Personnel Management</h2>
          <p className="text-slate-400">Manage access levels and roles for all system users.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 border-teal-500/30 text-teal-400 bg-teal-500/5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Access Active
        </Badge>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 border-t-teal-500/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-400" />
            Registered Personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Current Role</TableHead>
                  <TableHead className="text-right text-slate-400">Access Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="font-medium text-slate-200">{u.name}</TableCell>
                    <TableCell className="text-slate-400">{u.email}</TableCell>
                    <TableCell>
                       <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
                         {u.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
