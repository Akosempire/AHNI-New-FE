"use client";

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
import { Plus, Loader2, Eye } from "lucide-react";
import { useGetStaffingRequisitions } from "@/features/hr/controllers/staffing-requisition";
import { format } from "date-fns";

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/hr/staffing-requisitions/${req.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
    </div>
  );
}
