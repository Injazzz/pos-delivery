import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const ROLE_HOME: Record<string, string> = {
  manager: "/manager/dashboard",
  kasir: "/cashier/dashboard",
  kurir: "/courier/deliveries",
  pelanggan: "/menu",
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleBack = () => {
    const dest = ROLE_HOME[user?.role ?? ""] ?? "/login";
    navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Akses Ditolak</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Anda tidak memiliki izin untuk mengakses halaman ini. Silakan
            kembali ke halaman yang sesuai dengan peran Anda.
          </p>
        </div>

        {/* Role badge */}
        {user && (
          <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
            Login sebagai:{" "}
            <span className="text-white font-medium capitalize">
              {user.role}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            onClick={handleBack}
          >
            Kembali ke Dashboard
          </Button>
          {!user && (
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
