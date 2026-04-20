"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info, 
  X,
  Loader2,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { 
  getNotificationsAction, 
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction 
} from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const result = await getNotificationsAction();
    if (result.success && result.data) {
      // Check for new critical notifications to show a toast
      // We use a ref to track which notifications have already triggered a toast
      // to avoid checking against the 'notifications' state and causing a dependency loop.
      const newCritical = result.data.find(n => 
        !n.isRead && 
        !notifiedIdsRef.current.has(n.id) && 
        (n.type === 'INCIDENT' || n.title.includes('CRITICAL'))
      );
      
      if (newCritical) {
        toast.error(`ALERT: ${newCritical.title}`, {
          description: newCritical.message,
          duration: 10000,
        });
        // Mark as "toasted"
        notifiedIdsRef.current.add(newCritical.id);
      }

      // Add all current IDs to the notified set so we don't toast them in the future
      result.data.forEach(n => notifiedIdsRef.current.add(n.id));

      setNotifications(result.data as any);
      setUnreadCount(result.data.filter(n => !n.isRead).length);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(() => fetchNotifications(true), 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsReadAction(id);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsReadAction();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications cleared");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl hover:bg-primary/5 transition-all group h-10 w-10 border border-transparent hover:border-border"
        >
          <Bell className={cn(
            "h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors",
            unreadCount > 0 && "animate-pulse text-primary font-black"
          )} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background shadow-lg shadow-destructive/20" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-popover border-border shadow-2xl z-[100] rounded-2xl mt-2 overflow-hidden" align="end">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/5">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-md border border-primary/20 font-black uppercase tracking-widest shadow-sm">
                  {unreadCount} New
                </span>
              )}
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">System Activity Logs</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-8 text-[10px] text-muted-foreground hover:text-primary font-black uppercase tracking-widest gap-2 px-3 hover:bg-primary/5 rounded-xl border border-transparent hover:border-border transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-auto custom-scrollbar divide-y divide-border/50">
          {isLoading ? (
            <div className="p-14 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest italic">Synchronizing Database...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-[2rem] bg-muted/50 flex items-center justify-center mx-auto mb-2 border border-border shadow-inner">
                <Bell className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground font-black uppercase tracking-tight">System All-Clear</p>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic px-4">No active alerts or system notifications pending at this time in your sector.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-5 transition-all group relative",
                    !n.isRead ? "bg-primary/[0.02]" : "hover:bg-accent/30"
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "mt-1 p-2.5 rounded-2xl shrink-0 border shadow-sm transition-transform group-hover:scale-110 duration-300",
                      n.type === 'ALERT' 
                        ? "bg-destructive/5 text-destructive border-destructive/10" 
                        : "bg-primary/5 text-primary border-primary/10"
                    )}>
                      {n.type === 'ALERT' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div className="space-y-1.5 pr-6 flex-1">
                      <p className={cn(
                        "text-sm font-black leading-tight tracking-tight",
                        !n.isRead ? "text-foreground" : "text-muted-foreground opacity-60"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 font-medium">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                         <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-border" />
                             {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                         </span>
                      </div>
                    </div>
                  </div>
                  
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all p-2 bg-background border border-border rounded-xl shadow-lg hover:bg-primary hover:text-white hover:border-primary"
                      title="Archive notification"
                    >
                      <Check className="w-4 h-4 transition-transform active:scale-90" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 bg-muted/10 border-t border-border flex justify-center">
             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">FIMS Operational Intel Monitoring</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
