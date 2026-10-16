"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useGetStaffingRequisitions } from "@/features/hr/controllers/staffing-requisition";

export default function StaffingRequisitionsPage() {
  const router = useRouter();
  const { data: requisitions, isLoading } = useGetStaffingRequisitions();

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

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {requisitions && requisitions.length > 0
                ? `${requisitions.length} requisition(s) found`
                : "No requisitions found. Click 'New Requisition' to create one."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
