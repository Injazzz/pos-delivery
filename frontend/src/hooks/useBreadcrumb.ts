import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  manager: "Manager",
  dashboard: "Dashboard",
  users: "Pengguna",
  menus: "Menu",
  orders: "Pesanan",
  reports: "Laporan",
  cashier: "Kasir",
  "new-order": "Pesanan Baru",
  payment: "Pembayaran",
  customer: "Pelanggan",
  menu: "Menu",
  cart: "Keranjang",
  "my-orders": "Pesanan Saya",
  courier: "Kurir",
  deliveries: "Pengiriman",
  profile: "Profil",
};

export function useBreadcrumb(): string[] {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg) => routeLabels[seg] ?? seg);
}
