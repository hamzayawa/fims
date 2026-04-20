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
          className="relative rounded-full hover:bg-slate-800 transition-all group"
        >
          <Bell className={cn(
            "h-5 w-5 text-slate-400 group-hover:text-teal-400 transition-colors",
            unreadCount > 0 && "animate-pulse text-teal-500"
          )} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-slate-900" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-800 shadow-2xl z-[100]" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-teal-500/10 text-teal-500 text-[10px] px-1.5 py-0.5 rounded-full border border-teal-500/20">
                {unreadCount} New
              </span>
            )}
          </h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-7 text-[10px] text-slate-400 hover:text-teal-400 gap-1 px-2"
            >
              <Check className="w-3 h-3" />
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-[350px] overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              <p className="text-xs">Fetching updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-sm text-slate-300 font-medium">No notifications yet</p>
              <p className="text-xs text-slate-500">We'll alert you to system updates and emergencies.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 transition-colors group relative",
                    !n.isRead ? "bg-teal-500/[0.03]" : "hover:bg-slate-800/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-1 p-1.5 rounded-lg shrink-0",
                      n.type === 'ALERT' ? "bg-red-500/10 text-red-500" : "bg-teal-500/10 text-teal-500"
                    )}>
                      {n.type === 'ALERT' ? <AlertCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1 pr-6 flex-1">
                      <p className={cn(
                        "text-xs font-bold leading-none",
                        !n.isRead ? "text-slate-100" : "text-slate-400"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded-md"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 text-teal-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
