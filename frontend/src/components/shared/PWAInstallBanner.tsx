import { useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";

export function PWAInstallBanner() {
  const { canInstall, isInstalling, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="bg-card border rounded-xl shadow-lg p-4 flex gap-3">
        <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install Aplikasi</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Akses lebih cepat & bisa digunakan offline
          </p>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={install}
              disabled={isInstalling}
            >
              <Download className="h-3 w-3 mr-1" />
              {isInstalling ? "Installing..." : "Install"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDismissed(true)}
            >
              Nanti
            </Button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Compact Install Button for Sidebar ───────────────────────────────────────

export function PWAInstallButton({ className }: { className?: string }) {
  const { canInstall, isInstalling, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("w-full gap-2", className)}
      onClick={install}
      disabled={isInstalling}
    >
      <Download className="h-4 w-4" />
      {isInstalling ? "Installing..." : "Install App"}
    </Button>
  );
}
