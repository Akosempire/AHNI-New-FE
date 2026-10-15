"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  GitBranch,
  Trash2,
  Edit,
} from "lucide-react";

import {
  useReviewRecruitmentRequisition,
  useAuthorizeRecruitmentRequisition,
  useApproveRecruitmentRequisition,
  useRejectRecruitmentRequisition,
  useDeleteRecruitmentRequisition,
} from "@/features/hr/controllers/recruitmentRequisitionController";
import { RecruitmentRequisition } from "@/features/hr/types/recruitment-requisition";

interface ApprovalActionsProps {
  requisition: RecruitmentRequisition;
  onRefresh: () => void;
}

export default function ApprovalActions({
  requisition,
  onRefresh,
}: ApprovalActionsProps) {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"review" | "authorize" | "approve" | null>(null);

  const { reviewRecruitmentRequisition, isLoading: reviewing } =
    useReviewRecruitmentRequisition(requisition.id);
  const { authorizeRecruitmentRequisition, isLoading: authorizing } =
    useAuthorizeRecruitmentRequisition(requisition.id);
  const { approveRecruitmentRequisition, isLoading: approving } =
    useApproveRecruitmentRequisition(requisition.id);
  const { rejectRecruitmentRequisition, isLoading: rejecting } =
    useRejectRecruitmentRequisition(requisition.id);
  const { deleteRecruitmentRequisition, isLoading: deleting } =
    useDeleteRecruitmentRequisition(requisition.id);

  const handleApprovalAction = async (
    action: "review" | "authorize" | "approve",
    comments?: string
  ) => {
    setActionType(action);

    try {
      const actionData = { action, comments };

      if (action === "review") {
        await reviewRecruitmentRequisition(actionData);
        toast.success("Requisition reviewed successfully");
      } else if (action === "authorize") {
        await authorizeRecruitmentRequisition(actionData);
        toast.success("Requisition authorized successfully");
      } else if (action === "approve") {
        await approveRecruitmentRequisition(actionData);
        toast.success("Requisition approved successfully! Ready to convert to advertisement.");
      }

      onRefresh();
    } catch (error) {
      toast.error("Failed to perform action");
    } finally {
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectRecruitmentRequisition({
        action: "reject",
        comments: rejectionReason,
      });
      toast.success("Requisition rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      onRefresh();
    } catch (error) {
      toast.error("Failed to reject requisition");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecruitmentRequisition();
      toast.success("Requisition deleted successfully");
      router.push("/dashboard/hr/recruitment-requisitions");
    } catch (error) {
      toast.error("Failed to delete requisition");
    }
    setShowDeleteDialog(false);
  };

  const handleConvertToAdvertisement = () => {
    router.push(
      `/dashboard/hr/recruitment-requisitions/${requisition.id}/convert-to-advertisement`
    );
  };

  // Determine if user can perform actions
  const currentUser = requisition.current_approver;
  const canReview =
    requisition.status === "PENDING_APPROVAL" &&
    !requisition.reviewed_at;
  const canAuthorize =
    requisition.status === "PENDING_APPROVAL" &&
    requisition.reviewed_at &&
    !requisition.authorized_at;
  const canApprove =
    requisition.status === "PENDING_APPROVAL" &&
    requisition.authorized_at &&
    !requisition.approved_at;
  const canReject =
    requisition.status === "PENDING_APPROVAL";
  const canDelete = requisition.can_be_deleted;
  const canEdit = requisition.can_be_edited;
  const canConvert = requisition.can_be_converted;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Review Action */}
          {canReview && (
            <Button
              className="w-full"
              onClick={() => handleApprovalAction("review")}
              disabled={reviewing || actionType === "review"}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {actionType === "review" ? "Reviewing..." : "Review Requisition"}
            </Button>
          )}

          {/* Authorize Action */}
          {canAuthorize && (
            <Button
              className="w-full"
              onClick={() => handleApprovalAction("authorize")}
              disabled={authorizing || actionType === "authorize"}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {actionType === "authorize"
                ? "Authorizing..."
                : "Authorize Requisition"}
            </Button>
          )}

          {/* Approve Action */}
          {canApprove && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleApprovalAction("approve")}
              disabled={approving || actionType === "approve"}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {actionType === "approve" ? "Approving..." : "Final Approval"}
            </Button>
          )}

          {/* Reject Action */}
          {canReject && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowRejectDialog(true)}
              disabled={rejecting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Requisition
            </Button>
          )}

          {/* Convert to Advertisement */}
          {canConvert && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleConvertToAdvertisement}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Convert to Advertisement
            </Button>
          )}

          {/* Edit Action */}
          {canEdit && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(
                  `/dashboard/hr/recruitment-requisitions/${requisition.id}/edit`
                )
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Requisition
            </Button>
          )}

          {/* Delete Action */}
          {canDelete && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Requisition
            </Button>
          )}

          {/* No actions available */}
          {!canReview &&
            !canAuthorize &&
            !canApprove &&
            !canReject &&
            !canDelete &&
            !canEdit &&
            !canConvert && (
              <p className="text-sm text-gray-500 text-center py-4">
                No actions available
              </p>
            )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requisition</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this requisition. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Rejection Reason</Label>
              <Textarea
                id="rejection_reason"
                placeholder="Explain why this requisition is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || !rejectionReason.trim()}
            >
              {rejecting ? "Rejecting..." : "Reject Requisition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Requisition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this requisition? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
