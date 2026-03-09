import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Truck,
  BarChart2,
  Activity,
  Printer,
  LogOut,
  WifiOff,
  ClipboardList,
  Package,
  AlertCircle,
  List,
  History,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { OfflineIndicator } from "@/components/shared/OfflineBanner";
import { PWAInstallButton } from "@/components/shared/PWAInstallBanner";

// ─── Nav items per role ────────────────────────────────────────────────────────

const MANAGER_NAV = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "Pengguna", url: "/manager/users", icon: Users },
  { title: "Menu", url: "/manager/menus", icon: UtensilsCrossed },
  { title: "Order", url: "/manager/orders", icon: ShoppingBag },
  { title: "Pengiriman", url: "/manager/deliveries", icon: Truck },
  { title: "Cetak Ulang", url: "/manager/receipts", icon: Printer },
  { title: "Laporan", url: "/manager/reports", icon: BarChart2 },
  { title: "Activity Log", url: "/manager/activity-logs", icon: Activity },
];

const CASHIER_NAV = [
  { title: "Dashboard", url: "/cashier/dashboard", icon: LayoutDashboard },
  { title: "Order Baru", url: "/cashier/new-order", icon: ShoppingBag },
  { title: "Riwayat Order", url: "/cashier/history", icon: ClipboardList },
  { title: "Pesanan Offline", url: "/cashier/pending-orders", icon: WifiOff },
];

const COURIER_NAV = [
  { title: "Dashboard", url: "/courier/dashboard", icon: LayoutDashboard },
  { title: "Pesanan Ditugaskan", url: "/courier/assigned", icon: List },
  { title: "Riwayat Pengiriman", url: "/courier/history", icon: History },
  // { title: "Pengiriman", url: "/courier/deliveries", icon: Truck },
];

const CUSTOMER_NAV = [
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Pesanan Saya", url: "/orders", icon: Package },
];

function NavItems({ items }: { items: typeof MANAGER_NAV }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role = user?.role ?? "pelanggan";
  const navItems =
    role === "manager"
      ? MANAGER_NAV
      : role === "kasir"
        ? CASHIER_NAV
        : role === "kurir"
          ? COURIER_NAV
          : CUSTOMER_NAV;

  const roleLabel: Record<string, string> = {
    manager: "Manager",
    kasir: "Kasir",
    kurir: "Kurir",
    pelanggan: "Pelanggan",
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <Sidebar>
        {/* Header */}
        <SidebarHeader className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">POS App</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize">
                {roleLabel[role]}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <Separator className="opacity-20" />

        {/* Nav */}
        <SidebarContent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 px-2 mb-1">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems items={navItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="px-3 pb-4 space-y-3">
          {/* Offline status */}
          <OfflineIndicator />

          {/* PWA install button */}
          <PWAInstallButton />

          <Separator className="opacity-20" />

          {/* User info */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="text-sidebar-foreground/40 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Konfirmasi Logout
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Anda yakin ingin keluar dari aplikasi?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? "Logging out..." : "Ya, Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
