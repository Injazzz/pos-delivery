import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "./AppSidebar";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { PWAUpdatePrompt } from "@/components/shared/PWAUpdatePrompt";
import { registerSyncListeners, cacheMenusForOffline } from "@/lib/offlineSync";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppNavbar } from "./Navbar";
import { useEchoConnection } from "@/hooks/useEchoConnection";

export function AppShell() {
  const queryClient = useQueryClient();
  useEchoConnection(); // Initialize global connection state tracking

  useEffect(() => {
    // Cache menus saat pertama load (untuk offline fallback)
    if (navigator.onLine) {
      cacheMenusForOffline();
    }

    // Register background sync listener
    const unregister = registerSyncListeners((result) => {
      if (result.synced > 0) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    });

    return unregister;
  }, [queryClient]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppNavbar />
        <OfflineBanner />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>

      {/* PWA Prompts */}
      <PWAInstallBanner />
      <PWAUpdatePrompt />
    </SidebarProvider>
  );
}
