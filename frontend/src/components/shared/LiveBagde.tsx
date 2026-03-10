import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/stores/realtimeStore";

export function LiveBadge({ className }: { className?: string }) {
  const state = useRealtimeStore((s) => s.connectionState);

  if (state !== "connected") return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      {/* <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
        Live
      </span> */}
    </div>
  );
}

export function ConnectionStatus({ className }: { className?: string }) {
  const state = useRealtimeStore((s) => s.connectionState);

  const config = {
    connecting: {
      dot: "bg-accent",
      text: "text-accent",
    },
    connected: {
      dot: "bg-emerald-500",
      text: "text-emerald-400",
    },
    disconnected: {
      dot: "bg-muted",
      text: "text-muted-foreground",
    },
    failed: {
      dot: "bg-primary",
      text: "text-primary",
    },
  }[state];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("w-3 h-3 rounded-full", config.dot)} />
      {/* <span className={cn("text-[10px] font-medium", config.text)}>
        {config.label}
      </span> */}
    </div>
  );
}
