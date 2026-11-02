import { Skeleton } from "@/components/ui/skeleton";

export function NotificationItemSkeleton() {
  return (
    <li className="flex items-center gap-4 justify-between bg-white border-gray-200 border-solid border-[1px] px-4 py-2 rounded-lg border-l-8 border-l-gray-300">
      <div className="flex items-start gap-2 flex-1">
        <Skeleton className="w-2 h-2 rounded-full mt-1 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="w-6 h-6" />
    </li>
  );
}

export function NotificationListSkeleton() {
  return (
    <div className="w-full lg:w-[35%] border-solid border-[1px] border-gray-200 rounded-sm shadow-md pb-4">
      <div className="flex items-center justify-between py-2 px-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="w-6 h-6" />
      </div>
      
      <div className="border-t border-gray-200" />
      
      <ul className="mt-6 px-2 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </ul>
    </div>
  );
}

export function NotificationContentSkeleton() {
  return (
    <div className="hidden w-full space-y-4 px-4 pt-6 lg:block lg:w-[65%] lg:px-8 lg:pt-16">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}