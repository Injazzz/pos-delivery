import { useState } from "react";
import { FileDown, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reportsApi } from "@/api/reports";
import type { ReportFilters } from "@/types/report";
import { cn } from "@/lib/utils";

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
      a.download = `laporan_${filters.from ?? "export"}.xlsx`;
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
        className={cn(
          "h-9 px-4 border-border text-foreground hover:bg-muted hover:text-foreground",
          "text-xs gap-2 transition-all",
          "group relative overflow-hidden",
          "hover:border-heart-500/50 hover:shadow-sm hover:shadow-heart-500/10",
        )}
        disabled={loadingExcel}
        onClick={handleExcelExport}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-linear-to-r from-heart-500/0 via-heart-500/5 to-heart-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        {/* Icon dengan animasi */}
        <div className="relative flex items-center gap-2">
          {loadingExcel ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-heart-500" />
              <span>Mengexport...</span>
            </>
          ) : (
            <>
              <div className="relative">
                <FileDown className="w-4 h-4 text-muted-foreground group-hover:text-heart-500 transition-colors" />
                <FileSpreadsheet className="w-3 h-3 absolute -bottom-1 -right-1 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-1">
                <span>Export Excel</span>
                <Download className="w-3 h-3 text-muted-foreground group-hover:text-heart-500 transition-colors group-hover:translate-y-0.5" />
              </div>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
