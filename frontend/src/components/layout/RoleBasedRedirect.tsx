import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function RoleBasedRedirect() {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  const map: Record<string, string> = {
    manager: "/manager/dashboard",
    kasir: "/cashier/dashboard",
    kurir: "/courier/dashboard",
    pelanggan: "/menu",
  };

  return <Navigate to={map[user.role] ?? "/login"} replace />;
}
