"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  FileText,
  Filter,
  RefreshCw,
} from "lucide-react";

import {
  useGetRecruitmentRequisitions,
  useGetMyRecruitmentRequisitions,
  useGetPendingRecruitmentApprovals,
  useDeleteRecruitmentRequisition,
} from "@/features/hr/controllers/recruitmentRequisitionController";
import { RecruitmentRequisitionList } from "@/features/hr/types/recruitment-requisition";

export default function RecruitmentRequisitionsList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch data based on active tab
  const {
    data: allData,
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useGetRecruitmentRequisitions({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    page,
    size: 20,
    enabled: activeTab === "all",
  });

  const {
    data: myData,
    isLoading: loadingMy,
    refetch: refetchMy,
  } = useGetMyRecruitmentRequisitions({
    page,
    size: 20,
    enabled: activeTab === "my",
  });

  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useGetPendingRecruitmentApprovals({
    page,
    size: 20,
    enabled: activeTab === "pending",
  });

  const currentData =
    activeTab === "all"
      ? allData
      : activeTab === "my"
      ? myData
      : pendingData;

  const isLoading = loadingAll || loadingMy || loadingPending;
  const requisitions = currentData?.data?.results || [];

  const handleRefresh = () => {
    if (activeTab === "all") refetchAll();
    else if (activeTab === "my") refetchMy();
    else refetchPending();
    toast.success("Refreshed!");
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/hr/recruitment-requisitions/${id}`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      DRAFT: "bg-gray-200 text-gray-800",
      PENDING_APPROVAL: "bg-yellow-200 text-yellow-800",
      APPROVED: "bg-green-200 text-green-800",
      REJECTED: "bg-red-200 text-red-800",
      CANCELLED: "bg-gray-300 text-gray-700",
      CONVERTED_TO_AD: "bg-blue-200 text-blue-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-200"}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={priorityColors[priority] || "bg-gray-200"}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Requisitions</h1>
          <p className="text-gray-600">Manage permanent staff recruitment requests</p>
        </div>
        <Button onClick={() => router.push("/dashboard/hr/recruitment-requisitions/create")}>
          <Plus className="w-4 h-4 mr-2" />
          New Requisition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Requisitions</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Requisitions</TabsTrigger>
              <TabsTrigger value="my">My Requisitions</TabsTrigger>
              <TabsTrigger value="pending">Pending My Approval</TabsTrigger>
            </TabsList>

            {/* Filters - Only show for "All" tab */}
            {activeTab === "all" && (
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by requisition number, position, or grade level..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CONVERTED_TO_AD">Converted to Ad</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : requisitions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No requisitions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requisition #</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Positions</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((req: RecruitmentRequisitionList) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.requisition_number}
                          </TableCell>
                          <TableCell>{req.position?.name || "N/A"}</TableCell>
                          <TableCell>
                            {req.requesting_department?.name || "N/A"}
                          </TableCell>
                          <TableCell>{req.grade_level}</TableCell>
                          <TableCell>{req.number_of_positions}</TableCell>
                          <TableCell>{getPriorityBadge(req.priority)}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell>
                            {new Date(req.created_datetime).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(req.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
