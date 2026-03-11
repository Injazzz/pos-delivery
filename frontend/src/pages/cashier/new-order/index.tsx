import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WifiOff, Clock, AlertCircle } from "lucide-react";
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
    ? rawMenus.map((m: CachedMenu) => {
        // Prepare images array: prioritize first_image_url, then images array
        let images = [] as Array<{
          url: string;
          thumb?: string;
          medium?: string;
        }>;

        if (m.first_image_url) {
          images = [{ url: m.first_image_url }];
        }

        if (m.images && Array.isArray(m.images) && m.images.length > 0) {
          images = m.images;
        }

        return {
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          formatted_price: `Rp ${m.price.toLocaleString("id-ID")}`,
          category: m.category,
          is_available: m.is_available,
          stock: m.stock ?? null,
          preparation_time: m.preparation_time ?? 0,
          first_image_url: m.first_image_url || "",
          images:
            images.length > 0
              ? images.map((img, idx) => ({
                  id: idx,
                  url: img.url,
                  thumb: img.thumb || img.url,
                  medium: img.medium || img.url,
                }))
              : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Menu;
      })
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
        qty: i.qty, // untuk kompatibilitas
        quantity: i.qty, // field utama untuk quantity
        name: i.menu.name,
        price: i.menu.price,
        images: i.menu.images || [],
        first_image_url: i.menu.first_image_url,
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
    <div className="h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      {/* Header section with padding top */}
      <div className="pt-5 px-4 md:px-6 shrink-0">
        {/* Header with badges */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl pb-2 font-bold bg-linear-to-r from-heart-600 to-glow-500 bg-clip-text text-transparent">
              Order Baru
            </h1>

            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-heart-500/10 text-heart-600 dark:text-heart-400 border-heart-500/30 gap-1.5 px-3 py-1"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {pendingCount} pesanan pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Offline cache info */}
        {isOffline && offlineCachedAt && (
          <div className="flex items-center gap-2 text-xs bg-glow-500/10 text-glow-600 dark:text-glow-400 px-4 py-2 rounded-lg border border-glow-500/20 mt-3">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Menampilkan menu dari cache •{" "}
              {formatDistanceToNow(new Date(offlineCachedAt), {
                addSuffix: true,
                locale: idLocale,
              })}
            </span>
          </div>
        )}

        {isOffline && !offlineCachedAt && (
          <div className="flex items-center gap-2 text-xs bg-heart-500/10 text-heart-600 dark:text-heart-400 px-4 py-2 rounded-lg border border-heart-500/20 mt-3">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Tidak ada cache menu. Hubungkan internet untuk memuat menu.
            </span>
          </div>
        )}
      </div>

      {/* Main content area with flex row */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-6 pb-4 md:pb-6 min-h-0 overflow-hidden">
        {/* Left: Menu selector - scrollable */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <div className="h-full overflow-y-auto">
            <MenuSelector
              menus={menus}
              isLoading={isLoading}
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
            />
          </div>
        </div>

        {/* Right: Cart - sticky */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 h-full">
          <div className="sticky top-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-heart-500/10 text-heart-600 dark:text-heart-400 px-2 py-0.5 rounded-full text-xs">
                  {items.length}
                </span>
                Keranjang
              </h2>
              {isOfflineMode && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-glow-500/10 text-glow-600 dark:text-glow-400 border-glow-500/30"
                >
                  <WifiOff className="h-2.5 w-2.5 mr-1" />
                  Offline
                </Badge>
              )}
            </div>

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
      </div>
    </div>
  );
}
