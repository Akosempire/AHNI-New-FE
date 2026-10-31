import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import SearchIcon from "@/components/icons/SearchIcon";
import FilterIcon from "@/components/icons/FilterIcon";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";
import ArrowDownIcon from "@/components/icons/ArrowDownIcon";
import { TNotification, NotificationFilters } from "@/features/notifications/controllers/notificationController";
import { useGetNotifications, useMarkAllAsRead } from "@/features/notifications/controllers/notificationController";
import NotificationContent from "../NotificationContent";
import NotificationList from "../NotificationList";
import NotificationListInfinite from "../NotificationListInfinite";
import NotificationPreferences from "../NotificationPreferences";
import { NotificationListSkeleton, NotificationContentSkeleton } from "../NotificationSkeleton";
import EmptyTodoIcon from "@/components/icons/EmptyTodoIcon";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendorEvaluationReminders } from "@/features/procurement/hooks/useVendorEvaluationReminders";

export default function Notifications() {
    const [filters, setFilters] = useState({
        module_type: "all_modules",
        status: "all_status",
        priority: "all_priority",
        category: "all_category"
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("notifications");
    const [useInfiniteScroll] = useState(true);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const notificationParams: NotificationFilters = {
        page: 1,
        size: useInfiniteScroll ? 20 : 100,
        search: searchTerm || undefined,
        module_type: filters.module_type === "all_modules" ? undefined : filters.module_type,
        status: filters.status === "all_status" ? undefined : filters.status as "Pending" | "Read",
        priority: filters.priority === "all_priority" ? undefined : filters.priority as any,
        category: filters.category === "all_category" ? undefined : filters.category as any,
    };

    const { data, isLoading } = useGetNotifications(useInfiniteScroll ? undefined : notificationParams);
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
    const { reminders } = useVendorEvaluationReminders();
    const [activeNotification, setActiveNotification] = useState<TNotification>();

    const handleSetActiveNotification = (notification: TNotification) => {
        setActiveNotification(notification);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    // Convert vendor evaluation reminders to notification format and combine with system notifications
    const vendorReminderNotifications: TNotification[] = useMemo(() => {
        return reminders.map(reminder => ({
            id: `vendor-reminder-${reminder.id}`,
            user: "",
            module_type: "VendorEvaluation",
            title: `Vendor Evaluation: ${reminder.vendor_name}`,
            message: reminder.message,
            status: "Pending" as const,
            is_read: false,
            created_datetime: new Date(Date.now() - reminder.days_since_last_po * 24 * 60 * 60 * 1000).toISOString(),
            priority: reminder.priority.toLowerCase() as any,
            category: reminder.type === "OVERDUE" ? "error" as const : "warning" as const,
            action_url: "/dashboard/procurement/vendor-performance/form",
            metadata: {
                vendor_id: reminder.vendor_id,
                vendor_name: reminder.vendor_name,
                po_count: reminder.po_count,
                days_since_last_po: reminder.days_since_last_po,
                reminder_type: reminder.type
            }
        }));
    }, [reminders]);

    // Combine and filter all notifications
    const allNotifications = useMemo(() => {
        const combined = [...vendorReminderNotifications, ...(data?.results || [])];

        // Apply filters to vendor reminders as well
        return combined.filter(notification => {
            // Search filter
            if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Module type filter
            if (filters.module_type !== "all_modules" && notification.module_type !== filters.module_type) {
                return false;
            }

            // Status filter
            if (filters.status === "Pending" && (notification.is_read || notification.status === "Read")) {
                return false;
            }
            if (filters.status === "Read" && (!notification.is_read || notification.status === "Pending")) {
                return false;
            }

            // Priority filter
            if (filters.priority !== "all_priority" && notification.priority !== filters.priority) {
                return false;
            }

            // Category filter
            if (filters.category !== "all_category" && notification.category !== filters.category) {
                return false;
            }

            return true;
        });
    }, [vendorReminderNotifications, data?.results, searchTerm, filters]);

    const filteredNotifications = allNotifications;

    const hasUnreadNotifications = filteredNotifications.some(
        notification => !notification.is_read || notification.status === "Pending"
    );

    // Get unique values for filter dropdowns (these should ideally come from the API)
    const moduleTypes = useMemo(() => {
        const types = new Set([...(data?.results?.map(n => n.module_type) || [])]);
        if (vendorReminderNotifications.length > 0) {
            types.add("VendorEvaluation");
        }
        return Array.from(types).sort();
    }, [data?.results, vendorReminderNotifications]);
    const priorities = ["low", "medium", "high", "urgent"];
    const categories = ["info", "success", "warning", "error", "system"];

    return (
        <div className="space-y-5">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Global Hub</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <X size={16} />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Notifications</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="space-y-5">
                    {/* Filters and Actions – search and read state up front, the rest behind "More filters" (Hick's law) */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border bg-white px-3 sm:max-w-[320px]">
                                <SearchIcon />
                                <span className="sr-only">Search notifications</span>
                                <input
                                    placeholder="Search notifications"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-full w-full min-w-0 border-none bg-transparent text-sm !shadow-none !outline-none !ring-0"
                                />
                            </label>

                            <div className="inline-flex rounded-xl bg-[#f3f2f7] p-1" role="group" aria-label="Show">
                                {[
                                    { v: "all_status", l: "All" },
                                    { v: "Pending", l: "Unread" },
                                ].map((o) => (
                                    <button
                                        key={o.v}
                                        type="button"
                                        aria-pressed={(filters.status || "all_status") === o.v}
                                        onClick={() => setFilters({ ...filters, status: o.v })}
                                        className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
                                            (filters.status || "all_status") === o.v
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
                                        }`}
                                    >
                                        {o.l}
                                    </button>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl"
                                aria-expanded={showMoreFilters}
                                onClick={() => setShowMoreFilters((v) => !v)}
                            >
                                {showMoreFilters ? "Fewer filters" : "More filters"}
                            </Button>

                            {hasUnreadNotifications && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={isMarkingAll}
                                    className="ml-auto h-11 px-2 text-sm font-semibold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline disabled:opacity-50"
                                >
                                    {isMarkingAll ? "Marking…" : "Mark all as read"}
                                </button>
                            )}
                        </div>

                        {showMoreFilters && (
                            <div className="flex flex-wrap items-center gap-2">
                            <Select value={filters.module_type} onValueChange={(value) => setFilters({...filters, module_type: value})}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_modules">All Modules</SelectItem>
                                    {moduleTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_priority">All Priority</SelectItem>
                                    {priorities.map(priority => (
                                        <SelectItem key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_category">All Category</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                        )}
                    </div>

                    {/* Notification Content */}
                    <Card className="space-y-5 rounded-none">
                        {useInfiniteScroll ? (
                            <div className="flex">
                                <NotificationListInfinite
                                    onSetActiveNotification={handleSetActiveNotification}
                                    activeNotification={activeNotification}
                                    filters={notificationParams}
                                />
                                {activeNotification ? (
                                    <NotificationContent active={activeNotification} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-[65%]">
                                        <EmptyTodoIcon />
                                        <h3 className="text-md font-bold mt-2">
                                            Kindly choose a notification to view its details.
                                        </h3>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {isLoading ? (
                                    <div className="flex">
                                        <NotificationListSkeleton />
                                        <NotificationContentSkeleton />
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2.5 py-16">
                                        <EmptyTodoIcon />
                                        <h3 className="font-bold text-md">
                                            {data?.results?.length === 0 
                                                ? "You are all caught up. You do not have any notifications"
                                                : "No notifications match your current filters"
                                            }
                                        </h3>
                                        {data?.results?.length !== filteredNotifications.length && (
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setFilters({ 
                                                        module_type: "all_modules", 
                                                        status: "all_status",
                                                        priority: "all_priority",
                                                        category: "all_category"
                                                    });
                                                    setSearchTerm("");
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex">
                                        <NotificationList
                                            notifications={filteredNotifications}
                                            onSetActiveNotification={handleSetActiveNotification}
                                            activeNotification={activeNotification}
                                        />

                                        {activeNotification ? (
                                            <NotificationContent active={activeNotification} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-[65%]">
                                                <EmptyTodoIcon />
                                                <h3 className="text-md font-bold mt-2">
                                                    Kindly choose a notification to view its details.
                                                </h3>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <NotificationPreferences />
                </TabsContent>
            </Tabs>
        </div>
    );
}
