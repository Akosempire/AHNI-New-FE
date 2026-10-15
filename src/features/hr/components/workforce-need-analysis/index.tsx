"use client";

/* eslint-disable no-unused-vars */
import { ColumnDef } from "@tanstack/react-table";
import FormButton from "@/components/FormButton";
import AddSquareIcon from "@/components/icons/AddSquareIcon";
import DataTable from "@/components/Table/DataTable";
import React from "react";
import { cn } from "@/lib/utils";
import { Filter, XCircle, FileSpreadsheet, FileText, TrendingDown, TrendingUp, Users, AlertTriangle, Search, Trash2 } from 'lucide-react';
import { Icon } from "@iconify/react";
import { exportToExcel, exportToPDF } from "@/features/hr/utils/workforceNeedAnalysisExport";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { HrRoutes } from "@/constants/RouterConstants";
import { Checkbox } from "@/components/ui/checkbox";
import PencilIcon from "@/components/icons/PencilIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import IconButton from "@/components/IconButton";
import FilterIcon from "@/components/icons/FilterIcon";
import { useGetWorkforceNeedAnalysis, useDeleteWorkforceNeedAnalysis } from "@/features/hr/controllers/hrWorkforceNeedAnalysisController";
import { useGetWorkforces } from "@/features/hr/controllers/workforceController";

import Card from "@/components/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { useGetLocationList } from "@/features/modules/controllers/config/locationController";
import { useGetPositionPaginate } from "@/features/modules/controllers/config/positionController";
import { LocationResultsData } from "definitions/configs/location";
import { PositionsResultsData } from "definitions/configs/positions";
import { SubmitHandler, useForm } from "react-hook-form";
import FormSelect from "@/components/FormSelectField";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export const filterSchema = z.object({
  position: z.string(),
  location: z.string(),
});

export type TFormValues = z.infer<typeof filterSchema>;

const WFNA: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [deleteItemName, setDeleteItemName] = React.useState<string>("");
  const router = useRouter();
  const { deleteWorkforceNeedAnalysis, isLoading: isDeleting } = useDeleteWorkforceNeedAnalysis();
  const form = useForm<TFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      // current_staff_count: 0,
      // wisn_required_staff_count: 0,
      // shortage_excess_count: 0,
      // wisn_ratio: "",
      // workforce_problem: "",
      // workload_problem: "",
      position: "",
      location: "all",
    },
  });

  const { handleSubmit, reset, watch } = form;

  // Watch form values for reactive filtering
  const selectedLocation = watch("location");
  const selectedPosition = watch("position");

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");

  // Get all locations (increased page size to fetch all locations)
  const { data: locations, isLoading: locationIsLoading } =
    useGetLocationList({
      page: 1,
      size: 1000, // Increased size to get all locations
      search: "",
      enabled: true
    });

  // Get all positions (increased page size to fetch all positions)
  const { data: positions, isLoading: positionIsLoading } =
    useGetPositionPaginate({
      page: 1,
      size: 1000, // Increased size to get all positions
      search: "",
      enabled: true
    });

  const { data, isLoading: loadingWorkforce, error } =
    useGetWorkforceNeedAnalysis({
      ...(selectedLocation && selectedLocation !== "all" && { location: selectedLocation }),
      ...(selectedPosition && selectedPosition !== "all" && { position: selectedPosition }),
    });

  // Filter data by search term (client-side)
  const filteredData = React.useMemo(() => {
    const results = data?.data?.results || [];
    if (!searchTerm) return results;

    const lowerSearch = searchTerm.toLowerCase();
    return results.filter((item: any) => {
      const position = typeof item.position === 'object' ? item.position?.name : item.position;
      const location = typeof item.location === 'object' ? item.location?.name : item.location;

      return (
        position?.toLowerCase().includes(lowerSearch) ||
        location?.toLowerCase().includes(lowerSearch) ||
        (!location && "organization-wide".includes(lowerSearch))
      );
    });
  }, [data, searchTerm]);

  // Calculate summary statistics
  const statistics = React.useMemo(() => {
    const results = filteredData;
    return {
      totalPositions: results.length,
      shortageCount: results.filter((item: any) => item.shortage_excess_count < 0).length,
      surplusCount: results.filter((item: any) => item.shortage_excess_count > 0).length,
      optimalCount: results.filter((item: any) => item.shortage_excess_count === 0).length,
      totalShortage: results.reduce((sum: number, item: any) =>
        item.shortage_excess_count < 0 ? sum + Math.abs(item.shortage_excess_count) : sum, 0
      ),
      totalSurplus: results.reduce((sum: number, item: any) =>
        item.shortage_excess_count > 0 ? sum + item.shortage_excess_count : sum, 0
      ),
      criticalShortages: results.filter((item: any) =>
        item.shortage_excess_count < 0 && item.workload_problem === "HIGH"
      ).length,
    };
  }, [data]);

  // Debug: Get actual employee data to see how MD user is stored
  const { data: employeeData, isLoading: employeeLoading } = useGetWorkforces({
    page: 1,
    size: 100,
    search: "",
    enabled: true,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('=== WORKFORCE NEED ANALYSIS DEBUG ===');
    console.log('Selected Location:', selectedLocation);
    console.log('Selected Position:', selectedPosition);
    console.log('Full API Response:', data);
    console.log('Analysis Results:', data?.data?.results);
    console.log('Results Count:', data?.data?.results?.length);
    console.log('Pagination:', data?.data?.pagination);
    console.log('Loading:', loadingWorkforce);
    console.log('Error:', error);
    console.log('API Endpoint:', 'hr/employees/workforce/need-analysis/');
    console.log('====================================');
  }, [data, loadingWorkforce, error, selectedLocation, selectedPosition]);

  // Debug positions and locations fetching
  React.useEffect(() => {
    console.log('=== POSITIONS & LOCATIONS DEBUG ===');
    console.log('Positions Data:', positions);
    console.log('Positions Count:', positions?.data?.results?.length);
    console.log('Positions Loading:', positionIsLoading);
    console.log('Locations Data:', locations);
    console.log('Locations Count:', locations?.data?.results?.length);
    console.log('Locations Loading:', locationIsLoading);
    console.log('===================================');
  }, [positions, positionIsLoading, locations, locationIsLoading]);

  // Debug employee data to see how MD user position is stored
  React.useEffect(() => {
    console.log('=== EMPLOYEE DATA DEBUG ===');
    console.log('Employee Data:', employeeData);
    console.log('Employee Count:', employeeData?.data?.results?.length);
    console.log('Employee Loading:', employeeLoading);

    // Find MD user specifically
    const mdEmployees = employeeData?.data?.results?.filter((employee: any) => {
      const position = employee.position;
      const positionName = typeof position === 'object' ? position?.name : position;
      const positionId = typeof position === 'object' ? position?.id : position;

      // Check if position matches MD in any form
      return positionName?.toLowerCase().includes('md') ||
             positionName?.toLowerCase().includes('managing director') ||
             positionId === selectedPosition;
    });

    console.log('MD Employees Found:', mdEmployees);
    console.log('Selected Position ID:', selectedPosition);

    // Log all employee positions for comparison
    if (employeeData?.data?.results?.length > 0) {
      console.log('All Employee Positions:');
      employeeData.data.results.forEach((employee: any, index: number) => {
        console.log(`Employee ${index + 1}:`, {
          name: `${employee.first_name} ${employee.last_name}`,
          position: employee.position,
          positionType: typeof employee.position,
          positionId: typeof employee.position === 'object' ? employee.position?.id : employee.position,
          positionName: typeof employee.position === 'object' ? employee.position?.name : employee.position
        });
      });
    }
    console.log('==============================');
  }, [employeeData, employeeLoading, selectedPosition]);

  const onSubmit: SubmitHandler<TFormValues> = (values) => {
    // Filter values are automatically applied through getValues() in the query
    console.log("filter; ", values);
  };

  const handleDelete = async () => {
    try {
      await deleteWorkforceNeedAnalysis(selectedId);
      toast.success("Workforce requirement deleted successfully");
      setDialogOpen(false);
      setSelectedId("");
      setDeleteItemName("");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete workforce requirement");
    }
  };

  const openDeleteDialog = (id: string, position: string, location: string) => {
    setSelectedId(id);
    setDeleteItemName(`${position} - ${location || "Organization-Wide"}`);
    setDialogOpen(true);
  };

  const handleExportExcel = () => {
    try {
      const analysisData = data?.data?.results || [];
      if (analysisData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const filters: any = {};
      if (selectedPosition && selectedPosition !== "all") {
        const pos = positions?.data?.results?.find((p: PositionsResultsData) => String(p.id) === selectedPosition);
        filters.position = pos?.name;
      }
      if (selectedLocation && selectedLocation !== "all") {
        const loc = locations?.data?.results?.find((l: LocationResultsData) => String(l.id) === selectedLocation);
        filters.location = loc?.name;
      }

      const filename = exportToExcel(analysisData, filters);
      toast.success(`Excel file exported: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const handleExportPDF = () => {
    try {
      const analysisData = data?.data?.results || [];
      if (analysisData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const filters: any = {};
      if (selectedPosition && selectedPosition !== "all") {
        const pos = positions?.data?.results?.find((p: PositionsResultsData) => String(p.id) === selectedPosition);
        filters.position = pos?.name;
      }
      if (selectedLocation && selectedLocation !== "all") {
        const loc = locations?.data?.results?.find((l: LocationResultsData) => String(l.id) === selectedLocation);
        filters.location = loc?.name;
      }

      const filename = exportToPDF(analysisData, filters);
      toast.success(`PDF file exported: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF file");
    }
  };

  // const onDelete = async () => {
  //   await deleteWorkforceNeedAnalysis({
  //     id: selectedId as string,
  //   });
  //   setDialogOpen(false);
  // };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      size: 50,
      header: ({ table }) => {
        return (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
          />
        );
      },
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
          />
        );
      },
    },
    {
      header: "Position",
      accessorKey: "position",
      size: 200,
      cell: ({ getValue, row }) => {
        const position = getValue();
        console.log('Position cell data:', position, 'Row:', row.original);

        if (typeof position === 'object' && position !== null) {
          return String((position as any).name || (position as any).title || 'Unknown Position');
        }
        return String(position || 'N/A');
      },
    },
    {
      header: "Location",
      accessorKey: "location",
      size: 200,
      cell: ({ getValue, row }) => {
        const location = getValue();
        console.log('Location cell data:', location, 'Row:', row.original);

        if (!location) {
          return (
            <span className="text-blue-600 font-medium">
              Organization-Wide
            </span>
          );
        }

        if (typeof location === 'object' && location !== null) {
          return String((location as any).name || (location as any).state || (location as any).city || 'Unknown Location');
        }
        return String(location);
      },
    },
    {
      header: "Current Staff",
      accessorKey: "current_staff_count",
      size: 200,
    },
    {
      header: "Required Staff Based on WISN",
      accessorKey: "wisn_required_staff_count",
      size: 250,
    },
    {
      header: "Shortage or excess",
      accessorKey: "shortage_excess_count",
      size: 200,
    },
    {
      header: "Workforce Problem",
      accessorKey: "workforce_problem",
      size: 200,
      cell: ({ getValue }) => {
        return (
          <h4
            className={cn(
              "p-1 rounded-lg capitalize",
              getValue() === "SURPLUS" && "text-green-500",
              getValue() === "SHORTAGE" && "text-red-500",
              getValue() === "BALANCE" && "text-[#021A0D]"
            )}
          >
            {getValue() as string}
          </h4>
        );
      },
    },
    {
      header: "WISN Ratio",
      accessorKey: "wisn_ratio",
      size: 200,
      cell: ({ getValue }) => {
        return (
          <h4
            className={cn(
              "p-1 rounded-lg capitalize",
              parseFloat(getValue() as string) > 1.0 && "text-green-500",
              parseFloat(getValue() as string) < 1.0 && "text-red-500",
              parseFloat(getValue() as string) === 1.0 && "text-[#021A0D]"
            )}
          >
            {getValue() as string}
          </h4>
        );
      },
    },
    {
      header: "Workload Pressure",
      accessorKey: "workload_problem",
      size: 200,
      cell: ({ getValue }) => {
        return (
          <h4
            className={cn(
              "p-1 rounded-lg capitalize",
              getValue() === "NONE" && "text-green-500",
              getValue() === "HIGH" && "text-red-500",
              getValue() === "NORMAL" && "text-[#021A0D]"
            )}
          >
            {getValue() as string}
          </h4>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      size: 150,
      cell: ({ row }) => <ActionListAction data={row} />,
    },
  ];

  const ActionListAction = ({ data }: any) => {
    const position = typeof data.original.position === 'object'
      ? data.original.position?.name
      : data.original.position;
    const location = typeof data.original.location === 'object'
      ? data.original.location?.name
      : data.original.location;

    return (
      <div className='flex center gap-1'>
        <Link
          href={`/dashboard/hr/workforce-need-analysis/${data.original.id}`}
        >
          <Button
            className='flex items-center justify-center gap-2'
            variant='ghost'
            size='sm'
            title='View Analysis'
          >
            <EyeIcon />
          </Button>
        </Link>
        <Link
          href={{
            pathname: HrRoutes.WORKFORCE_NEED_ANALYSIS_CREATE,
            search: `?id=${data.original.id}`,
          }}
        >
          <Button
            className='flex items-center justify-center gap-2'
            variant='ghost'
            size='sm'
            title='Edit Requirement'
          >
            <PencilIcon />
          </Button>
        </Link>
        <Button
          className='flex items-center justify-center gap-2'
          variant='ghost'
          size='sm'
          title='Delete Requirement'
          onClick={() => openDeleteDialog(data.original.id, position, location)}
        >
          <Trash2 className="text-red-600" size={18} />
        </Button>
      </div>
    );
  };


  return (
    <div className='flex flex-col justify-center items-center gap-y-[1rem]'>
      {/** ============================================= HEADER ============================================= */}
      <div className='w-full flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Workforce Need Analysis</h1>
          <p className='text-gray-600 mt-1'>
            Manage staffing requirements and analyze workforce gaps
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={loadingWorkforce || !data?.data?.results?.length}
            className='flex items-center gap-2'
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={loadingWorkforce || !data?.data?.results?.length}
            className='flex items-center gap-2'
          >
            <FileText size={16} />
            Export PDF
          </Button>
          <Link href={HrRoutes.WORKFORCE_NEED_ANALYSIS_CREATE}>
            <FormButton className='flex items-center gap-2'>
              <AddSquareIcon />
              Set New Requirement
            </FormButton>
          </Link>
        </div>
      </div>

      {/** ============================================= FILTER ============================================= */}
      <Card className='w-full px-6'>
        <Accordion
          type='single'
          collapsible
          defaultValue='1'
          className='w-full'
        >
          <AccordionItem value={"1"}>
            <AccordionTrigger className='mx-4'>
              <FilterIcon />
            </AccordionTrigger>

            <AccordionContent>
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className='grid grid-cols-3 gap-6 mt-6 mx-4'
                >
                  <div className='col-span-1'>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        type="text"
                        placeholder="Search by position or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className='col-span-1'>
                    <FormSelect
                      // label='location'
                      name='location'
                      placeholder='Select a location'
                    >
                      <SelectContent>
                        {locationIsLoading ? (
                          <div className='flex justify-center items-center p-4'>
                            <p className='text-sm text-muted-foreground'>
                              Loading...
                            </p>
                          </div>
                        ) : (
                          <>
                            <SelectItem value="all">All Locations</SelectItem>
                            {(locations?.data?.results || []).map(
                              (location: LocationResultsData) => (
                                <SelectItem key={location.id} value={String(location.id)}>
                                  {String(location.name || 'Unknown Location')}
                                </SelectItem>
                              )
                            )}
                          </>
                        )}
                      </SelectContent>
                    </FormSelect>
                  </div>

                  <div className='col-span-1'>
                    <FormSelect
                      // label='position'
                      name='position'
                      placeholder='Select a position'
                    >
                      <SelectContent>
                        {positionIsLoading ? (
                          <div className='flex justify-center items-center p-4'>
                            <p className='text-sm text-muted-foreground'>
                              Loading...
                            </p>
                          </div>
                        ) : (positions?.data?.results || []).length > 0 ? (
                          (positions?.data?.results || []).map(
                            (position: PositionsResultsData) => (
                              <SelectItem key={position.id} value={String(position.id)}>
                                {String(position.name)}
                              </SelectItem>
                            )
                          )
                        ) : (
                          <div className='flex justify-center items-center p-4'>
                            <p className='text-sm text-muted-foreground'>
                              No positions found
                            </p>
                          </div>
                        )}
                      </SelectContent>
                    </FormSelect>
                  </div>

                  <div className='col-span-3 flex justify-end'>
                    <div className='flex center gap-4'>
                      <FormButton
                        onClick={() => {
                          reset();
                          setSearchTerm("");
                        }}
                        className='flex items-center justify-center gap-2'
                      >
                        Reset All Filters
                      </FormButton>
                    </div>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Summary Statistics Cards */}
      {!loadingWorkforce && statistics.totalPositions > 0 && (
        <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Positions</p>
                <p className='text-2xl font-bold'>{statistics.totalPositions}</p>
              </div>
              <div className='p-3 rounded-full bg-blue-100'>
                <Users size={24} className='text-blue-600' />
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              {statistics.shortageCount} shortage • {statistics.surplusCount} surplus • {statistics.optimalCount} optimal
            </p>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Staff Shortage</p>
                <p className='text-2xl font-bold text-red-600'>{statistics.totalShortage}</p>
              </div>
              <div className='p-3 rounded-full bg-red-100'>
                <TrendingDown size={24} className='text-red-600' />
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Across {statistics.shortageCount} position{statistics.shortageCount !== 1 ? 's' : ''}
            </p>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Staff Surplus</p>
                <p className='text-2xl font-bold text-green-600'>{statistics.totalSurplus}</p>
              </div>
              <div className='p-3 rounded-full bg-green-100'>
                <TrendingUp size={24} className='text-green-600' />
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Across {statistics.surplusCount} position{statistics.surplusCount !== 1 ? 's' : ''}
            </p>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Critical Shortages</p>
                <p className='text-2xl font-bold text-orange-600'>{statistics.criticalShortages}</p>
              </div>
              <div className='p-3 rounded-full bg-orange-100'>
                <AlertTriangle size={24} className='text-orange-600' />
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              High workload pressure
            </p>
          </Card>
        </div>
      )}

      {/* Filter Status Info */}
      {((selectedLocation && selectedLocation !== "all") || (selectedPosition && selectedPosition !== "all")) && (
        <Card className='w-full px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Filter size={16} />
              <p className='text-sm font-medium'>
                Showing results for:
                {selectedPosition && selectedPosition !== "all" && (
                  <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                    Position: {positions?.data?.results?.find((p: PositionsResultsData) => String(p.id) === selectedPosition)?.name || 'Loading...'}
                  </span>
                )}
                {selectedLocation && selectedLocation !== "all" && (
                  <span className='ml-2 px-2 py-1 bg-green-100 text-green-800 rounded'>
                    Location: {locations?.data?.results?.find((l: LocationResultsData) => String(l.id) === selectedLocation)?.name || 'Loading...'}
                  </span>
                )}
                <span className='ml-3 text-gray-600'>
                  ({data?.data?.pagination?.count || 0} {(data?.data?.pagination?.count || 0) === 1 ? 'result' : 'results'})
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reset()}
              className='flex items-center gap-2'
            >
              <XCircle size={16} />
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      <div className='w-full'>
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={loadingWorkforce}
          pagination={{
            total: filteredData.length,
            pageSize: data?.data?.pagination?.page_size || 20,
            onChange: (page: number) => {},
          }}
        />
      </div>

      <ConfirmationDialog
        open={isDialogOpen}
        title={`Delete Workforce Requirement: ${deleteItemName}?`}
        description="This action cannot be undone. This will permanently delete this workforce requirement and all associated analysis data."
        onCancel={() => {
          setDialogOpen(false);
          setSelectedId("");
          setDeleteItemName("");
        }}
        onOk={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default WFNA;
