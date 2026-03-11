import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { menusApi } from "@/api/menus";
import { ordersApi } from "@/api/orders";
import { useCartStore } from "@/stores/cartStore";
import { useDebounce } from "@/hooks/useDebounce";

import { MenuCard } from "./components/MenuCard";
import { CartDrawer } from "./components/CartDrawer";
import { OrderTypeDialog } from "./components/OrderTypeDialog";

import type { Menu } from "@/types/menu";

export default function CustomerMenuPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  // UI state
  const [cartOpen, setCartOpen] = useState(false);
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);

  // Cart store
  const {
    items,
    orderType,
    tableNumber,
    deliveryAddress,
    notes,
    addItem,
    clearCart,
    totalItems,
    subtotal,
  } = useCartStore();

  // Fetch menus
  const { data, isLoading } = useQuery({
    queryKey: ["customer-menus", debouncedSearch, activeCategory],
    queryFn: () =>
      menusApi
        .getPublic({
          search: debouncedSearch || undefined,
          category: activeCategory === "all" ? undefined : activeCategory,
        })
        .then((r) => r.data),
  });

  // Flatten menus from grouped response
  const allMenus: Menu[] = data?.data
    ? (Object.values(data.data).flat() as Menu[])
    : [];
  const categories: string[] = data?.categories ?? [];

  // Get qty in cart for a menu
  const cartQty = (menuId: number) =>
    items.find((i) => i.menu.id === menuId)?.qty ?? 0;

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: () =>
      ordersApi.customerCreate({
        order_type: orderType,
        notes,
        table_number: orderType === "dine_in" ? tableNumber : undefined,
        delivery_address:
          orderType === "delivery" ? deliveryAddress : undefined,
        items: items.map((i) => ({
          menu_id: i.menu.id,
          qty: i.qty,
          note: i.note || undefined,
        })),
      }),
    onSuccess: () => {
      toast.success("Pesanan berhasil dibuat!");
      clearCart();
      setOrderTypeOpen(false);
      setCartOpen(false);
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      navigate(`/orders`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Gagal membuat pesanan.");
    },
  });

  const handleAddMenu = (menu: Menu) => {
    addItem(menu);
    toast.success(`${menu.name} ditambahkan`, { duration: 800 });
  };

  const cartTotal = subtotal() * 1.11;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-heart-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Menu</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Pilih menu favorit Anda
            </p>
          </div>
        </div>

        {/* Cart button */}
        <Button
          className={cn(
            "relative gap-2 font-semibold transition-all h-11 px-4",
            totalItems() > 0
              ? "bg-heart-500 hover:bg-heart-600 text-white shadow-md shadow-heart-500/20"
              : "bg-card border border-border hover:bg-muted text-foreground",
          )}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="w-4 h-4" />
          {totalItems() > 0 ? (
            <span className="flex items-center gap-1">
              <span className="font-bold">{totalItems()}</span> item ·
              <span className="font-bold">
                Rp {Math.round(cartTotal).toLocaleString("id-ID")}
              </span>
            </span>
          ) : (
            "Keranjang"
          )}
          {totalItems() > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-heart-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-heart-500">
              {totalItems()}
            </span>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 h-11"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">
            Filter Kategori
          </p>
        </div>
        <div className="flex gap-2 overflow-visible pb-1 scrollbar-hide">
          <Badge
            variant="outline"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "cursor-pointer whitespace-nowrap text-xs px-4 py-2 transition-all hover:scale-105",
              activeCategory === "all"
                ? "bg-heart-500 text-white border-heart-500 font-semibold shadow-md shadow-heart-500/20"
                : "bg-card text-foreground border-border hover:border-heart-500/50 hover:bg-muted",
            )}
          >
            Semua
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "cursor-pointer whitespace-nowrap text-xs px-4 py-2 transition-all hover:scale-105 capitalize",
                activeCategory === cat
                  ? "bg-heart-500 text-white border-heart-500 font-semibold shadow-md shadow-heart-500/20"
                  : "bg-card text-foreground border-border hover:border-heart-500/50 hover:bg-muted",
              )}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-4/3 rounded-xl bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : allMenus.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Menu tidak ditemukan
            </p>
            <p className="text-xs text-muted-foreground max-w-50">
              Tidak ada menu yang sesuai dengan pencarian Anda
            </p>
          </div>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="border-border text-foreground hover:bg-muted mt-2"
            >
              Hapus pencarian
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onAdd={handleAddMenu}
              qty={cartQty(menu.id)}
            />
          ))}
        </div>
      )}

      {/* Floating checkout bar (mobile) */}
      {totalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border sm:hidden z-40 animate-in slide-in-from-bottom">
          <Button
            className="w-full h-12 bg-heart-500 hover:bg-heart-600 text-white font-bold gap-2 shadow-lg shadow-heart-500/20"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Lihat Keranjang · {totalItems()} item</span>
            <span className="ml-auto font-bold">
              Rp {Math.round(cartTotal).toLocaleString("id-ID")}
            </span>
          </Button>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setOrderTypeOpen(true);
        }}
        isLoading={createMutation.isPending}
      />

      {/* Order type dialog */}
      <OrderTypeDialog
        open={orderTypeOpen}
        onClose={() => setOrderTypeOpen(false)}
        onConfirm={() => createMutation.mutate()}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

// Import UtensilsCrossed
import { UtensilsCrossed } from "lucide-react";
