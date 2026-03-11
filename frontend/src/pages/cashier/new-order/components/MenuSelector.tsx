/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cartStore";
import type { Menu } from "@/types/menu";
import { useState, useRef } from "react";

interface MenuSelectorProps {
  menus: Menu[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

// Image Slider Component for each menu item
function MenuImageSlider({ images, name }: { images: string[]; name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const hasMultipleImages = images.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultipleImages) {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe && hasMultipleImages) {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2 flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-500 text-xs">
          No image
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2 group/image"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={sliderRef}
    >
      {/* Images */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <img
              src={img}
              alt={`${name} - ${idx + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src =
                  "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />
          </div>
        ))}
      </div>

      {/* Multiple images indicator - Dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-glow-400 w-3"
                  : "bg-white/60 hover:bg-white"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows - appear on hover/active */}
      {hasMultipleImages && isHovered && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover/image:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover/image:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </>
      )}

      {/* Image counter badge */}
      {hasMultipleImages && (
        <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

export function MenuSelector({
  menus,
  isLoading,
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: MenuSelectorProps) {
  const { addItem } = useCartStore();

  // Get unique categories from menus
  const categories = Array.from(new Set(menus.map((m) => m.category)));

  const handleAddMenu = (menu: Menu) => {
    addItem(menu, 1, "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-glow-500 h-9"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <Badge
          variant="outline"
          className={`cursor-pointer text-xs transition-colors px-3 py-1 ${
            category === ""
              ? "bg-glow-500 text-gray-950 border-glow-500 hover:bg-glow-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
          onClick={() => onCategoryChange("")}
        >
          Semua
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className={`cursor-pointer text-xs transition-colors px-3 py-1 ${
              category === cat
                ? "bg-glow-500 text-gray-950 border-glow-500 hover:bg-glow-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-sm">Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {menus.map((menu) => {
              // Extract image URLs from menu.images array
              const imageUrls: string[] = [];

              if (
                menu.images &&
                Array.isArray(menu.images) &&
                menu.images.length > 0
              ) {
                // Map each image object to its URL
                menu.images.forEach((img: any) => {
                  if (typeof img === "string") {
                    imageUrls.push(img);
                  } else if (img && img.url) {
                    imageUrls.push(img.url);
                  } else if (img && img.medium) {
                    imageUrls.push(img.medium);
                  } else if (img && img.thumb) {
                    imageUrls.push(img.thumb);
                  }
                });
              }

              // Fallback to first_image_url if no images in array
              if (imageUrls.length === 0 && menu.first_image_url) {
                imageUrls.push(menu.first_image_url);
              }

              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => handleAddMenu(menu)}
                  disabled={!menu.is_available}
                  className="group flex flex-col bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-100 dark:border-gray-700 hover:border-glow-500/50 rounded-lg p-2.5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md relative"
                >
                  {/* Image Slider */}
                  <MenuImageSlider images={imageUrls} name={menu.name} />

                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                    {menu.name}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-glow-600 dark:text-glow-400 font-semibold">
                      {menu.formatted_price}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-heart-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                    </div>
                  </div>

                  {/* Availability badge */}
                  {!menu.is_available && (
                    <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Habis
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
