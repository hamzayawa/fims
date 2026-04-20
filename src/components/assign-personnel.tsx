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

  async function handleAssignment(userId: string) {
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign Lead</label>
      <Select 
        defaultValue={currentAssigneeId || undefined} 
        onValueChange={handleAssignment}
        disabled={isPending}
      >
        <SelectTrigger className="w-full bg-slate-950/50 border-slate-800 h-10">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <SelectValue placeholder="Select responder" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {personnel.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name} ({p.role.replace("_", " ")})
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
