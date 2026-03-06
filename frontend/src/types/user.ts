export interface User {
  id: number;
  name: string;
  email: string;
  role: "manager" | "kasir" | "kurir" | "pelanggan";
  role_label: string;
  phone: string | null;
  status: "active" | "inactive";
  avatar_url: string;
  customer?: {
    id: number;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    notes: string | null;
  };
  created_at: string;
}

export interface UserSummary {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface StoreUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  status?: "active" | "inactive";
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateUserPayload extends Partial<StoreUserPayload> {}
