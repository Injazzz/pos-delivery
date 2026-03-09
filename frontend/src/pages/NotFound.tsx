import { useNavigate } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const ROLE_HOME: Record<string, string> = {
  manager: "/manager/dashboard",
  kasir: "/cashier/dashboard",
  kurir: "/courier/deliveries",
  pelanggan: "/menu",
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleHome = () => {
    if (isAuthenticated() && user) {
      navigate(ROLE_HOME[user.role] ?? "/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        {/* 404 number */}
        <div className="relative">
          <p className="text-[120px] font-black text-slate-800 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <MapPinOff className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Halaman yang Anda cari tidak ada atau sudah dipindahkan. Periksa
            kembali URL atau kembali ke halaman utama.
          </p>
        </div>

        {/* Action */}
        <Button
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
          onClick={handleHome}
        >
          Kembali ke Halaman Utama
        </Button>
      </div>
    </div>
  );
}
