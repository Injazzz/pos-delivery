export interface MenuImage {
  id: number;
  url: string;
  thumb: string;
  medium: string;
}

export interface Menu {
  id: number;
  name: string;
  description: string | null;
  price: number;
  formatted_price: string;
  category: string;
  is_available: boolean;
  stock: number | null;
  preparation_time: number;
  first_image_url: string;
  images: MenuImage[];
  creator?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface MenuSummary {
  total: number;
  available: number;
  unavailable: number;
  categories: number;
}

export interface MenuFilters {
  search?: string;
  category?: string;
  is_available?: boolean | string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface StoreMenuPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  is_available?: boolean;
  stock?: number | null;
  preparation_time?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateMenuPayload extends Partial<StoreMenuPayload> {}
