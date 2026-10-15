"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormSelect, FormSelectItem } from "@/components/forms/FormComponents";
import { useGetAllUsers } from "@/features/auth/controllers/userController";
import { Info, CheckCircle2 } from "lucide-react";

interface ApproversStepProps {
  form: UseFormReturn<any>;
}

export default function ApproversStep({ form }: ApproversStepProps) {
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsers({
    page: 1,
    size: 1000,
  });

  const users = usersData?.data?.results || [];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>3-Tier Approval Workflow:</strong> This requisition will follow a three-step approval process:
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li><strong>Reviewer</strong> - First level review</li>
            <li><strong>Authorizer</strong> - Second level authorization</li>
            <li><strong>Approver</strong> - Final approval</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Reviewer */}
      <div className="space-y-2">
        <FormSelect
          form={form}
          name="reviewer_id"
          label="Reviewer (1st Approval)"
          placeholder="Select reviewer"
          required
          helpText="User assigned to review the requisition"
        >
          {loadingUsers ? (
            <FormSelectItem value="">Loading users...</FormSelectItem>
          ) : (
            users.map((user: any) => (
              <FormSelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} - {user.email}
              </FormSelectItem>
            ))
          )}
        </FormSelect>
      </div>

      {/* Authorizer */}
      <div className="space-y-2">
        <FormSelect
          form={form}
          name="authorizer_id"
          label="Authorizer (2nd Approval)"
          placeholder="Select authorizer"
          required
          helpText="User assigned to authorize the requisition"
        >
          {loadingUsers ? (
            <FormSelectItem value="">Loading users...</FormSelectItem>
          ) : (
            users.map((user: any) => (
              <FormSelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} - {user.email}
              </FormSelectItem>
            ))
          )}
        </FormSelect>
      </div>

      {/* Approver */}
      <div className="space-y-2">
        <FormSelect
          form={form}
          name="approver_id"
          label="Approver (Final Approval)"
          placeholder="Select approver"
          required
          helpText="User assigned to give final approval"
        >
          {loadingUsers ? (
            <FormSelectItem value="">Loading users...</FormSelectItem>
          ) : (
            users.map((user: any) => (
              <FormSelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} - {user.email}
              </FormSelectItem>
            ))
          )}
        </FormSelect>
      </div>

      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Ready to submit!</strong> Once you click "Create Requisition", the requisition will be created with DRAFT status
          and automatically submitted for approval to the reviewer.
        </AlertDescription>
      </Alert>
    </div>
  );
}
