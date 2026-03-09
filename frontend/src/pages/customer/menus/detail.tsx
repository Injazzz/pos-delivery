import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { menusApi } from "@/api/menus";
import { ordersApi } from "@/api/orders";
import type { Menu } from "@/types/menu";

export default function CustomerMenuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const menuId = id ? parseInt(id, 10) : 0;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch menu detail
  const {
    data: menu,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer-menu-detail", menuId],
    queryFn: () =>
      menusApi.getPublicOne(menuId).then((r) => r.data.data as Menu),
    enabled: !!menuId,
  });

  // Add to order mutation
  const addToOrderMutation = useMutation({
    mutationFn: async () => {
      // First create an order with this item
      const response = await ordersApi.customerCreate({
        items: [
          {
            menu_id: menuId,
            qty: quantity,
            note: "",
          },
        ],
        order_type: "dine_in",
        table_number: undefined,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Item ditambahkan ke order");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      navigate("/orders");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Gagal menambahkan item";
      toast.error(message);
    },
  });

  if (!menuId || menuId === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-semibold">Menu tidak ditemukan</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/menu")}
          className="text-slate-400 hover:text-white gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Skeleton className="w-full h-96 bg-slate-800 rounded-xl" />
        <Skeleton className="w-full h-20 bg-slate-800 rounded-lg" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-semibold">Gagal memuat detail menu</p>
        </div>
      </div>
    );
  }

  const images = menu.images && menu.images.length > 0 ? menu.images : [];
  const displayImage = images[selectedImageIndex]?.url || menu.first_image_url;

  const canAddToOrder = menu.is_available && (!menu.stock || menu.stock > 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/menu")}
        className="text-slate-400 hover:text-white gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Menu
      </Button>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="relative w-full bg-slate-800 rounded-xl overflow-hidden aspect-video">
          {displayImage ? (
            <img
              src={displayImage}
              alt={menu.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <span className="text-slate-500">Tidak ada gambar</span>
            </div>
          )}
          {!menu.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Tidak Tersedia</span>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  selectedImageIndex === idx
                    ? "border-amber-500"
                    : "border-slate-700"
                }`}
              >
                <img
                  src={img.thumb || img.url}
                  alt={`${menu.name}-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{menu.name}</h1>
            <p className="text-xs text-slate-500 mt-1">{menu.category}</p>
          </div>
        </div>

        {menu.description && (
          <p className="text-slate-300 text-sm leading-relaxed">
            {menu.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-amber-400">
            {menu.formatted_price}
          </span>
          {menu.preparation_time && (
            <span className="text-xs text-slate-400">
              ⏱ {menu.preparation_time} menit
            </span>
          )}
        </div>

        {/* Stock Info */}
        {menu.stock !== null && (
          <p className="text-xs text-slate-400">
            Stok: {menu.stock > 0 ? `${menu.stock} tersedia` : "Habis"}
          </p>
        )}
      </div>

      {/* Quantity Selector */}
      {canAddToOrder && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Jumlah</span>
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <Minus className="w-4 h-4 text-slate-300" />
              </button>
              <span className="w-8 text-center font-semibold text-white">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    !menu.stock || q < menu.stock ? q + 1 : q,
                  )
                }
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Add to Order Button */}
          <Button
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold h-12 gap-2"
            onClick={() => addToOrderMutation.mutate()}
            disabled={addToOrderMutation.isPending}
          >
            <ShoppingCart className="w-4 h-4" />
            {addToOrderMutation.isPending
              ? "Menambahkan..."
              : "Tambah ke Order"}
          </Button>
        </div>
      )}

      {!canAddToOrder && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">
            Menu ini tidak tersedia untuk dipesan
          </p>
        </div>
      )}
    </div>
  );
}
