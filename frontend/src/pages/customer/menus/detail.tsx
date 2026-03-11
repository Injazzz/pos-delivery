import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  ImageOff,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Menu tidak ditemukan
          </p>
          <Button
            variant="outline"
            className="mt-4 border-border text-foreground hover:bg-muted"
            onClick={() => navigate("/menu")}
          >
            Kembali ke Menu
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/menu")}
          className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Button>

        <div className="space-y-4">
          <Skeleton className="w-full aspect-video bg-muted rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-16 h-16 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-20 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Gagal memuat detail menu
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Silakan coba lagi nanti
          </p>
          <Button
            variant="outline"
            className="mt-4 border-border text-foreground hover:bg-muted"
            onClick={() => navigate("/menu")}
          >
            Kembali ke Menu
          </Button>
        </div>
      </div>
    );
  }

  const images = menu.images && menu.images.length > 0 ? menu.images : [];
  const displayImage = images[selectedImageIndex]?.url || menu.first_image_url;
  const hasMultipleImages = images.length > 1;
  const canAddToOrder = menu.is_available && (!menu.stock || menu.stock > 0);
  const stockPercentage = menu.stock
    ? Math.min((menu.stock / 50) * 100, 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/menu")}
        className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Menu
      </Button>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="relative w-full bg-muted rounded-xl overflow-hidden aspect-video group">
          {displayImage ? (
            <img
              src={displayImage}
              alt={menu.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/80">
              <ImageOff className="w-12 h-12 text-muted-foreground/30" />
              <span className="text-sm text-muted-foreground">
                Tidak ada gambar
              </span>
            </div>
          )}

          {/* Image counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-full border border-border">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Unavailable overlay */}
          {!menu.is_available && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Badge className="bg-destructive/90 text-destructive-foreground text-sm px-4 py-2 border-0">
                Tidak Tersedia
              </Badge>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                  selectedImageIndex === idx
                    ? "border-heart-500 scale-105 shadow-md"
                    : "border-border hover:border-heart-500/50",
                )}
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
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {menu.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="bg-muted text-muted-foreground border-border"
                >
                  {menu.category}
                </Badge>
                {menu.preparation_time && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {menu.preparation_time} menit
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-3xl font-bold text-heart-500">
              {menu.formatted_price}
            </span>
          </div>

          {menu.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              {menu.description}
            </p>
          )}
        </div>

        {/* Stock Info */}
        {menu.stock !== null && (
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Ketersediaan Stok
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  menu.stock > 10
                    ? "text-emerald-500"
                    : menu.stock > 0
                      ? "text-glow-500"
                      : "text-destructive",
                )}
              >
                {menu.stock > 0 ? `${menu.stock} tersedia` : "Habis"}
              </span>
            </div>
            {menu.stock > 0 && (
              <>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      menu.stock > 10
                        ? "bg-emerald-500"
                        : menu.stock > 0
                          ? "bg-glow-500"
                          : "bg-destructive",
                    )}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
                {menu.stock <= 5 && (
                  <p className="text-xs text-glow-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Stok tersisa sedikit
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Quantity Selector */}
      {canAddToOrder ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">Jumlah Pesanan</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 border-border text-foreground hover:bg-muted disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-16 text-center">
                <span className="text-xl font-bold text-foreground">
                  {quantity}
                </span>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  setQuantity((q) =>
                    !menu.stock || q < menu.stock ? q + 1 : q,
                  )
                }
                disabled={!!menu.stock && quantity >= menu.stock}
                className="w-10 h-10 border-border text-foreground hover:bg-muted disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-heart-500">
                Rp {(menu.price * quantity).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Add to Order Button */}
          <Button
            className="w-full bg-heart-500 hover:bg-heart-600 text-white font-semibold h-12 gap-2 text-base"
            onClick={() => addToOrderMutation.mutate()}
            disabled={addToOrderMutation.isPending}
          >
            {addToOrderMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menambahkan...</span>
              </div>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Tambah ke Order</span>
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-medium">
            Menu ini tidak tersedia untuk dipesan
          </p>
        </div>
      )}
    </div>
  );
}
