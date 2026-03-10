/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Pilih menu favorit Anda
          </p>
        </div>

        {/* Cart button */}
        <Button
          className={cn(
            "relative gap-2 font-semibold transition-all",
            totalItems() > 0
              ? "bg-accent hover:bg-accent/90 text-accent-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground border border-border",
          )}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="w-4 h-4" />
          {totalItems() > 0 ? (
            <>
              {totalItems()} item · Rp{" "}
              {Math.round(cartTotal).toLocaleString("id-ID")}
            </>
          ) : (
            "Keranjang"
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-10"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Badge
          variant="outline"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "cursor-pointer whitespace-nowrap text-xs px-3 py-1.5 transition-colors",
            activeCategory === "all"
              ? "bg-accent text-accent-foreground border-accent font-semibold"
              : "text-muted-foreground border-border hover:border-border/80 hover:text-foreground/80",
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
              "cursor-pointer whitespace-nowrap text-xs px-3 py-1.5 transition-colors capitalize",
              activeCategory === cat
                ? "bg-accent text-accent-foreground border-accent font-semibold"
                : "text-muted-foreground border-border hover:border-border/80 hover:text-foreground/80",
            )}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Menu grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-4/3 rounded-xl bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      ) : allMenus.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <SlidersHorizontal className="w-8 h-8" />
          <p className="text-sm">Menu tidak ditemukan</p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs text-accent hover:text-accent/80"
            >
              Hapus pencarian
            </button>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden z-40">
          <Button
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4" />
            Lihat Keranjang · {totalItems()} item
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
