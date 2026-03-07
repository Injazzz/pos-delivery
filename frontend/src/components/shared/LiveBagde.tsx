import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/stores/realtimeStore";

export function LiveBadge({ className }: { className?: string }) {
  const state = useRealtimeStore((s) => s.connectionState);

  if (state !== "connected") return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
        Live
      </span>
    </div>
  );
}

export function ConnectionStatus({ className }: { className?: string }) {
  const state = useRealtimeStore((s) => s.connectionState);

  const config = {
    connecting: {
      label: "Menghubungkan...",
      dot: "bg-amber-500",
      text: "text-amber-400",
    },
    connected: {
      label: "Terhubung",
      dot: "bg-emerald-500",
      text: "text-emerald-400",
    },
    disconnected: {
      label: "Terputus",
      dot: "bg-slate-500",
      text: "text-slate-400",
    },
    failed: {
      label: "Gagal terhubung",
      dot: "bg-red-500",
      text: "text-red-400",
    },
  }[state];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      <span className={cn("text-[10px] font-medium", config.text)}>
        {config.label}
      </span>
    </div>
  );
}
