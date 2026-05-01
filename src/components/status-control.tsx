"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateIncidentStatusAction } from "@/app/actions/incidents";
import { toast } from "sonner";
import { useState } from "react";
import { INCIDENT_STATUS } from "@/lib/constants";

interface StatusControlProps {
  incidentId: string;
  currentStatus: string;
}

export function StatusControl({ incidentId, currentStatus }: StatusControlProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    setIsPending(true);
    const result = await updateIncidentStatusAction(incidentId, newStatus as any);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Status updated to ${newStatus}`);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Critical Response Phase</label>
      <Select 
        defaultValue={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-full bg-background border-border h-11 rounded-xl shadow-sm hover:border-primary/50 transition-colors font-bold text-foreground">
          <SelectValue placeholder="Update phase" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
          {INCIDENT_STATUS.map((status) => (
            <SelectItem key={status} value={status} className="focus:bg-primary/10 focus:text-primary transition-colors py-2.5 font-bold text-xs uppercase tracking-tight">
              {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
