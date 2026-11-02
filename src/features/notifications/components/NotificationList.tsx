import DashboardIcon from "@/components/icons/sidebar-icons/DashboardIcon";
import { Separator } from "@/components/ui/separator";
import NotificationItem from "./NotificationItem";
import { TNotification } from "@/features/notifications/types/notification";

type PropsType = {
    notifications: TNotification[] | undefined;
    onSetActiveNotification: (notification: TNotification) => void;
    activeNotification: TNotification | undefined;
};

export default function NotificationList(props: PropsType) {
    return (
        <div className="w-full lg:w-[35%] border-solid border-[1px] border-gray-200 rounded-sm shadow-md pb-4">
            <div className="flex items-center justify-between py-2 px-4">
                <h2 className="font-medium">Notifications</h2>

                <DashboardIcon fillColor="red" />
            </div>

            <Separator />

            <ul className="mt-6 px-2 space-y-4">
                {props.notifications?.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onSetActiveNotification={props.onSetActiveNotification}
                        active={
                            props?.activeNotification?.id === notification.id
                        }
                    />
                ))}
            </ul>
        </div>
    );
}