"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Circle, User } from "lucide-react";
import { RecruitmentRequisition } from "@/features/hr/types/recruitment-requisition";

interface ApprovalTimelineProps {
  requisition: RecruitmentRequisition;
}

export default function ApprovalTimeline({
  requisition,
}: ApprovalTimelineProps) {
  const getStepIcon = (completed: boolean, rejected: boolean) => {
    if (rejected) return <XCircle className="w-5 h-5 text-red-600" />;
    if (completed) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const steps = [
    {
      title: "Created",
      user: requisition.created_by,
      timestamp: requisition.created_datetime,
      completed: true,
      icon: <Circle className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Review",
      user: requisition.reviewed_by_detail || requisition.reviewer_detail,
      timestamp: requisition.reviewed_at,
      completed: !!requisition.reviewed_at,
      comments: requisition.review_comments,
      icon: getStepIcon(
        !!requisition.reviewed_at,
        requisition.status === "REJECTED" && !requisition.reviewed_at
      ),
    },
    {
      title: "Authorization",
      user: requisition.authorized_by_detail || requisition.authorizer_detail,
      timestamp: requisition.authorized_at,
      completed: !!requisition.authorized_at,
      comments: requisition.authorization_comments,
      icon: getStepIcon(
        !!requisition.authorized_at,
        requisition.status === "REJECTED" &&
          !!requisition.reviewed_at &&
          !requisition.authorized_at
      ),
    },
    {
      title: "Final Approval",
      user: requisition.approved_by_detail || requisition.approver_detail,
      timestamp: requisition.approved_at,
      completed: !!requisition.approved_at,
      comments: requisition.approval_comments,
      icon: getStepIcon(
        !!requisition.approved_at,
        requisition.status === "REJECTED" && !!requisition.authorized_at
      ),
    },
  ];

  // Add conversion step if converted
  if (requisition.converted_to_advertisement && requisition.converted_at) {
    steps.push({
      title: "Converted to Advertisement",
      user: requisition.converted_by_detail,
      timestamp: requisition.converted_at,
      completed: true,
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Vertical line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[10px] top-8 w-0.5 h-full bg-gray-200" />
              )}

              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 relative z-10 bg-white">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    {step.completed && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>

                  {step.user && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-3 h-3" />
                      <span>
                        {step.user.first_name} {step.user.last_name}
                      </span>
                    </div>
                  )}

                  {step.timestamp && (
                    <p className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}

                  {step.comments && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 italic">
                      "{step.comments}"
                    </div>
                  )}

                  {!step.completed && index > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Waiting for approval...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Rejection info */}
          {requisition.status === "REJECTED" && requisition.rejected_by_detail && (
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-red-600">Rejected</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="w-3 h-3" />
                    <span>
                      {requisition.rejected_by_detail.first_name}{" "}
                      {requisition.rejected_by_detail.last_name}
                    </span>
                  </div>
                  {requisition.rejected_at && (
                    <p className="text-xs text-gray-500">
                      {new Date(requisition.rejected_at).toLocaleString()}
                    </p>
                  )}
                  {requisition.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      {requisition.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
