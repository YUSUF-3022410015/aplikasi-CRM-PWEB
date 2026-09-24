import { SkeletonCard, SkeletonTable } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-label="Memuat halaman" role="status">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-200/70 animate-pulse-soft" />
        <div className="h-4 w-72 rounded-lg bg-slate-200/70 animate-pulse-soft" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)}
      </div>
      <SkeletonTable rows={5} cols={4} />
      <span className="sr-only">Memuat data...</span>
    </div>
  );
}
