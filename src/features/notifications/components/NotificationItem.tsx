import VerticalDotsIcon from "@/components/icons/VerticalDotsIcon";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TNotification } from "@/features/notifications/controllers/notificationController";
import { useMarkNotificationAsRead, useMarkNotificationAsUnread, useDeleteNotification } from "@/features/notifications/controllers/notificationController";
import { useRouter } from "next/navigation";
import { moduleRoute } from "@/features/notifications/moduleRoutes";

type PropsType = {
    notification: TNotification;
    active?: boolean;
    onSetActiveNotification: (notification: TNotification) => void;
};

export default function NotificationItem({
    notification,
    active,
    onSetActiveNotification,
}: PropsType) {
    const { 
        id, 
        title, 
        message, 
        status, 
        is_read, 
        module_type, 
        created_datetime,
        priority = 'medium',
        action_url,
        expires_at
    } = notification;
    const { mutate: markAsRead, isPending: isMarkingRead } = useMarkNotificationAsRead();
    const { mutate: markAsUnread, isPending: isMarkingUnread } = useMarkNotificationAsUnread();
    const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
    const router = useRouter();

    const isUnread = !is_read || status === "Pending";
    const isExpired = expires_at ? new Date(expires_at) < new Date() : false;

    const getModuleRoute = moduleRoute;

    const handleDeleteNotification = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification(id);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(id);
    };

    const handleMarkAsUnread = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAsUnread(id);
    };

    const prettyModule = (module_type || "").replace(/([a-z])([A-Z])/g, "$1 $2");
    const flag = priority === "urgent" ? "Urgent" : priority === "high" ? "High priority" : null;
    const when = new Date(created_datetime).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    return (
        <li
            className={`group flex items-start gap-3 justify-between rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                active ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-background hover:bg-gray-50"
            } ${isDeleting ? "opacity-50 pointer-events-none" : ""} ${isExpired ? "opacity-60" : ""}`}
            onClick={() => {
                onSetActiveNotification(notification);
                // Mark as read when clicked and navigate to relevant module
                if (isUnread) {
                    markAsRead(id);
                }
                // Navigate to action URL or module page
                const route = action_url || getModuleRoute(module_type);
                router.push(route);
            }}
        >
            <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${isUnread ? "bg-[#f2564d]" : "bg-transparent"}`}
                aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className={`line-clamp-1 text-[14.5px] ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-600"} ${isExpired ? "line-through" : ""}`}>
                        {isUnread && <span className="sr-only">Unread: </span>}
                        {title}
                    </h3>
                    {flag && (
                        <span className="shrink-0 rounded-full bg-[#fff0ee] px-2 py-0.5 text-[11px] font-semibold text-[#b8302a]">
                            {flag}
                        </span>
                    )}
                </div>
                {message && (
                    <p className="mt-0.5 line-clamp-1 text-[13.5px] text-gray-600">{message}</p>
                )}
                <p className="mt-1 text-[12px] text-gray-400">
                    {prettyModule}{prettyModule ? " · " : ""}{when}
                    {expires_at && (
                        <span className={isExpired ? "text-red-600" : ""}>
                            {" · "}{isExpired ? "Expired" : `Expires ${new Date(expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                        </span>
                    )}
                </p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Notification options"
                        className="grid h-9 w-9 place-items-center bg-transparent p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <VerticalDotsIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem 
                        onClick={handleDeleteNotification}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Notification"}
                    </DropdownMenuItem>
                    {isUnread ? (
                        <DropdownMenuItem 
                            onClick={handleMarkAsRead}
                            disabled={isMarkingRead}
                        >
                            {isMarkingRead ? "Marking..." : "Mark as read"}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem 
                            onClick={handleMarkAsUnread}
                            disabled={isMarkingUnread}
                        >
                            {isMarkingUnread ? "Marking..." : "Mark as unread"}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </li>
    );
}