import { useMemo, useState } from "react";
import { useInfiniteNotifications, TNotification, NotificationFilters } from "@/features/notifications/controllers/notificationController";
import NotificationItem from "./NotificationItem";
import NotificationGroup from "./NotificationGroup";
import { NotificationItemSkeleton } from "./NotificationSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

interface NotificationListInfiniteProps {
  onSetActiveNotification: (notification: TNotification) => void;
  activeNotification?: TNotification;
  filters?: Omit<NotificationFilters, 'page'>;
}

export default function NotificationListInfinite({
  onSetActiveNotification,
  activeNotification,
  filters = {}
}: NotificationListInfiniteProps) {
  const [groupBy, setGroupBy] = useState<"date" | "module" | "priority" | "category" | "none">("none");
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useInfiniteNotifications(filters);

  // Custom infinite scroll hook
  const { lastItemRef } = useInfiniteScroll({
    fetchData: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  });

  // Flatten all pages into a single array
  const allNotifications = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || [];
  }, [data]);

  // Group notifications if needed
  const groupedNotifications = useMemo(() => {
    if (groupBy === "none") {
      return { "All Notifications": allNotifications };
    }

    const groups: Record<string, TNotification[]> = {};

    allNotifications.forEach(notification => {
      let groupKey: string;

      switch (groupBy) {
        case "date":
          const date = new Date(notification.created_datetime);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (date.toDateString() === today.toDateString()) {
            groupKey = "Today";
          } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = "Yesterday";
          } else {
            groupKey = date.toLocaleDateString("en-US", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          }
          break;
        
        case "module":
          groupKey = notification.module_type || "Other";
          break;
        
        case "priority":
          groupKey = (notification.priority || "medium").toUpperCase();
          break;
        
        case "category":
          groupKey = (notification.category || "info").toUpperCase();
          break;
        
        default:
          groupKey = "All Notifications";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [allNotifications, groupBy]);

  const totalCount = data?.pages[0]?.count || 0;
  const loadedCount = allNotifications.length;
  const unreadCount = allNotifications.filter(n => !n.is_read || n.status === "Pending").length;

  if (error) {
    return (
      <div className="w-[35%] border-solid border-[1px] border-red-200 rounded-sm shadow-md p-4">
        <div className="text-center py-8">
          <AlertCircle size={16} />
          <h3 className="font-medium text-red-700 mb-2">Failed to load notifications</h3>
          <p className="text-sm text-red-600 mb-4">{error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[35%] border-solid border-[1px] border-gray-200 rounded-sm shadow-md pb-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Notifications</h2>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {loadedCount}/{totalCount}
            </Badge>
            {unreadCount > 0 && (
              <Badge className="text-xs bg-blue-100 text-blue-800">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
        
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Grouping</SelectItem>
            <SelectItem value="date">Group by Date</SelectItem>
            <SelectItem value="module">Group by Module</SelectItem>
            <SelectItem value="priority">Group by Priority</SelectItem>
            <SelectItem value="category">Group by Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-gray-200" />

      {/* Content */}
      <div className="mt-4 px-2 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationItemSkeleton key={index} />
            ))}
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell size={16} />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupBy === "none" ? (
              // Simple list without grouping
              <>
                {allNotifications.map((notification, index) => (
                  <div key={notification.id} ref={index === allNotifications.length - 1 ? lastItemRef : null}>
                    <NotificationItem
                      notification={notification}
                      onSetActiveNotification={onSetActiveNotification}
                      active={activeNotification?.id === notification.id}
                    />
                  </div>
                ))}
              </>
            ) : (
              // Grouped display
              Object.entries(groupedNotifications).map(([groupTitle, groupNotifications], groupIndex) => (
                <NotificationGroup
                  key={groupTitle}
                  title={groupTitle}
                  notifications={groupNotifications}
                  onSetActiveNotification={onSetActiveNotification}
                  activeNotification={activeNotification}
                  groupType={groupBy}
                  defaultExpanded={
                    groupBy === "none" || 
                    groupTitle === "Today" || 
                    groupTitle === "URGENT" ||
                    Object.keys(groupedNotifications).length <= 3
                  }
                />
              ))
            )}

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <NotificationItemSkeleton key={`loading-${index}`} />
                ))}
              </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && !isFetchingNextPage && allNotifications.length > 0 && (
              <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-100 mt-4">
                <CheckCircle2 size={16} />
                You've reached the end of your notifications
              </div>
            )}

            {/* Load more button (fallback if infinite scroll doesn't work) */}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  <ChevronDown size={16} />
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}