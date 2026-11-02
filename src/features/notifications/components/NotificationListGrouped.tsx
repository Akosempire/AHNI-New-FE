import { useMemo } from "react";
import { TNotification } from "@/features/notifications/controllers/notificationController";
import NotificationGroup from "./NotificationGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";

interface NotificationListGroupedProps {
  notifications: TNotification[];
  onSetActiveNotification: (notification: TNotification) => void;
  activeNotification?: TNotification;
  groupBy: "date" | "module" | "priority" | "category" | "none";
  onGroupByChange: (groupBy: "date" | "module" | "priority" | "category" | "none") => void;
}

export default function NotificationListGrouped({
  notifications,
  onSetActiveNotification,
  activeNotification,
  groupBy,
  onGroupByChange
}: NotificationListGroupedProps) {
  
  const groupedNotifications = useMemo(() => {
    if (groupBy === "none") {
      return { "All Notifications": notifications };
    }

    const groups: Record<string, TNotification[]> = {};

    notifications.forEach(notification => {
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

    // Sort groups by priority/importance
    if (groupBy === "priority") {
      const priorityOrder = ["URGENT", "HIGH", "MEDIUM", "LOW"];
      const sortedGroups: Record<string, TNotification[]> = {};
      priorityOrder.forEach(priority => {
        if (groups[priority]) {
          sortedGroups[priority] = groups[priority];
        }
      });
      return sortedGroups;
    }

    if (groupBy === "date") {
      const dateOrder = ["Today", "Yesterday"];
      const sortedGroups: Record<string, TNotification[]> = {};
      
      // Add Today and Yesterday first
      dateOrder.forEach(date => {
        if (groups[date]) {
          sortedGroups[date] = groups[date];
        }
      });
      
      // Add other dates in chronological order
      Object.keys(groups)
        .filter(key => !dateOrder.includes(key))
        .sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateB.getTime() - dateA.getTime();
        })
        .forEach(date => {
          sortedGroups[date] = groups[date];
        });
      
      return sortedGroups;
    }

    return groups;
  }, [notifications, groupBy]);

  return (
    <div className="w-full lg:w-[35%] border-solid border-[1px] border-gray-200 rounded-sm shadow-md pb-4">
      <div className="flex items-center justify-between py-2 px-4">
        <h2 className="font-medium">Notifications</h2>
        
        <Select value={groupBy} onValueChange={onGroupByChange}>
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

      <div className="mt-4 px-2 space-y-2 max-h-[600px] overflow-y-auto">
        {Object.entries(groupedNotifications).map(([groupTitle, groupNotifications]) => (
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
        ))}
        
        {Object.keys(groupedNotifications).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2" />
            <p>No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}