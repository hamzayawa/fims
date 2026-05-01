"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  UserX, 
  UserCheck, 
  Loader2,
  AlertTriangle 
} from "lucide-react";
import { 
  deleteUserAction, 
  toggleUserActiveAction 
} from "@/app/actions/users";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UserActionButtons({ userId, isActive, userName }: { userId: string, isActive: boolean, userName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    const result = await toggleUserActiveAction(userId, !isActive);
    setIsToggling(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? `Disabled ${userName}` : `Enabled ${userName}`);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteUserAction(userId);
    setIsDeleting(false);
    setShowDeleteDialog(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Deleted ${userName}`);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isToggling}
        className={isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
        title={isActive ? "Disable User" : "Enable User"}
      >
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <UserX className="w-4 h-4" />
        ) : (
          <UserCheck className="w-4 h-4" />
        )}
      </Button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="font-black uppercase tracking-tight">Delete Personnel</DialogTitle>
            </div>
            <DialogDescription className="font-medium">
              Are you sure you want to delete <span className="font-black text-foreground underline decoration-destructive/30">{userName}</span>? 
              This action cannot be undone and will fail if the user has recorded incidents or reports.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deletion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
