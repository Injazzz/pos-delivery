import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("[SW] Registered:", r);
    },
    onRegisterError(error) {
      console.error("[SW] Register error:", error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
        <p className="text-sm">Versi baru tersedia!</p>
        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => updateServiceWorker(true)}
        >
          <RefreshCw className="h-3 w-3" />
          Update
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setNeedRefresh(false)}
        >
          Nanti
        </Button>
      </div>
    </div>
  );
}
