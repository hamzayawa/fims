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

  async function handleRoleChange(newRole: string | null) {
    if (!newRole) return;
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
      <SelectTrigger className="w-[180px] h-10 bg-background border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors font-bold text-xs uppercase tracking-tight">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
        {ROLES.map((role) => (
          <SelectItem key={role.value} value={role.value} className="focus:bg-primary/10 focus:text-primary transition-colors py-2.5 font-bold text-xs uppercase tracking-tight">
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
