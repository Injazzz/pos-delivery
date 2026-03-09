/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { cachedMenusDB, type CachedMenu } from "@/lib/db";
import api from "@/lib/axios";
import { useOffline } from "./useOffline";

interface UseOfflineMenusOptions {
  category?: string;
  search?: string;
  isAvailableOnly?: boolean;
}

export function useOfflineMenus(options: UseOfflineMenusOptions = {}) {
  const { category, search, isAvailableOnly = true } = options;
  const [offlineMenus, setOfflineMenus] = useState<CachedMenu[]>([]);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);
  const { isOnline } = useOffline(); // Use proper offline tracking

  // Online query - only retry if truly online
  const onlineQuery = useQuery({
    queryKey: ["menus", { category, search, isAvailableOnly }],
    queryFn: async () => {
      const res = await api.get("/menus", {
        params: {
          category,
          search,
          is_available: isAvailableOnly || undefined,
          per_page: 999,
        },
      });
      // API returns data grouped by category: { category_name: [...items] }
      // Flatten to array
      const data = res.data.data;
      if (!data || typeof data !== "object") {
        console.warn("[useOfflineMenus] Invalid response data:", data);
        return [];
      }
      const menus = Object.values(data).flat() as CachedMenu[];
      return menus;
    },
    staleTime: 1000 * 60 * 5, // 5 menit
    enabled: isOnline, // Only fetch when actually online
    retry: isOnline ? 3 : false,
  });

  // Load dari IndexedDB jika offline
  const loadOfflineMenus = useCallback(async () => {
    setIsLoadingOffline(true);
    try {
      let menus: CachedMenu[];

      if (category) {
        menus = await cachedMenusDB.getByCategory(category);
      } else {
        menus = await cachedMenusDB.getAll();
      }

      // Filter lokal jika ada search
      if (search) {
        const q = search.toLowerCase();
        menus = menus.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q),
        );
      }

      if (isAvailableOnly) {
        menus = menus.filter((m) => m.is_available);
      }

      setOfflineMenus(menus);
    } finally {
      setIsLoadingOffline(false);
    }
  }, [category, search, isAvailableOnly]);

  useEffect(() => {
    if (!isOnline || onlineQuery.isError) {
      loadOfflineMenus();
    }
  }, [isOnline, onlineQuery.isError, loadOfflineMenus]);

  // Cache ke IndexedDB setiap kali berhasil fetch online
  useEffect(() => {
    if (onlineQuery.data && onlineQuery.data.length > 0) {
      cachedMenusDB.saveAll(
        onlineQuery.data.map((m) => ({
          ...m,
          cachedAt: new Date().toISOString(),
        })),
      );
    }
  }, [onlineQuery.data]);

  const isOffline = !isOnline || onlineQuery.isError;
  const menus = isOffline ? offlineMenus : (onlineQuery.data ?? []);
  const isLoading = isOffline ? isLoadingOffline : onlineQuery.isLoading;

  return {
    menus,
    isLoading,
    isOffline,
    isError: onlineQuery.isError && offlineMenus.length === 0,
    offlineCachedAt: offlineMenus[0]?.cachedAt,
    refetch: onlineQuery.refetch,
  };
}
