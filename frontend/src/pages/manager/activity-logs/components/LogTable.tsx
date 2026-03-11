/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Clock,
  Eye,
  FileText,
  Hash,
  Tag,
  Info,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/report";

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  kasir: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  kurir: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pelanggan: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const ROLE_DOT_COLORS: Record<string, string> = {
  manager: "bg-violet-500",
  kasir: "bg-blue-500",
  kurir: "bg-amber-500",
  pelanggan: "bg-emerald-500",
};

interface Props {
  logs: ActivityLog[];
  isLoading: boolean;
  meta?: any;
  onPageChange: (page: number) => void;
}

// Komponen Dialog Detail Log
function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const properties = log.properties || {};
  const hasProperties = Object.keys(properties).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-heart-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-heart-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Detail Aktivitas
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Informasi lengkap dari log aktivitas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info Baris 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Log Name</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {log.log_name || "-"}
              </p>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Hash className="w-3.5 h-3.5" />
                <span>Log ID</span>
              </div>
              <p className="text-sm font-medium text-foreground">#{log.id}</p>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Deskripsi</span>
            </div>
            <p className="text-base text-foreground">{log.description}</p>
          </div>

          {/* Info Baris 2 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Subject Info */}
            {log.subject_type && (
              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Subject</span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {log.subject_type} #{log.subject_id}
                </p>
              </div>
            )}

            {/* Causer Info */}
            {log.causer && (
              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Pelaku</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      ROLE_DOT_COLORS[log.causer.role] ?? "bg-muted-foreground",
                    )}
                  />
                  <p className="text-sm font-medium text-foreground">
                    {log.causer.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] px-1.5 py-0",
                      ROLE_COLORS[log.causer.role] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {log.causer.role}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Waktu */}
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Waktu Kejadian</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {formatDate(log.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Properties */}
          {hasProperties && (
            <>
              <Separator className="bg-border" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Data Properties
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                    {JSON.stringify(properties, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LogTable({ logs, isLoading, meta, onPageChange }: Props) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground font-medium">
                  Aktivitas
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Pelaku
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Log Name
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Waktu
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  Detail
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loading Skeleton */}
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <Skeleton className="h-4 w-48 bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 bg-muted rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-muted" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 bg-muted rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Data Rows */}
              {!isLoading &&
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-border hover:bg-muted/50 transition-colors group"
                  >
                    {/* Aktivitas */}
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 mt-1.5",
                            ROLE_DOT_COLORS[log.causer?.role ?? ""] ??
                              "bg-muted-foreground",
                          )}
                        />
                        <div>
                          <p className="text-sm text-foreground leading-tight line-clamp-1">
                            {log.description}
                          </p>
                          {log.subject_type && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {log.subject_type} #{log.subject_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Pelaku */}
                    <TableCell>
                      {log.causer ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium",
                            ROLE_COLORS[log.causer.role] ??
                              "bg-muted text-muted-foreground border-border",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-20">
                              {log.causer.name}
                            </span>
                          </div>
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          System
                        </span>
                      )}
                    </TableCell>

                    {/* Log Name */}
                    <TableCell>
                      {log.log_name && (
                        <span className="text-xs text-muted-foreground italic">
                          {log.log_name}
                        </span>
                      )}
                    </TableCell>

                    {/* Waktu */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {new Date(log.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Detail Button */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleViewDetail(log)}
                        title="Lihat detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {/* Empty State */}
              {!isLoading && logs.length === 0 && (
                <TableRow className="border-border hover:bg-muted/50">
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Tidak ada activity log
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Belum ada aktivitas yang tercatat dalam sistem
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground order-2 sm:order-1">
              Menampilkan {meta.from}–{meta.to} dari {meta.total} log
            </span>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-8 h-8 bg-background border-border text-muted-foreground",
                  "hover:bg-muted hover:text-foreground",
                  "disabled:opacity-30 disabled:hover:bg-background",
                  "transition-all",
                )}
                disabled={meta.current_page <= 1}
                onClick={() => onPageChange(meta.current_page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-xs px-3 py-1 bg-muted rounded-md border border-border text-foreground">
                {meta.current_page} / {meta.last_page}
              </span>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-8 h-8 bg-background border-border text-muted-foreground",
                  "hover:bg-muted hover:text-foreground",
                  "disabled:opacity-30 disabled:hover:bg-background",
                  "transition-all",
                )}
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPageChange(meta.current_page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Detail */}
      <LogDetailDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
