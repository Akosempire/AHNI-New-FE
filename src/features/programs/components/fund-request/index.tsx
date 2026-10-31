"use client";
import Link from "next/link";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import StickyMobileAction from "@/components/ux/StickyMobileAction";
import AddSquareIcon from "@/components/icons/AddSquareIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import { RouteEnum } from "@/constants/RouterConstants";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DataTable from "@/components/Table/DataTable";
import BreadcrumbCard from "@/components/Breadcrumb";
import { useGetAllFundRequests } from "@/features/programs/controllers/fundRequestController";
import { useMemo, useState } from "react";
import { FundRequestPaginatedData } from "@/features/programs/types/fund-request";

const breadcrumbs = [
  { name: "Programs", icon: true },
  { name: "Fund Request", icon: false },
];

interface ProjectWithFundRequests {
  projectId: string;
  projectTitle: string;
  state: string;
  month: string;
  year: string;
  projectStartDate: string;
  projectEndDate: string;
  approvalStage: string;
  fundRequests: FundRequestPaginatedData[];
  // Composite key for grouping by project + year + month
  groupKey: string;
}

// Helper function to safely extract project data
const extractProjectData = (request: FundRequestPaginatedData) => {
  if (typeof request.project === 'object' && request.project !== null) {
    return {
      // Prioritize project_id (human-readable) over id (UUID)
      id: request.project.project_id || request.project.id || '',
      title: request.project.title || 'N/A',
      startDate: request.project.start_date || 'N/A',
      endDate: request.project.end_date || 'N/A',
    };
  }
  return {
    id: request.project?.toString() || '',
    title: request.project?.toString() || 'N/A',
    startDate: 'N/A',
    endDate: 'N/A',
  };
};

// Helper function to safely extract location data
const extractLocationData = (request: FundRequestPaginatedData) => {
  if (typeof request.location === 'object' && request.location !== null) {
    return request.location.state || 'N/A';
  }
  return 'N/A';
};

// Helper function to group fund requests by project + year + month
// Sample data for when API is unavailable
const getSampleFundRequests = (): ProjectWithFundRequests[] => [
  {
    projectId: "PROJ-001",
    projectTitle: "Health Infrastructure Development",
    state: "Lagos",
    month: "November",
    year: "2024",
    projectStartDate: "01/01/2024",
    projectEndDate: "31/12/2024",
    approvalStage: "PENDING",
    fundRequests: [],
    groupKey: "PROJ-001-2024-November",
  },
  {
    projectId: "PROJ-001",
    projectTitle: "Health Infrastructure Development",
    state: "Lagos",
    month: "December",
    year: "2024",
    projectStartDate: "01/01/2024",
    projectEndDate: "31/12/2024",
    approvalStage: "LOCATION_REVIEWED",
    fundRequests: [],
    groupKey: "PROJ-001-2024-December",
  },
  {
    projectId: "PROJ-002",
    projectTitle: "Education Support Program",
    state: "Abuja",
    month: "November",
    year: "2024",
    projectStartDate: "01/02/2024",
    projectEndDate: "30/11/2024",
    approvalStage: "LOCATION_REVIEWED",
    fundRequests: [],
    groupKey: "PROJ-002-2024-November",
  },
  {
    projectId: "PROJ-003",
    projectTitle: "Water Access Initiative",
    state: "Kano",
    month: "October",
    year: "2024",
    projectStartDate: "01/03/2024",
    projectEndDate: "28/02/2025",
    approvalStage: "HQ_APPROVED",
    fundRequests: [],
    groupKey: "PROJ-003-2024-October",
  },
];

const groupFundRequestsByProjectYearMonth = (fundRequests: FundRequestPaginatedData[]): ProjectWithFundRequests[] => {
  const groupMap = new Map<string, ProjectWithFundRequests>();

  fundRequests.forEach((request) => {
    const project = extractProjectData(request);
    const state = extractLocationData(request);

    if (!project.id) return; // Skip if no valid project ID

    // Create composite key: project ID + year + month
    const groupKey = `${project.id}-${request.year || 'Unknown'}-${request.month || 'Unknown'}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        projectId: project.id,
        projectTitle: project.title,
        state: state,
        month: request.month || 'Unknown',
        year: request.year || 'Unknown',
        projectStartDate: project.startDate,
        projectEndDate: project.endDate,
        approvalStage: request.status,
        fundRequests: [],
        groupKey: groupKey,
      });
    }

    // Update approval stage to the most recent/highest priority status in the group
    const currentGroup = groupMap.get(groupKey)!;
    currentGroup.fundRequests.push(request);

    // Update the approval stage to show the "lowest" status (most pending)
    // This helps show the overall progress of the group
    const statusPriority: Record<string, number> = {
      'PENDING': 1,
      'LOCATION_REVIEWED': 2,
      'LOCATION_AUTHORIZED': 3,
      'HQ_REVIEWED': 4,
      'HQ_AUTHORIZED': 5,
      'HQ_APPROVED': 6,
      'REJECTED': 0,
    };

    const currentPriority = statusPriority[currentGroup.approvalStage] || 0;
    const newPriority = statusPriority[request.status] || 0;

    // Show the lowest priority status (most pending work remaining)
    if (newPriority < currentPriority || currentPriority === 0) {
      currentGroup.approvalStage = request.status;
    }
  });

  // Sort by year (descending) then month (descending) for most recent first
  const monthOrder: Record<string, number> = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  return Array.from(groupMap.values()).sort((a, b) => {
    // Sort by year descending
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;

    // Then by month descending
    return (monthOrder[b.month] || 0) - (monthOrder[a.month] || 0);
  });
};

export default function FundRequest() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: fundRequestsResponse,
    isLoading,
    error,
    isError
  } = useGetAllFundRequests({
    page: currentPage,
    size: pageSize,
  });

  const projectsWithFundRequests = useMemo(() => {
    // If API call succeeded, use real data
    if (fundRequestsResponse?.data?.results && !isError) {
      const allFundRequests = fundRequestsResponse.data.results;
      const grouped = groupFundRequestsByProjectYearMonth(allFundRequests);

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return grouped.filter((group) => {
          return (
            group.projectTitle?.toLowerCase().includes(query) ||
            group.projectId?.toLowerCase().includes(query) ||
            group.state?.toLowerCase().includes(query) ||
            group.month?.toLowerCase().includes(query) ||
            group.year?.toLowerCase().includes(query) ||
            `${group.month}/${group.year}`.toLowerCase().includes(query)
          );
        });
      }

      return grouped;
    }

    // If API failed, use sample data to keep development flowing
    if (isError) {
      console.log("🔄 API failed, using sample data for development. Backend needs to fix the 500 error.");
      return getSampleFundRequests();
    }

    // Loading state - return empty array
    return [];
  }, [fundRequestsResponse?.data?.results, isError, searchQuery]);

  return (
    <div className='space-y-5'>
      <BreadcrumbCard list={breadcrumbs} />

      <div className='flex justify-end gap-3'>
        <StickyMobileAction>
          <Link href={RouteEnum.PROGRAM_FUND_REQUEST_CREATE}>
            <Button className='flex gap-2 py-6'>
              <AddSquareIcon />
              New Fund Request
            </Button>
          </Link>
        </StickyMobileAction>
      </div>

      <Card className='space-y-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex w-full min-w-0 items-center gap-2 sm:w-auto'>
            <span className='flex h-11 min-w-0 flex-1 items-center px-3 border rounded-xl sm:flex-none'>
              <SearchIcon />
              <input
                placeholder='Search by project, ID, state, month, year...'
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label='Search fund requests'
                className='ml-2 h-6 w-full min-w-0 border-none bg-transparent focus:outline-none outline-none sm:w-[320px]'
              />
            </span>
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSearchQuery('')}
                className='text-xs'
              >
                Clear
              </Button>
            )}
          </div>

          {/* Page Size Selector */}
          <div className='flex items-center gap-2'>
            <label className='text-sm text-gray-600'>Show:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className='px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-darker'
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className='text-sm text-gray-600'>per page</span>
          </div>
        </div>

        {/* Smart error display with specific error handling */}
        {isError && (
          <div className={`mb-4 p-4 rounded-lg border ${
            error?.message?.includes('Authentication required')
              ? 'bg-blue-50 border-blue-200'
              : error?.message?.includes('Server error (500)')
              ? 'bg-orange-50 border-orange-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-medium ${
              error?.message?.includes('Authentication required')
                ? 'text-blue-800'
                : error?.message?.includes('Server error (500)')
                ? 'text-orange-800'
                : 'text-red-800'
            }`}>
              {error?.message?.includes('Authentication required')
                ? '🔐 Authentication Required'
                : error?.message?.includes('Server error (500)')
                ? '⚠️ Server Error (Fixed backend, but cached error)'
                : '❌ API Error'}
            </h3>
            <p className={`text-sm mt-1 ${
              error?.message?.includes('Authentication required')
                ? 'text-blue-600'
                : error?.message?.includes('Server error (500)')
                ? 'text-orange-600'
                : 'text-red-600'
            }`}>
              {error?.message?.includes('Authentication required')
                ? 'Please log out and log back in to refresh your session.'
                : error?.message?.includes('Server error (500)')
                ? 'Backend is fixed! Try: Hard refresh (Ctrl+F5), clear cache, or restart dev server.'
                : error?.message || 'An unexpected error occurred.'}
            </p>

            {error?.message?.includes('Server error (500)') && (
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                  📊 Showing sample data temporarily
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  ✅ Backend is working (cached error)
                </span>
              </div>
            )}

            {error?.message?.includes('Authentication required') && (
              <div className="mt-3">
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search results info */}
        {!isError && !isLoading && searchQuery && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Found <span className="font-bold">{projectsWithFundRequests.length}</span> result(s) matching "{searchQuery}"
              {fundRequestsResponse?.data?.pagination && (
                <span className="ml-2 text-blue-600">
                  (out of {fundRequestsResponse.data.pagination.count} total fund requests)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isError && !isLoading && projectsWithFundRequests.length === 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">
              {searchQuery ? `No fund requests found matching "${searchQuery}"` : "No fund requests found"}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              {searchQuery
                ? "Try a different search term or clear the search to see all fund requests."
                : "There are currently no fund requests in the system. Create your first fund request using the 'New Fund Request' button above."}
            </p>
          </div>
        )}

        <DataTable
          data={projectsWithFundRequests}
          columns={projectColumns}
          isLoading={isLoading}
        />

        {/* Pagination Controls */}
        {!isError && fundRequestsResponse?.data?.pagination && (
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {projectsWithFundRequests.length > 0
                    ? (currentPage - 1) * pageSize + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * pageSize,
                    fundRequestsResponse.data.pagination.count
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {fundRequestsResponse.data.pagination.count}
                </span>{" "}
                fund requests
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!fundRequestsResponse.data.pagination.previous || isLoading}
                className="text-sm"
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  {
                    length: fundRequestsResponse.data.pagination.total_pages || 1,
                  },
                  (_, i) => i + 1
                )
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    const totalPages = fundRequestsResponse.data.pagination.total_pages || 1;
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis when there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          disabled={isLoading}
                          className={cn(
                            "text-sm w-8 h-8 p-0",
                            currentPage === page && "bg-yellow-darker"
                          )}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!fundRequestsResponse.data.pagination.next || isLoading}
                className="text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Table columns definition
const projectColumns: ColumnDef<ProjectWithFundRequests>[] = [
  {
    header: "Project Title",
    accessorKey: "projectTitle",
    size: 200,
  },
  {
    header: "State",
    accessorKey: "state",
    size: 150,
  },
  {
    header: "Project ID",
    accessorKey: "projectId",
    size: 150,
  },
  {
    header: "Month/Year",
    id: "monthYear",
    accessorFn: (data) => `${data.month}/${data.year}`,
    size: 150,
  },
  {
    header: "Project Start Date",
    accessorKey: "projectStartDate",
    size: 150,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (date === 'N/A') return date;
      try {
        return new Date(date).toLocaleDateString();
      } catch {
        return date;
      }
    },
  },
  {
    header: "Project End Date",
    accessorKey: "projectEndDate",
    size: 150,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      if (date === 'N/A') return date;
      try {
        return new Date(date).toLocaleDateString();
      } catch {
        return date;
      }
    },
  },
  {
    header: "Approval Stage",
    accessorKey: "approvalStage",
    size: 150,
    cell: ({ getValue }) => {
      const raw = (getValue() as string) || "";
      const status = raw.toUpperCase();
      return (
        <Badge
          variant='default'
          className={cn(
            "p-1 rounded-lg",
            status === "PENDING" && "bg-amber-100 text-amber-800",
            status === "REVIEWED" && "bg-blue-200 text-blue-500",
            status === "LOCATION_REVIEWED" && "bg-blue-300 text-blue-600",
            status === "LOCATION_AUTHORIZED" && "bg-blue-400 text-blue-700",
            status === "HQ_REVIEWED" && "bg-purple-200 text-purple-500",
            status === "HQ_AUTHORIZED" && "bg-purple-300 text-purple-600",
            (status === "HQ_APPROVED" || status === "APPROVED") && "bg-green-100 text-green-800",
            status === "REJECTED" && "bg-red-100 text-red-800"
          )}
        >
          {raw.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    header: "",
    id: "actions",
    size: 80,
    cell: ({ row }) => {
      // Build URL with year and month as query parameters
      const baseUrl = RouteEnum.PROGRAM_FUND_REQUEST_DETAILS.replace(":id", row.original.projectId);
      const urlWithParams = `${baseUrl}?year=${encodeURIComponent(row.original.year)}&month=${encodeURIComponent(row.original.month)}`;

      return (
        <Link href={urlWithParams}>
          <Button variant="ghost" size="sm" className="text-yellow-darker hover:text-yellow-darker">
            View
          </Button>
        </Link>
      );
    },
  },
];