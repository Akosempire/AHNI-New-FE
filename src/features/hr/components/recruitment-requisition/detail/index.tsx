"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  GitBranch,
  AlertCircle,
} from "lucide-react";

import { useGetRecruitmentRequisition } from "@/features/hr/controllers/recruitmentRequisitionController";
import ApprovalTimeline from "./ApprovalTimeline";
import ApprovalActions from "./ApprovalActions";

interface RecruitmentRequisitionDetailProps {
  id: string;
}

export default function RecruitmentRequisitionDetail({
  id,
}: RecruitmentRequisitionDetailProps) {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetRecruitmentRequisition(id);

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="w-full p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Recruitment requisition not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const requisition = data.data;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode }
    > = {
      DRAFT: {
        color: "bg-gray-200 text-gray-800",
        icon: <Clock className="w-4 h-4" />,
      },
      PENDING_APPROVAL: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
      },
      APPROVED: {
        color: "bg-green-200 text-green-800",
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      REJECTED: {
        color: "bg-red-200 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      },
      CONVERTED_TO_AD: {
        color: "bg-blue-200 text-blue-800",
        icon: <GitBranch className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {requisition.requisition_number}
            </h1>
            <p className="text-gray-600">
              {requisition.position?.name} - {requisition.requesting_department?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(requisition.status)}
          <Badge
            className={
              requisition.priority === "URGENT"
                ? "bg-red-100 text-red-800"
                : requisition.priority === "HIGH"
                ? "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {requisition.priority}
          </Badge>
        </div>
      </div>

      {/* Approval Progress */}
      {requisition.status === "PENDING_APPROVAL" && (
        <Alert>
          <Clock className="h-4 h-4" />
          <AlertDescription>
            <strong>Approval Progress:</strong> {requisition.approval_progress}% complete
            {requisition.current_approver && (
              <span className="ml-2">
                | Waiting for: {requisition.current_approver.first_name}{" "}
                {requisition.current_approver.last_name}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Rejection Alert */}
      {requisition.status === "REJECTED" && requisition.rejection_reason && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Rejected:</strong> {requisition.rejection_reason}
            {requisition.rejected_by_detail && (
              <span className="block mt-1 text-sm">
                By {requisition.rejected_by_detail.first_name}{" "}
                {requisition.rejected_by_detail.last_name} on{" "}
                {new Date(requisition.rejected_at!).toLocaleString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approved Memo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Approved Memo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reference Number</p>
                  <p className="font-semibold">{requisition.memo_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-semibold">
                    {requisition.memo_approved_by_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approval Date</p>
                  <p className="font-semibold">
                    {new Date(requisition.memo_approval_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memo Document</p>
                  <a
                    href={requisition.memo_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Details */}
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-semibold">{requisition.position?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">
                    {requisition.requesting_department?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grade Level</p>
                  <p className="font-semibold">{requisition.grade_level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Number of Positions</p>
                  <p className="font-semibold">{requisition.number_of_positions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <p className="font-semibold">
                    {requisition.employment_type_display}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Job Type</p>
                  <p className="font-semibold">{requisition.job_type_display}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Justification */}
          <Card>
            <CardHeader>
              <CardTitle>Business Justification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Vacancy Reason</p>
                <p className="font-semibold">
                  {requisition.vacancy_reason_display}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business Justification</p>
                <p className="whitespace-pre-wrap">
                  {requisition.business_justification}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Impact If Not Filled</p>
                <p className="whitespace-pre-wrap">
                  {requisition.impact_if_not_filled}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Position Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Qualifications Required</p>
                <p className="whitespace-pre-wrap">{requisition.qualifications}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Key Responsibilities</p>
                <p className="whitespace-pre-wrap">
                  {requisition.key_responsibilities}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Years of Experience</p>
                  <p className="font-semibold">
                    {requisition.experience_years} years
                  </p>
                </div>
              </div>
              {requisition.skills_required && (
                <div>
                  <p className="text-sm text-gray-600">Skills Required</p>
                  <p className="whitespace-pre-wrap">
                    {requisition.skills_required}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline & Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Required Start Date</p>
                  <p className="font-semibold">
                    {new Date(
                      requisition.required_start_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Salary Range</p>
                  <p className="font-semibold">
                    {requisition.estimated_salary_range}
                  </p>
                </div>
                {requisition.reporting_to && (
                  <div>
                    <p className="text-sm text-gray-600">Reporting To</p>
                    <p className="font-semibold">
                      {requisition.reporting_to.first_name}{" "}
                      {requisition.reporting_to.last_name}
                    </p>
                  </div>
                )}
                {requisition.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{requisition.location.name}</p>
                  </div>
                )}
                {requisition.budget_line && (
                  <div>
                    <p className="text-sm text-gray-600">Budget Line</p>
                    <p className="font-semibold">
                      {requisition.budget_line.name} - {requisition.budget_line.code}
                    </p>
                  </div>
                )}
                {requisition.total_budget_estimate && (
                  <div>
                    <p className="text-sm text-gray-600">Total Budget Estimate</p>
                    <p className="font-semibold">
                      NGN {requisition.total_budget_estimate.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {requisition.additional_notes && (
                <div>
                  <p className="text-sm text-gray-600">Additional Notes</p>
                  <p className="whitespace-pre-wrap">
                    {requisition.additional_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Approval Timeline */}
          <ApprovalTimeline requisition={requisition} />

          {/* Actions */}
          <ApprovalActions requisition={requisition} onRefresh={refetch} />
        </div>
      </div>
    </div>
  );
}
