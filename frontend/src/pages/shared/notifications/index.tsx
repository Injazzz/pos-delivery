import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { notificationsApi } from "@/api/notifications";
import type { AppNotification } from "@/api/notifications";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationsApi.getAll(page).then((r) => r.data),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success("Semua notifikasi ditandai sebagai sudah dibaca");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Gagal menandai notifikasi"),
  });

  // Delete single notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      toast.success("Notifikasi dihapus");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Gagal menghapus notifikasi"),
  });

  // Delete all notifications
  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () => {
      toast.success("Semua notifikasi dihapus");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Gagal menghapus notifikasi"),
  });

  const notifications = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const unreadCount = data?.meta?.unread_count ?? 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-400";
      case "warning":
        return "text-amber-400";
      case "success":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifikasi</h1>
          <p className="text-slate-400 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi baru`
              : "Tidak ada notifikasi baru"}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Menandai...
                  </>
                ) : (
                  "Tandai Semua Dibaca"
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
            >
              {deleteAllMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1.5" />
                  Hapus Semua
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-slate-800 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: AppNotification) => (
            <div
              key={notification.id}
              className={`bg-slate-900 border rounded-lg p-4 transition-all ${
                notification.read_at
                  ? "border-slate-800 opacity-75"
                  : "border-slate-700 ring-1 ring-amber-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 shrink-0 ${getNotificationColor(
                    notification.type,
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {notification.data?.title || "Notifikasi"}
                  </p>
                  <p className="text-sm text-slate-300 mt-0.5 line-clamp-2">
                    {notification.data?.message}
                  </p>

                  {notification.data?.order_code && (
                    <p className="text-xs text-slate-500 mt-2">
                      Order: {notification.data.order_code}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    {formatTime(notification.created_at)}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() =>
                      deleteNotificationMutation.mutate(notification.id)
                    }
                    disabled={deleteNotificationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-slate-700"
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-slate-400">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border-slate-700"
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
