"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Building2, Info, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccessRequestAction } from "@/app/actions/access-requests";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { toast } from "sonner";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  purpose: string;
  status: string;
  createdAt: Date;
}

export function AccessRequestsTable({ requests }: { requests: AccessRequest[] }) {
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to dismiss this request?")) return;
    
    const result = await deleteAccessRequestAction(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Request dismissed.");
    }
  }

  return (
    <Card className="bg-card border-border border-l-4 border-l-amber-500 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Applicant</TableHead>
                <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Organization</TableHead>
                <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Purpose of Access</TableHead>
                <TableHead className="text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Submitted</TableHead>
                <TableHead className="text-right text-muted-foreground font-black text-[10px] uppercase tracking-widest px-6 py-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="border-border hover:bg-amber-500/[0.02] transition-all group">
                  <TableCell className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-foreground tracking-tight">{req.name}</span>
                      <span className="text-xs text-muted-foreground font-medium">{req.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      {req.organization || "Independent"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 max-w-md">
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 italic">
                        "{req.purpose}"
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                      {format(new Date(req.createdAt), "MMM d, yyyy • HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CreateUserDialog 
                        initialData={{ name: req.name, email: req.email }}
                        requestId={req.id}
                        trigger={
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Approve & Create User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                        title="Dismiss Request"
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
