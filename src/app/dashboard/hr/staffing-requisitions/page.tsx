"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Loader2, Eye, Edit, Trash2, Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
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

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [requesterFilter, setRequesterFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: requisitions, isLoading } = useGetStaffingRequisitions();
  const { data: currentUser } = useGetUserProfile();
  const deleteMutation = useDeleteStaffingRequisition();

  const isSuperUser = currentUser?.data?.is_superuser || false;

  // Extract unique departments and locations for filters
  const departments = useMemo(() => {
    if (!requisitions) return [];
    const uniqueDepts = new Map();
    requisitions.forEach((req) => {
      if (req.department?.id) {
        uniqueDepts.set(req.department.id, req.department.name);
      }
    });
    return Array.from(uniqueDepts.entries()).map(([id, name]) => ({ id, name }));
  }, [requisitions]);

  const locations = useMemo(() => {
    if (!requisitions) return [];
    const uniqueLocs = new Map();
    requisitions.forEach((req) => {
      if (req.location?.id) {
        uniqueLocs.set(req.location.id, req.location.name);
      }
    });
    return Array.from(uniqueLocs.entries()).map(([id, name]) => ({ id, name }));
  }, [requisitions]);

  const requesters = useMemo(() => {
    if (!requisitions) return [];
    const uniqueRequesters = new Map();
    requisitions.forEach((req) => {
      if (req.created_by?.id) {
        const name = req.created_by.first_name && req.created_by.last_name
          ? `${req.created_by.first_name} ${req.created_by.last_name}`
          : req.created_by.email || 'Unknown';
        uniqueRequesters.set(req.created_by.id, name);
      }
    });
    return Array.from(uniqueRequesters.entries()).map(([id, name]) => ({ id, name }));
  }, [requisitions]);

  // Filter and search logic
  const filteredRequisitions = useMemo(() => {
    if (!requisitions) return [];

    return requisitions.filter((req) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        req.requisition_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.department.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" || req.department.id === departmentFilter;

      // Location filter
      const matchesLocation =
        locationFilter === "all" ||
        (req.location?.id && req.location.id === locationFilter);

      // Requester filter
      const matchesRequester =
        requesterFilter === "all" ||
        (req.created_by?.id && req.created_by.id === requesterFilter);

      // Date range filter
      const reqDate = new Date(req.date);
      const matchesFromDate = !fromDate || reqDate >= new Date(fromDate);
      const matchesToDate = !toDate || reqDate <= new Date(toDate);

      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation && matchesRequester && matchesFromDate && matchesToDate;
    });
  }, [requisitions, searchTerm, statusFilter, departmentFilter, locationFilter, requesterFilter, fromDate, toDate]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setLocationFilter("all");
    setRequesterFilter("all");
    setFromDate("");
    setToDate("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    departmentFilter !== "all" ||
    locationFilter !== "all" ||
    requesterFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

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

      {/* Search and Filters */}
      <Card className="mb-6 p-4">
        <div className="space-y-4">
          {/* Search and Filter Button Row */}
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by code, position, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && !showFilters && (
                <Badge className="ml-1 bg-red-500 text-white">
                  {[statusFilter, departmentFilter, locationFilter, requesterFilter].filter(f => f !== "all").length +
                   (fromDate ? 1 : 0) + (toDate ? 1 : 0)}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Collapsible Filter Dropdowns */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* First Row: Status, Department, Location, Requester */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Requester Filter */}
              <Select value={requesterFilter} onValueChange={setRequesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Requesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requesters</SelectItem>
                  {requesters.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>

              {/* Second Row: Date Range and Clear Button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* From Date */}
                <div className="space-y-2">
                  <Label htmlFor="from-date" className="text-sm font-medium">
                    From Date
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <Label htmlFor="to-date" className="text-sm font-medium">
                    To Date
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="gap-2 w-full"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredRequisitions.length} of {requisitions?.length || 0} requisitions
            {hasActiveFilters && (
              <span className="text-blue-600 ml-2">
                (filtered)
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredRequisitions && filteredRequisitions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequisitions.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.requisition_code}</TableCell>
                  <TableCell>{format(new Date(req.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{req.position.title}</TableCell>
                  <TableCell>{req.department.name}</TableCell>
                  <TableCell>
                    {req.created_by?.first_name && req.created_by?.last_name
                      ? `${req.created_by.first_name} ${req.created_by.last_name}`
                      : req.created_by?.email || 'Unknown'}
                  </TableCell>
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
              {hasActiveFilters
                ? "No requisitions match your search criteria. Try adjusting your filters."
                : "No requisitions found. Click 'New Requisition' to create one."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
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
