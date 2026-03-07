import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  logName: string;
  setLogName: (v: string) => void;
  logNames: string[];
}

export function LogFilters({
  search,
  setSearch,
  logName,
  setLogName,
  logNames,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
      </div>
      <select
        value={logName}
        onChange={(e) => setLogName(e.target.value)}
        className="h-10 text-sm bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 min-w-40"
      >
        <option value="">Semua Log</option>
        {logNames.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
