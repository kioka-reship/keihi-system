import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse space-y-2">
        <div className="h-6 bg-gray-200 rounded-full w-40" />
        <div className="h-4 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-20" />
          <div className="h-7 bg-gray-200 rounded-full w-28" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-20" />
          <div className="h-7 bg-gray-200 rounded-full w-28" />
        </div>
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  );
}
