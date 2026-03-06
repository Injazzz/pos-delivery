import apiClient from "@/lib/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload),

  logout: () => apiClient.post("/auth/logout"),

  me: () => apiClient.get<{ data: User }>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => apiClient.post("/auth/reset-password", data),

  updateProfile: (data: Partial<User & { address: string; city: string }>) =>
    apiClient.put("/profile", data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return apiClient.post("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => apiClient.post("/profile/change-password", data),
};
