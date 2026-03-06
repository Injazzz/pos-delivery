import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { menusApi } from "@/api/menus";
import { useDebounce } from "@/hooks/useDebounce";
import type { Menu } from "@/types/menu";

interface Props {
  onAdd: (menu: Menu) => void;
}

export function MenuSelector({ onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["public-menus", debouncedSearch, category],
    queryFn: () =>
      menusApi
        .getPublic({
          search: debouncedSearch || undefined,
          category: category === "all" ? undefined : category,
        })
        .then((r) => r.data),
  });

  const categories = data?.categories ?? [];
  const menus = data?.data
    ? Object.values(data.data as Record<string, Menu[]>).flat()
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-9"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <Badge
          variant="outline"
          className={`cursor-pointer text-xs ${category === "all" ? "bg-amber-500 text-slate-950 border-amber-500" : "text-slate-400 border-slate-700 hover:border-slate-500"}`}
          onClick={() => setCategory("all")}
        >
          Semua
        </Badge>
        {categories.map((c: string) => (
          <Badge
            key={c}
            variant="outline"
            className={`cursor-pointer text-xs ${category === c ? "bg-amber-500 text-slate-950 border-amber-500" : "text-slate-400 border-slate-700 hover:border-slate-500"}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-slate-800 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => onAdd(menu)}
                disabled={!menu.is_available}
                className="group flex flex-col bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 rounded-lg p-2.5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Image */}
                <div className="w-full aspect-3/2 rounded-md overflow-hidden bg-slate-700 mb-2">
                  {menu.first_image_url ? (
                    <img
                      src={menu.first_image_url}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-white line-clamp-1">
                  {menu.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {menu.formatted_price}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
