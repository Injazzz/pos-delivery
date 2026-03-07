import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  orderType: string;
  setOrderType: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
}

const STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "cooking", label: "Dimasak" },
  { value: "ready", label: "Siap" },
  { value: "on_delivery", label: "Dikirim" },
  { value: "delivered", label: "Diterima" },
  { value: "cancelled", label: "Dibatalkan" },
];

const TYPES = [
  { value: "all", label: "Semua Tipe" },
  { value: "dine_in", label: "Dine In" },
  { value: "take_away", label: "Take Away" },
  { value: "delivery", label: "Delivery" },
];

export function OrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  orderType,
  setOrderType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari kode order..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
      </div>

      {/* Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {STATUSES.map((s) => (
            <SelectItem
              key={s.value}
              value={s.value}
              className="text-slate-300"
            >
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type */}
      <Select value={orderType} onValueChange={setOrderType}>
        <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {TYPES.map((t) => (
            <SelectItem
              key={t.value}
              value={t.value}
              className="text-slate-300"
            >
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 w-36 text-xs bg-slate-900 border-slate-700 text-white"
        />
        <span className="text-slate-500 text-xs">s/d</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 w-36 text-xs bg-slate-900 border-slate-700 text-white"
        />
      </div>
    </div>
  );
}
