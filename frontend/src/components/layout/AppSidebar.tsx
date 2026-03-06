import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  Truck,
  ShoppingCart,
  ClipboardList,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// ── Nav config per role ──────────────────────────────────────────────────────

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const managerNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { title: "Pengguna", url: "/manager/users", icon: Users },
      { title: "Menu", url: "/manager/menus", icon: UtensilsCrossed },
      { title: "Pesanan", url: "/manager/orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Laporan",
    items: [{ title: "Laporan", url: "/manager/reports", icon: BarChart3 }],
  },
];

const kasirNav: NavGroup[] = [
  {
    label: "Kasir",
    items: [
      { title: "Dashboard", url: "/cashier/dashboard", icon: LayoutDashboard },
      { title: "Pesanan Baru", url: "/cashier/new-order", icon: ShoppingBag },
    ],
  },
];

const pelangganNav: NavGroup[] = [
  {
    label: "Menu",
    items: [
      { title: "Lihat Menu", url: "/menu", icon: UtensilsCrossed },
      { title: "Keranjang", url: "/cart", icon: ShoppingCart },
      { title: "Pesanan Saya", url: "/my-orders", icon: ClipboardList },
    ],
  },
];

const kurirNav: NavGroup[] = [
  {
    label: "Pengiriman",
    items: [{ title: "Pengiriman", url: "/courier/deliveries", icon: Truck }],
  },
];

const navByRole: Record<string, NavGroup[]> = {
  manager: managerNav,
  kasir: kasirNav,
  pelanggan: pelangganNav,
  kurir: kurirNav,
};

// ── Role badge colors ─────────────────────────────────────────────────────────

const roleBadgeClass: Record<string, string> = {
  manager: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  kasir: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pelanggan: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  kurir: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const groups = user ? (navByRole[user.role] ?? []) : [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials =
    user?.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <Sidebar
      className="border-r border-slate-800 bg-slate-900"
      collapsible="icon"
    >
      {/* ── Header / Logo ───────────────────────── */}
      <SidebarHeader className="border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white truncate">
              POS Delivery
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              Management System
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ──────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="mb-2">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-1 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    location.pathname.startsWith(item.url + "/");

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "group/item h-9 rounded-lg transition-all duration-150",
                          isActive
                            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/15"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              "w-4 h-4 shrink-0 transition-transform group-hover/item:scale-105",
                              isActive ? "text-amber-400" : "text-slate-500",
                            )}
                          />
                          <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-amber-500 text-slate-950 group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <ChevronRight className="ml-auto w-3 h-3 text-amber-400/60 group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer / User ───────────────────────── */}
      <SidebarFooter className="border-t border-slate-800 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 rounded-lg hover:bg-slate-800 text-slate-300 data-[state=open]:bg-slate-800"
                >
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={user?.avatar_url} alt={user?.name} />
                    <AvatarFallback className="bg-amber-500 text-slate-950 text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-xs font-semibold text-white truncate leading-tight">
                      {user?.name}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full border w-fit mt-0.5",
                        roleBadgeClass[user?.role ?? "pelanggan"],
                      )}
                    >
                      {user?.role_label}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto w-3.5 h-3.5 text-slate-500 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="start"
                className="w-52 bg-slate-900 border-slate-700 text-slate-200"
              >
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-xs font-semibold text-white">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <DropdownMenuItem
                  className="gap-2 text-sm hover:bg-slate-800 cursor-pointer mt-1"
                  onClick={() => navigate("/profile")}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Pengaturan Profil
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuItem
                  className="gap-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
