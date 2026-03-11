import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleClear = () => {
    setSearch("");
    setLogName("all"); // Ubah dari "" menjadi "all"
  };

  const isFilterActive = search !== "" || logName !== "all"; // Ubah dari "" menjadi "all"

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
          />
        </div>

        {/* Filter Toggle - Mobile Only */}
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="sm:hidden border-border text-foreground hover:bg-muted hover:text-foreground gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filter Log</span>
          {logName !== "all" && ( // Ubah dari "" menjadi "all"
            <span className="ml-1 w-5 h-5 rounded-full bg-heart-500 text-white text-xs flex items-center justify-center">
              1
            </span>
          )}
        </Button>

        {/* Log Name Filter - Desktop */}
        <div className="hidden sm:block">
          <Select
            value={logName}
            onValueChange={(value) => setLogName(value === "all" ? "" : value)}
          >
            <SelectTrigger
              className={cn(
                "w-48 bg-background border-border text-foreground hover:bg-muted/50",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                logName !== "all" && "border-heart-500/50", // Ubah dari "" menjadi "all"
              )}
            >
              <SelectValue placeholder="Semua Log" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {/* Gunakan value "all" untuk Semua Log */}
              <SelectItem
                value="all"
                className="text-foreground focus:bg-muted focus:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span>Semua Log</span>
                </div>
              </SelectItem>
              {logNames.map((n) => (
                <SelectItem
                  key={n}
                  value={n}
                  className="text-foreground focus:bg-muted focus:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-heart-500" />
                    <span>{n}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
          >
            <X className="w-4 h-4" />
            <span className="text-xs">Clear</span>
          </Button>
        )}
      </div>

      {/* Mobile Filters (Expandable) */}
      {showMobileFilters && (
        <div className="sm:hidden space-y-3 p-4 bg-muted/30 border border-border rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Filter Log</p>
            {logName !== "all" && ( // Ubah dari "" menjadi "all"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLogName("all"); // Ubah dari "" menjadi "all"
                  setShowMobileFilters(false);
                }}
                className="text-muted-foreground hover:text-foreground h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Log Options Mobile */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setLogName("all"); // Ubah dari "" menjadi "all"
                setShowMobileFilters(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                logName === "all" // Ubah dari "" menjadi "all"
                  ? "bg-heart-500/10 text-heart-500"
                  : "hover:bg-muted text-foreground",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  logName === "all" ? "bg-heart-500" : "bg-muted-foreground", // Ubah dari "" menjadi "all"
                )}
              />
              <span
                className={cn(
                  "text-sm flex-1",
                  logName === "all" ? "font-medium" : "", // Ubah dari "" menjadi "all"
                )}
              >
                Semua Log
              </span>
              {logName === "all" && ( // Ubah dari "" menjadi "all"
                <span className="text-heart-500 text-xs">✓</span>
              )}
            </button>

            {logNames.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setLogName(n);
                  setShowMobileFilters(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  logName === n
                    ? "bg-heart-500/10 text-heart-500"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    logName === n ? "bg-heart-500" : "bg-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm flex-1",
                    logName === n ? "font-medium" : "",
                  )}
                >
                  {n}
                </span>
                {logName === n && (
                  <span className="text-heart-500 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Indicator */}
      {isFilterActive && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3 h-3" />
          <span>Filter aktif:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {search && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Pencarian: {search}
              </span>
            )}
            {logName !== "all" && ( // Ubah dari "" menjadi "all"
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Log: {logName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
