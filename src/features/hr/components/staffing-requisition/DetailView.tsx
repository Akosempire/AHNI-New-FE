"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Check,
  X,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Shield,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  StaffingRequisition,
  REQUISITION_STATUS_LABELS,
  POSITION_TYPE_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  NATURE_OF_HIRE_LABELS,
  OFFICE_TYPE_LABELS,
  POSITION_NATURE_LABELS,
} from "../../types/staffing-requisition";
import {
  useGetStaffingRequisition,
  useApproveRequisition,
  useRejectRequisition,
  useSubmitForReview,
  useDownloadRequisitionPDF,
  useApproveAllLevels,
  useDeleteStaffingRequisition,
} from "../../controllers/staffing-requisition";
import { useFileAttachments } from "@/controllers/fileAttachmentController";
import { useGetUserProfile } from "@/features/auth/controllers/userController";

interface DetailViewProps {
  requisitionId: string;
}

export default function StaffingRequisitionDetailView({
  requisitionId,
}: DetailViewProps) {
  const router = useRouter();
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [superAdminDialog, setSuperAdminDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [comments, setComments] = useState("");
  const [superAdminComments, setSuperAdminComments] = useState("");

  // API Hooks
  const { data: requisition, isLoading } = useGetStaffingRequisition(requisitionId);
  const { data: currentUser } = useGetUserProfile();
  const isSuperUser = currentUser?.data?.is_superuser || false;
  const approveMutation = useApproveRequisition(requisitionId);
  const rejectMutation = useRejectRequisition(requisitionId);
  const submitMutation = useSubmitForReview(requisitionId);
  const downloadMutation = useDownloadRequisitionPDF();
  const approveAllLevelsMutation = useApproveAllLevels(requisitionId);
  const deleteMutation = useDeleteStaffingRequisition();

  // File attachments
  const { data: attachmentsData } = useFileAttachments(
    {
      content_type: "staffing_requisitions.staffingrequisition",
      object_id: requisitionId,
    },
    !!requisitionId
  );

  const memoAttachments = attachmentsData?.data?.attachments?.filter(
    (att) => att.category === "MEMO"
  ) || [];

  // Permission checks
  const isRequester = requisition?.created_by?.id === currentUser?.data?.id;
  const canEdit = isSuperUser || (isRequester && requisition?.status !== 'APPROVED' && requisition?.status !== 'REJECTED');
  const canDelete = isSuperUser || (isRequester && requisition?.status !== 'APPROVED' && requisition?.status !== 'REJECTED');

  // Handle approval
  const handleApprove = () => {
    approveMutation.mutate(
      { action: "approve", comments },
      {
        onSuccess: () => {
          toast.success("Requisition approved successfully");
          setApprovalDialog(false);
          setComments("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to approve");
        },
      }
    );
  };

  // Handle rejection
  const handleReject = () => {
    if (!comments.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    rejectMutation.mutate(
      { action: "reject", comments },
      {
        onSuccess: () => {
          toast.success("Requisition rejected");
          setRejectDialog(false);
          setComments("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to reject");
        },
      }
    );
  };

  // Handle super admin approve all levels
  const handleApproveAllLevels = () => {
    approveAllLevelsMutation.mutate(
      { action: "approve", comments: superAdminComments },
      {
        onSuccess: () => {
          toast.success("All approval levels approved successfully");
          setSuperAdminDialog(false);
          setSuperAdminComments("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to approve all levels");
        },
      }
    );
  };

  // Handle submit for review
  const handleSubmitForReview = () => {
    submitMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Requisition submitted for review");
      },
    });
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    downloadMutation.mutate(requisitionId);
  };

  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate(requisitionId, {
      onSuccess: () => {
        toast.success("Requisition deleted successfully");
        setDeleteDialog(false);
        router.push("/dashboard/hr/staffing-requisitions");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || "Failed to delete requisition");
      },
    });
  };

  // Handle edit
  const handleEdit = () => {
    router.push(`/dashboard/hr/staffing-requisitions/${requisitionId}/edit`);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING_APPROVAL":
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Requisition not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {requisition.requisition_code}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {format(new Date(requisition.created_at), "PPP")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(requisition.status)}>
              {REQUISITION_STATUS_LABELS[requisition.status]}
            </Badge>

            {/* Edit Button */}
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(true)}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}

            {requisition.status === "APPROVED" && (
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={downloadMutation.isPending}
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            )}

            {/* Super Admin: Approve All Levels Button */}
            {isSuperUser &&
              requisition.status !== "APPROVED" &&
              requisition.status !== "REJECTED" &&
              requisition.status !== "CANCELLED" && (
                <Button
                  onClick={() => setSuperAdminDialog(true)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Approve All Levels (Super Admin)
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Position Details */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Position Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Position</Label>
            <p className="font-medium">{requisition.position.title}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Grade Level</Label>
            <p className="font-medium">{requisition.grade_level}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Department</Label>
            <p className="font-medium">{requisition.department.name}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Location</Label>
            <p className="font-medium">
              {requisition.location?.name || "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Nature of Hire</Label>
            <p className="font-medium">
              {NATURE_OF_HIRE_LABELS[requisition.nature_of_hire]}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Position Type</Label>
            <p className="font-medium">
              {POSITION_TYPE_LABELS[requisition.position_type]}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Employment Status</Label>
            <p className="font-medium">
              {EMPLOYMENT_STATUS_LABELS[requisition.employment_status]}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Number of Staff</Label>
            <p className="font-medium">{requisition.number_of_staff}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Supervisor</Label>
            <p className="font-medium">{requisition.supervisor}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">
              Expected Resumption Date
            </Label>
            <p className="font-medium">
              {format(
                new Date(requisition.expected_date_of_resumption),
                "PPP"
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Job Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Job Information</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">
              Major Duties & Responsibilities
            </Label>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {requisition.major_duties_responsibilities}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">
              Language Requirements
            </Label>
            <p className="mt-1 text-sm">{requisition.language_requirements}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Justification</Label>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {requisition.justification}
            </p>
          </div>
        </div>
      </Card>

      {/* Approved Memo - Display Only */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Approved Memo</h2>

        {memoAttachments.length > 0 ? (
          <div className="space-y-2">
            {memoAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              >
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    {attachment.original_filename}
                  </p>
                  <p className="text-xs text-green-700">
                    {attachment.file_size_mb} MB
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <XCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              No memo uploaded. An approved memo is required for staffing requisitions.
            </p>
          </div>
        )}
      </Card>

      {/* Approval Workflow */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Approval Workflow</h2>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${requisition.approval_progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {requisition.approval_progress}% Complete
            </p>
          </div>

          {/* Approval Steps */}
          <div className="space-y-3">
            {/* Hiring Manager */}
            {requisition.hiring_manager && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.hiring_manager_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Hiring Manager</p>
                  <p className="text-xs text-gray-600">
                    {requisition.hiring_manager.name}
                  </p>
                  {requisition.hiring_manager_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(
                        new Date(requisition.hiring_manager_approved_at),
                        "PPP p"
                      )}
                    </p>
                  )}
                  {requisition.hiring_manager_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.hiring_manager_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* DOF (for NEW positions) */}
            {requisition.dof && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.dof_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Director of Finance</p>
                  <p className="text-xs text-gray-600">
                    {requisition.dof.name}
                  </p>
                  {requisition.dof_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(new Date(requisition.dof_approved_at), "PPP p")}
                    </p>
                  )}
                  {requisition.dof_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.dof_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* HR Reviewer */}
            {requisition.hr_reviewer && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.hr_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Human Resources</p>
                  <p className="text-xs text-gray-600">
                    {requisition.hr_reviewer.name}
                  </p>
                  {requisition.hr_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(new Date(requisition.hr_approved_at), "PPP p")}
                    </p>
                  )}
                  {requisition.hr_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.hr_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SPM/STL (for STATE offices) */}
            {requisition.spm_stl && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.spm_stl_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">SPM/STL/Project Director</p>
                  <p className="text-xs text-gray-600">
                    {requisition.spm_stl.name}
                  </p>
                  {requisition.spm_stl_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(
                        new Date(requisition.spm_stl_approved_at),
                        "PPP p"
                      )}
                    </p>
                  )}
                  {requisition.spm_stl_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.spm_stl_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Director of Operations */}
            {requisition.director_of_operations && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.director_of_operations_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Director of Operations</p>
                  <p className="text-xs text-gray-600">
                    {requisition.director_of_operations.name}
                  </p>
                  {requisition.director_of_operations_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(
                        new Date(requisition.director_of_operations_approved_at),
                        "PPP p"
                      )}
                    </p>
                  )}
                  {requisition.director_of_operations_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.director_of_operations_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Managing Director */}
            {requisition.managing_director && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                {requisition.managing_director_approved_at ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Managing Director</p>
                  <p className="text-xs text-gray-600">
                    {requisition.managing_director.name}
                  </p>
                  {requisition.managing_director_approved_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on{" "}
                      {format(
                        new Date(requisition.managing_director_approved_at),
                        "PPP p"
                      )}
                    </p>
                  )}
                  {requisition.managing_director_comments && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{requisition.managing_director_comments}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex items-center gap-3">
          {requisition.status === "DRAFT" && (
            <Button
              onClick={handleSubmitForReview}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Submit for Review
            </Button>
          )}

          {(requisition.status === "PENDING_APPROVAL" ||
            requisition.status === "PENDING_REVIEW") &&
            requisition.current_approver && (
              <>
                <Button onClick={() => setApprovalDialog(true)}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialog(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
        </div>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Requisition</DialogTitle>
            <DialogDescription>
              Add optional comments about your approval decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="approve-comments">Comments (optional)</Label>
            <Textarea
              id="approve-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your comments..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialog(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requisition</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this requisition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-comments">Reason for Rejection *</Label>
            <Textarea
              id="reject-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Explain why you're rejecting this requisition..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Super Admin Approval Dialog */}
      <Dialog open={superAdminDialog} onOpenChange={setSuperAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve All Levels (Super Admin)</DialogTitle>
            <DialogDescription>
              This will approve ALL remaining approval levels and mark the requisition as APPROVED.
              This action bypasses the normal approval workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="super-admin-comments">Comments (optional)</Label>
            <Textarea
              id="super-admin-comments"
              value={superAdminComments}
              onChange={(e) => setSuperAdminComments(e.target.value)}
              placeholder="Add comments for audit trail..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuperAdminDialog(false)}
              disabled={approveAllLevelsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleApproveAllLevels}
              disabled={approveAllLevelsMutation.isPending}
            >
              {approveAllLevelsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Approve All Levels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staffing Requisition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staffing requisition ({requisition.requisition_code})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
