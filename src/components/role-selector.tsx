"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRoleAction } from "@/app/actions/users";
import { toast } from "sonner";
import { useState } from "react";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
}

const ROLES = [
  { value: "ADMIN", label: "Administrator" },
  { value: "DATA_OFFICER", label: "Data Officer" },
  { value: "FIELD_AGENT", label: "Field Agent" },
  { value: "VIEWER", label: "Viewer" },
];

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleRoleChange(newRole: string) {
    setIsPending(true);
    const result = await updateUserRoleAction(userId, newRole as any);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("User role updated successfully.");
    }
  }

  return (
    <Select 
      defaultValue={currentRole} 
      onValueChange={handleRoleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px] h-9 bg-slate-950/50 border-slate-800">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
