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

  async function handleStatusChange(newStatus: string) {
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Update Phase</label>
      <Select 
        defaultValue={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-full bg-slate-950/50 border-slate-800 h-10">
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          {INCIDENT_STATUS.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
