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
  BadgeCheck,
  ChevronsUpDown,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ConnectionStatus } from "../shared/LiveBagde";
import { cn } from "@/lib/utils";

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
];

const CUSTOMER_NAV = [
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Pesanan Saya", url: "/orders", icon: Package },
];

function NavItems({ items }: { items: typeof MANAGER_NAV }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu
      className={`flex ${isCollapsed ? "justify-center items-center" : "gap-1"}`}
    >
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            tooltip={isCollapsed ? item.title : undefined}
            className="w-full flex items-center justify-start gap-3 px-3 py-2"
          >
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 w-full",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "size-5 shrink-0",
                      isActive && "text-amber-500",
                    )}
                  />
                  {!isCollapsed && (
                    <span
                      className={cn("truncate", isActive && "text-amber-500")}
                    >
                      {item.title}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// ─── Nav User dengan Dropdown ─────────────────────────────────────────────────

function NavUser() {
  const { user, logout } = useAuthStore();
  const { isMobile, state } = useSidebar();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                  isCollapsed ? "justify-center px-2 overflow-visible" : ""
                }`}
              >
                <div className="relative overflow-visible">
                  <Avatar className="h-8 w-8 rounded-lg shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ConnectionStatus className="absolute -bottom-0.5 -right-0.5" />
                </div>

                {!isCollapsed && (
                  <>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-sidebar-foreground/50">
                        {user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => (window.location.href = "#")}>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  <span>Akun</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary focus:text-primary focus:bg-primary/10"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              Konfirmasi Logout
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Anda yakin ingin keluar dari aplikasi?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="bg-muted border-border text-muted-foreground hover:bg-muted/80"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoggingOut ? "Logging out..." : "Ya, Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { user } = useAuthStore();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="px-4 py-4">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-bold leading-tight">POS App</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize">
                {roleLabel[role]}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="opacity-20" />

      {/* Nav */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 px-2 mb-1">
              Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <NavItems items={navItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer dengan Dropdown Menu */}
      <SidebarFooter className="p-2">
        {/* Offline status dan PWA button - hanya tampil jika tidak collapsed */}
        {!isCollapsed && (
          <div className="space-y-3 mb-3 px-1">
            <OfflineIndicator />
            <PWAInstallButton />
            <Separator className="opacity-20" />
          </div>
        )}

        {/* NavUser dengan Dropdown */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
