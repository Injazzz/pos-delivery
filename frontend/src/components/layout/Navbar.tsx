import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOffline } from "@/hooks/useOffline";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { NotificationBell } from "../shared/NotificationBell";
import { ModeToggle } from "../shared/ModeToggle";

export function AppNavbar() {
  const { isOnline } = useOffline();
  const breadcrumb = useBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors" />
      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">
          {breadcrumb.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 text-border">/</span>}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "text-foreground font-medium"
                    : ""
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Offline indicator */}
        {!isOnline ? (
          <Badge
            variant="outline"
            className="gap-1 text-[11px] border-orange-500/50 text-orange-400 bg-orange-500/10"
          >
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 text-[11px] border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
          >
            <Wifi className="w-3 h-3" />
            Online
          </Badge>
        )}

        <ModeToggle />

        <NotificationBell />
      </div>
    </header>
  );
}
