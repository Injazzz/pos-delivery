import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { LogFilters } from "./components/LogFilters";
import { LogTable } from "./components/LogTable";
import { activityLogsApi } from "@/api/reports";
import { useDebounce } from "@/hooks/useDebounce";

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [logName, setLogName] = useState("");

  const debSearch = useDebounce(search, 400);

  const { data: summaryData } = useQuery({
    queryKey: ["activity-summary"],
    queryFn: () => activityLogsApi.getSummary().then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", debSearch, logName, page],
    queryFn: () =>
      activityLogsApi
        .getLogs({
          search: debSearch || undefined,
          log_name: logName || undefined,
          page,
          per_page: 25,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            Activity Log
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Rekam jejak semua aktivitas sistem
          </p>
        </div>

        {/* Quick stats */}
        {summaryData && (
          <div className="flex gap-3">
            {[
              { label: "Hari ini", value: summaryData.today },
              { label: "Minggu ini", value: summaryData.this_week },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <LogFilters
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        logName={logName}
        setLogName={(v) => {
          setLogName(v);
          setPage(1);
        }}
        logNames={summaryData?.log_names ?? []}
      />

      <LogTable
        logs={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
      />
    </div>
  );
}
