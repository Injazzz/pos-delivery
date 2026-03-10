import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types/auth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Guard: wajib login
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Guard: wajib role tertentu
export function RequireRole({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: User["role"][];
}) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}

// Guard: redirect jika sudah login
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated() && user) {
    const map: Record<string, string> = {
      manager: "/manager/dashboard",
      kasir: "/cashier/dashboard",
      kurir: "/courier/dashboard",
      pelanggan: "/menu",
    };
    return <Navigate to={map[user.role] ?? "/"} replace />;
  }

  return <>{children}</>;
}
