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

export interface LoginPayload {
  email: string;
  password: string;
  device?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
