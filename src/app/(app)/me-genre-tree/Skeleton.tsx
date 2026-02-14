import { Skeleton } from "@components/ui/Skeleton";

export function GenreTreeSkeleton() {
  return (
    <div className="space-y-4 mt-5 p-4">
      {/* Root node skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-600" />
        <Skeleton className="h-6 w-40 bg-gray-600" />
      </div>

      {/* First level children */}
      <div className="ml-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
            <Skeleton className="h-5 w-32 bg-gray-600" />
          </div>
        ))}
      </div>

      {/* Second level children */}
      <div className="ml-16 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-6 w-6 rounded-full bg-gray-600" />
            <Skeleton className="h-4 w-28 bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
