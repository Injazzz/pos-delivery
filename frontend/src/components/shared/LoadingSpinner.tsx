export function LoadingSpinner({
  fullScreen = true,
}: {
  fullScreen?: boolean;
}) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
