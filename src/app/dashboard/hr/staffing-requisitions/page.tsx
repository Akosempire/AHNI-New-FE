"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2, Eye, Edit, Trash2 } from "lucide-react";
import {
  useGetStaffingRequisitions,
  useDeleteStaffingRequisition,
} from "@/features/hr/controllers/staffing-requisition";
import { useGetUserProfile } from "@/features/auth/controllers/userController";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PENDING_APPROVAL: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function StaffingRequisitionsPage() {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const { data: requisitions, isLoading } = useGetStaffingRequisitions();
  const { data: currentUser } = useGetUserProfile();
  const deleteMutation = useDeleteStaffingRequisition();

  const isSuperUser = currentUser?.data?.is_superuser || false;

  // Handle delete confirmation
  const handleDeleteClick = (id: string, code: string) => {
    setRequisitionToDelete({ id, code });
    setDeleteDialog(true);
  };

  // Handle delete action
  const handleDelete = () => {
    if (!requisitionToDelete) return;

    deleteMutation.mutate(requisitionToDelete.id, {
      onSuccess: () => {
        toast.success("Requisition deleted successfully");
        setDeleteDialog(false);
        setRequisitionToDelete(null);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to delete requisition"
        );
      },
    });
  };

  // Check permissions for each requisition
  const canEdit = (requisition: any) => {
    const isRequester = requisition.created_by?.id === currentUser?.data?.id;
    return (
      isSuperUser ||
      (isRequester &&
        requisition.status !== "APPROVED" &&
        requisition.status !== "REJECTED")
    );
  };

  const canDelete = (requisition: any) => {
    const isRequester = requisition.created_by?.id === currentUser?.data?.id;
    return (
      isSuperUser ||
      (isRequester &&
        requisition.status !== "APPROVED" &&
        requisition.status !== "REJECTED")
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Staffing Requisitions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staffing requests and approvals
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/hr/staffing-requisitions/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Requisition
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : requisitions && requisitions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.requisition_code}</TableCell>
                  <TableCell>{format(new Date(req.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{req.position.title}</TableCell>
                  <TableCell>{req.department.name}</TableCell>
                  <TableCell>{req.number_of_staff}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_COLORS[req.status as keyof typeof STATUS_COLORS] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {req.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{req.approval_progress}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/hr/staffing-requisitions/${req.id}`)
                        }
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit(req) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/hr/staffing-requisitions/${req.id}/edit`
                            )
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {canDelete(req) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(req.id, req.requisition_code)
                          }
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No requisitions found. Click 'New Requisition' to create one.
            </p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staffing Requisition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete requisition{" "}
              <span className="font-semibold">{requisitionToDelete?.code}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false);
                setRequisitionToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
