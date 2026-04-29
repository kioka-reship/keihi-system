export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
