export const ROLE_CONFIG = {
  manager: {
    label: "Manager",
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
  kasir: {
    label: "Kasir",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  kurir: {
    label: "Kurir",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  pelanggan: {
    label: "Pelanggan",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
} as const;

export const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "kasir", label: "Kasir" },
  { value: "kurir", label: "Kurir" },
  { value: "pelanggan", label: "Pelanggan" },
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
] as const;
