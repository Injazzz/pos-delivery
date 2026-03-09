// src/pages/cashier/new-order/index.tsx
// Versi update dengan useOfflineMenus + useOfflineOrder (Module 11)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MenuSelector } from "./components/MenuSelector";
import { CartSummary } from "./components/CartSummary";
import { useOfflineMenus } from "@/hooks/useOfflineMenus";
import { useOfflineOrder } from "@/hooks/useOfflineOrder";
import { useCartStore } from "@/stores/cartStore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Menu } from "@/types/menu";
import type { CachedMenu } from "@/lib/db";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const { items, clearCart, orderType, notes, setOrderType, setNotes } =
    useCartStore();

  // ← Module 11: offline-aware menu fetching
  const {
    menus: rawMenus,
    isLoading,
    isOffline,
    offlineCachedAt,
  } = useOfflineMenus({
    search,
    category,
    isAvailableOnly: true,
  });

  // ← Module 11: offline-aware order creation
  const {
    createOrder,
    isLoading: isCreating,
    isOfflineMode,
    pendingCount,
  } = useOfflineOrder();

  // Transform cached menus to Menu format if needed
  const menus: Menu[] = Array.isArray(rawMenus)
    ? rawMenus.map((m: CachedMenu) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        formatted_price: `Rp ${m.price.toLocaleString("id-ID")}`,
        category: m.category,
        is_available: m.is_available,
        stock: null,
        preparation_time: 0,
        first_image_url: m.image_url || "",
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    : [];

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      return;
    }

    // Validate conditional fields
    if (orderType === "dine_in" && !tableNumber.trim()) {
      alert("Nomor meja harus diisi untuk pesanan dine-in");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress.trim()) {
      alert("Alamat pengiriman harus diisi untuk pesanan delivery");
      return;
    }

    const payload = {
      order_type: orderType as "dine_in" | "take_away" | "delivery",
      items: items.map((i) => ({
        menu_id: i.menu.id,
        qty: i.qty,
        ...(i.note ? { note: i.note } : {}),
      })),
      ...(notes ? { notes } : {}),
      ...(orderType === "dine_in" && tableNumber
        ? { table_number: tableNumber }
        : {}),
      ...(orderType === "delivery" && deliveryAddress
        ? { delivery_address: deliveryAddress }
        : {}),
      ...(deliveryCity ? { delivery_city: deliveryCity } : {}),
      ...(deliveryNotes ? { delivery_notes: deliveryNotes } : {}),
    };

    const result = await createOrder(payload);
    if (result.orderId && !result.isOffline) {
      // Only redirect if online (tidak offline mode)
      clearCart();
      setNotes("");
      setTableNumber("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setDeliveryNotes("");
      navigate(`/cashier/payment/${result.orderId}`);
    } else {
      // Offline mode - clear cart only
      clearCart();
      setNotes("");
      setTableNumber("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setDeliveryNotes("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left: Menu selector */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Offline badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold">Order Baru</h1>

          {isOfflineMode && (
            <Badge
              variant="outline"
              className="text-orange-500 border-orange-300 gap-1"
            >
              <WifiOff className="h-3 w-3" />
              Mode Offline
            </Badge>
          )}

          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="text-amber-500 border-amber-300"
            >
              {pendingCount} pesanan pending
            </Badge>
          )}
        </div>

        {/* Offline cache info */}
        {isOffline && offlineCachedAt && (
          <div className="text-xs text-orange-500/80 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
            Menampilkan menu dari cache •{" "}
            {formatDistanceToNow(new Date(offlineCachedAt), {
              addSuffix: true,
              locale: idLocale,
            })}
          </div>
        )}

        {isOffline && !offlineCachedAt && (
          <div className="text-xs text-red-500/80 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            Tidak ada cache menu. Hubungkan internet untuk memuat menu.
          </div>
        )}

        <MenuSelector
          menus={menus}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <CartSummary
          orderType={orderType as "dine_in" | "take_away" | "delivery"}
          onOrderTypeChange={setOrderType}
          notes={notes}
          onNotesChange={setNotes}
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          deliveryAddress={deliveryAddress}
          onDeliveryAddressChange={setDeliveryAddress}
          deliveryCity={deliveryCity}
          onDeliveryCityChange={setDeliveryCity}
          deliveryNotes={deliveryNotes}
          onDeliveryNotesChange={setDeliveryNotes}
          onSubmit={handleSubmitOrder}
          isSubmitting={isCreating}
          isOffline={isOfflineMode}
        />
      </div>
    </div>
  );
}
