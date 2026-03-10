import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [open, setOpen] = useState(false);
  const fetched = useRef(false);

  // Fetch saat pertama buka
  useEffect(() => {
    if (open && !fetched.current && isAuthenticated()) {
      fetchNotifications();
      fetched.current = true;
    }
  }, [open, isAuthenticated, fetchNotifications]);

  // Poll unread count setiap 30 detik
  useEffect(() => {
    if (!isAuthenticated()) return;
    const interval = setInterval(() => {
      useNotificationStore.getState().fetchUnreadCount();
    }, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 bg-card border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Notifikasi</p>
            {unreadCount > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-accent text-accent-foreground">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3 h-3" />
              Baca semua
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-80">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Bell className="w-7 h-7" />
              <p className="text-xs">Belum ada notifikasi</p>
            </div>
          )}

          {!isLoading &&
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "group flex gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
                  !notif.read_at && "bg-accent/5",
                )}
                onClick={() => !notif.read_at && markAsRead(notif.id)}
              >
                {/* Unread dot */}
                <div className="shrink-0 mt-1.5">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      notif.read_at ? "bg-muted" : "bg-accent",
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      notif.read_at
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {notif.data.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notif.data.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(notif.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 w-6 h-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-transparent transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
