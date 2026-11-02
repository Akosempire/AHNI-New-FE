import { format } from "date-fns";
import { useAppSelector } from "@/hooks/useStore";
import { TNotification } from "@/features/notifications/types/notification";
import { useGetUserProfile } from "@/features/auth/controllers/userController";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

type PropsType = {
    active: TNotification;
};

export default function NotificationContent({ active }: PropsType) {
    const { message, title, created_datetime, module_type, priority, category, action_url, metadata } = active;

    const { data: profile } = useGetUserProfile();
    const router = useRouter();

    const { user } = useAppSelector((state) => state.auth);

    const isVendorReminder = module_type === "VendorEvaluation";

    const handleTakeAction = () => {
        if (action_url) {
            router.push(action_url);
        }
    };

    return (
        <div className="w-full space-y-4 px-4 pt-6 lg:w-[65%] lg:px-8 lg:pt-16">
            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-body-sm">Subject</h3>
                <p className="font-medium">{title}</p>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-body-sm">Module</h3>
                <Badge variant="outline">{module_type}</Badge>
            </div>

            {priority && (
                <div className="flex items-center justify-between">
                    <h3 className="text-muted-foreground text-body-sm">Priority</h3>
                    <Badge
                        variant={
                            priority === "urgent" ? "urgent" :
                            priority === "high" ? "high" :
                            priority === "medium" ? "medium" :
                            "low"
                        }
                    >
                        {priority.toUpperCase()}
                    </Badge>
                </div>
            )}

            {category && (
                <div className="flex items-center justify-between">
                    <h3 className="text-muted-foreground text-body-sm">Category</h3>
                    <Badge
                        variant={
                            category === "error" ? "error" :
                            category === "warning" ? "warning" :
                            category === "success" ? "success" :
                            "info"
                        }
                    >
                        {category.toUpperCase()}
                    </Badge>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-body-sm">Sender</h3>
                <p className="font-medium">{isVendorReminder ? "System" : "Admin"}</p>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-body-sm">Email</h3>
                <p className="font-medium">{profile?.data.email}</p>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-body-sm">Date Created</h3>
                <p className="font-medium">
                    {format(created_datetime, "MMM dd, yyyy")}
                </p>
            </div>

            {/* Vendor Reminder Specific Details */}
            {isVendorReminder && metadata && (
                <div className="border-t pt-4 space-y-2">
                    <h3 className="text-heading-4 mb-2">Vendor Details</h3>

                    <div className="flex items-center justify-between">
                        <h3 className="text-muted-foreground text-body-sm">Vendor Name</h3>
                        <p className="font-medium">{metadata.vendor_name}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-muted-foreground text-body-sm">Purchase Orders</h3>
                        <p className="font-medium">{metadata.po_count} PO(s)</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-muted-foreground text-body-sm">Days Since Last PO</h3>
                        <p className="font-medium">{metadata.days_since_last_po} days ago</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-muted-foreground text-body-sm">Status</h3>
                        <div className="flex items-center gap-2">
                            {metadata.reminder_type === "OVERDUE" ? (
                                <>
                                    <AlertCircle className="text-destructive" size={16} />
                                    <span className="text-destructive font-semibold">Overdue</span>
                                </>
                            ) : (
                                <>
                                    <Clock className="text-orange-500" size={16} />
                                    <span className="text-orange-600 font-semibold">Due Soon</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <h3 className="text-muted-foreground text-body-sm">Message</h3>
                <p className="text-body-base mt-2">{message}</p>
            </div>

            {action_url && (
                <div className="mt-6 pt-4 border-t">
                    <Button onClick={handleTakeAction} className="w-full">
                        {isVendorReminder ? "Complete Vendor Evaluation" : "Take Action"}
                    </Button>
                </div>
            )}
        </div>
    );
}