import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reportsApi } from "@/api/reports";
import type { ReportFilters } from "@/types/report";

interface Props {
  filters: ReportFilters;
}

export function ExportButtons({ filters }: Props) {
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleExcelExport = async () => {
    setLoadingExcel(true);
    try {
      const res = await reportsApi.exportExcel(filters);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan_${filters.from ?? "export"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Laporan berhasil didownload!");
    } catch {
      toast.error("Gagal export laporan.");
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
        disabled={loadingExcel}
        onClick={handleExcelExport}
      >
        {loadingExcel ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileDown className="w-3.5 h-3.5" />
        )}
        Export CSV
      </Button>
    </div>
  );
}
