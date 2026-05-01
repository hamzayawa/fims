"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignIncidentAction } from "@/app/actions/incidents";
import { toast } from "sonner";
import { useState } from "react";
import { User } from "lucide-react";

interface AssignPersonnelProps {
  incidentId: string;
  currentAssigneeId: string | null;
  personnel: { id: string; name: string; role: string }[];
}

export function AssignPersonnel({ incidentId, currentAssigneeId, personnel }: AssignPersonnelProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAssignment(userId: string | null) {
    if (!userId) return;
    setIsPending(true);
    const result = await assignIncidentAction(incidentId, userId);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Personnel assigned to incident.");
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Assign Lead Responder</label>
      <Select 
        defaultValue={currentAssigneeId || undefined} 
        onValueChange={handleAssignment}
        disabled={isPending}
      >
        <SelectTrigger className="w-full bg-background border-border h-11 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2.5 font-bold text-foreground">
            <User className="w-4 h-4 text-primary" />
            <SelectValue placeholder="Select responder" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
          {personnel.map((p) => (
            <SelectItem key={p.id} value={p.id} className="focus:bg-primary/10 focus:text-primary transition-colors py-2.5">
              <span className="font-bold">{p.name}</span> <span className="text-[10px] uppercase font-black opacity-40 ml-2 tracking-widest">[{p.role.replace("_", " ")}]</span>
            </SelectItem>
          ))}
          {personnel.length === 0 && (
            <SelectItem value="none" disabled>No field agents available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
