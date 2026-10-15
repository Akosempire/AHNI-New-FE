"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Download,
  BarChart,
  MapPin,
  Briefcase,
  UserPlus,
  Pencil,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useGetWorkforceNeedAnalysisId } from "@/features/hr/controllers/hrWorkforceNeedAnalysisController";
import { LoadingSpinner } from "@/components/Loading";
import Link from "next/link";
import { HrRoutes } from "@/constants/RouterConstants";
import { exportToExcel, exportToPDF } from "@/features/hr/utils/workforceNeedAnalysisExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface WorkforceNeedAnalysisViewProps {
  id: string;
}

const WorkforceNeedAnalysisView: React.FC<WorkforceNeedAnalysisViewProps> = ({ id }) => {
  const router = useRouter();

  const { data: analysisResponse, isLoading, error } = useGetWorkforceNeedAnalysisId(id, true);

  const analysis = analysisResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading workforce analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Not Found</h3>
          <p className="text-gray-600 mb-4">
            The requested workforce analysis could not be loaded.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const positionName = typeof analysis.position === 'object' ? analysis.position?.name : analysis.position;
  const locationName = analysis.location
    ? (typeof analysis.location === 'object' ? analysis.location?.name : analysis.location)
    : "Organization-Wide";
  const wisnRatio = parseFloat(analysis.wisn_ratio || "0");
  const gapCount = analysis.shortage_excess_count || 0;

  const getStatusIcon = (problem: string) => {
    switch (problem?.toUpperCase()) {
      case "SHORTAGE":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case "SURPLUS":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "BALANCE":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleExportExcel = () => {
    try {
      const filename = exportToExcel([analysis]);
      toast.success(`Excel file exported: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const handleExportPDF = () => {
    try {
      const filename = exportToPDF([analysis]);
      toast.success(`PDF file exported: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF file");
    }
  };

  const handleExportJSON = () => {
    try {
      const reportData = {
        position: positionName,
        location: locationName,
        current_staff_count: analysis.current_staff_count,
        required_staff_count: analysis.wisn_required_staff_count,
        shortage_excess: analysis.shortage_excess_count,
        workforce_problem: analysis.workforce_problem,
        wisn_ratio: analysis.wisn_ratio,
        workload_pressure: analysis.workload_problem,
        generated_at: new Date().toISOString(),
        generated_by: "AHNI Workforce Analytics System"
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workforce-analysis-${positionName}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("JSON file exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export JSON file");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Workforce Need Analysis</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Briefcase size={16} />
              {positionName} at {locationName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href={{
              pathname: HrRoutes.WORKFORCE_NEED_ANALYSIS_CREATE,
              search: `?id=${analysis.id}`,
            }}
          >
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Alert */}
      <Card className={cn(
        "p-6 border-l-4",
        gapCount < 0 ? "border-l-red-500 bg-red-50" :
        gapCount > 0 ? "border-l-blue-500 bg-blue-50" :
        "border-l-green-500 bg-green-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(analysis.workforce_problem)}
            <div>
              <h3 className="text-lg font-semibold">
                {gapCount < 0
                  ? `Shortage: Need ${Math.abs(gapCount)} more staff`
                  : gapCount > 0
                  ? `Surplus: ${gapCount} extra staff available`
                  : "Optimal staffing level"
                }
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <MapPin size={14} />
                {positionName} • {locationName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current / Required</p>
            <p className="text-3xl font-bold">
              {analysis.current_staff_count} / {analysis.wisn_required_staff_count}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Staff</p>
              <p className="text-xl font-semibold">{analysis.current_staff_count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Required (WISN)</p>
              <p className="text-xl font-semibold">{analysis.wisn_required_staff_count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              wisnRatio < 0.8 ? "bg-red-500" :
              wisnRatio > 1.2 ? "bg-blue-500" : "bg-green-500"
            )}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">WISN Ratio</p>
              <p className="text-xl font-semibold">{analysis.wisn_ratio}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              analysis.workload_problem === "HIGH" ? "bg-red-500" :
              analysis.workload_problem === "NORMAL" ? "bg-green-500" : "bg-gray-500"
            )}>
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Workload Pressure</p>
              <p className="text-xl font-semibold">{analysis.workload_problem || "Normal"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Staffing Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Position</span>
              <span className="font-medium">{positionName}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Location</span>
              <span className="font-medium">{locationName}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Current Staff Count</span>
              <span className="font-medium">{analysis.current_staff_count}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Required Staff (WISN)</span>
              <span className="font-medium">{analysis.wisn_required_staff_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gap</span>
              <span className={cn(
                "font-medium",
                gapCount < 0 ? "text-red-600" :
                gapCount > 0 ? "text-blue-600" : "text-green-600"
              )}>
                {gapCount > 0 ? '+' : ''}{gapCount}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Workforce Status</span>
              <Badge variant={
                analysis.workforce_problem === "SHORTAGE" ? "destructive" :
                analysis.workforce_problem === "SURPLUS" ? "default" : "secondary"
              }>
                {analysis.workforce_problem}
              </Badge>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">WISN Ratio</span>
              <span className={cn(
                "font-medium",
                wisnRatio < 0.8 ? "text-red-600" :
                wisnRatio > 1.2 ? "text-blue-600" : "text-green-600"
              )}>
                {analysis.wisn_ratio}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Workload Pressure</span>
              <Badge variant={
                analysis.workload_problem === "HIGH" ? "destructive" :
                analysis.workload_problem === "NORMAL" ? "default" : "secondary"
              }>
                {analysis.workload_problem}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className="text-sm text-gray-500">
                {wisnRatio < 0.8 ? "Understaffed" :
                 wisnRatio > 1.2 ? "Overstaffed" : "Optimal"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Required */}
      {gapCount !== 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {gapCount < 0 ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <UserPlus size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Recruitment Required</p>
                    <p className="text-sm text-gray-600">
                      Consider recruiting {Math.abs(gapCount)} additional {positionName}
                      {Math.abs(gapCount) > 1 ? 's' : ''} for {locationName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <AlertTriangle size={18} className="text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Review Workload Distribution</p>
                    <p className="text-sm text-gray-600">
                      Current staff may be experiencing high workload pressure. Monitor performance and well-being.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <Users size={18} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Staff Redeployment</p>
                    <p className="text-sm text-gray-600">
                      Consider redeploying {gapCount} staff member{gapCount > 1 ? 's' : ''} to
                      locations with shortages
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <TrendingUp size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Expand Service Delivery</p>
                    <p className="text-sm text-gray-600">
                      Opportunity to expand services or take on additional responsibilities
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* WISN Methodology Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">
          About WISN (Workload Indicators of Staffing Need)
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          WISN is a WHO-endorsed methodology for determining appropriate staffing levels based on workload.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium text-blue-900 mb-1">WISN Ratio &lt; 1.0</p>
            <p className="text-gray-700">Shortage - Staff working beyond capacity</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium text-blue-900 mb-1">WISN Ratio = 1.0</p>
            <p className="text-gray-700">Balance - Optimal staffing level</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium text-blue-900 mb-1">WISN Ratio &gt; 1.0</p>
            <p className="text-gray-700">Surplus - Staff below required workload</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkforceNeedAnalysisView;
