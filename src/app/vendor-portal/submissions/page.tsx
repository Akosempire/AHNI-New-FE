"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Calendar,
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useVendorSubmissions } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { LoadingSpinner } from "@/components/Loading";

export default function VendorSubmissionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: submissions, isLoading, error } = useVendorSubmissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load submissions. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Ensure submissions is an array
  const submissionsArray = Array.isArray(submissions) ? submissions : (submissions?.results || []);
  const filteredSubmissions = submissionsArray.filter((submission: any) => {
    const matchesSearch = submission.rfq_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.submission_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'default';
      case 'UNDER_REVIEW':
        return 'secondary';
      case 'SHORTLISTED':
        return 'default';
      case 'AWARDED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'DRAFT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <FileText className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'SHORTLISTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'AWARDED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'DRAFT':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your bid submissions and manage proposals
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions by RFQ title or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="AWARDED">Awarded</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission: any) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {submission.rfq_title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Ref: {submission.submission_reference || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Submitted: {formatDate(submission.submitted_date || submission.created_date)}
                          </span>
                          {submission.bid_amount && (
                            <span className="flex items-center gap-1 font-medium text-green-600">
                              Bid: {formatCurrency(submission.bid_amount)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <Badge
                            variant={getStatusBadgeVariant(submission.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(submission.status)}
                            {submission.status === 'UNDER_REVIEW' ? 'Under Review' :
                             submission.status === 'SHORTLISTED' ? 'Shortlisted' :
                             submission.status}
                          </Badge>

                          {submission.evaluation_score && (
                            <span className="text-sm text-gray-600">
                              Score: {submission.evaluation_score}/100
                            </span>
                          )}

                          {submission.rank && (
                            <span className="text-sm text-gray-600">
                              Rank: #{submission.rank}
                            </span>
                          )}
                        </div>

                        {submission.feedback && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          </div>
                        )}

                        {submission.award_details && submission.status === 'AWARDED' && (
                          <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-green-800">
                              <CheckCircle className="inline h-4 w-4 mr-1" />
                              <strong>Congratulations!</strong> Your bid has been awarded.
                              {submission.award_details.contract_value && (
                                <span className="block mt-1">
                                  Contract Value: {formatCurrency(submission.award_details.contract_value)}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/vendor-portal/submissions/${submission.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>

                        {submission.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/vendor-portal/rfqs/${submission.solicitation || submission.solicitation_id}/submit`)}
                          >
                            Continue Bid
                          </Button>
                        )}

                        {submission.proposal_document && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.proposal_document, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}

                        {submission.status === 'AWARDED' && submission.contract_document && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.contract_document, '_blank')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Contract
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "You haven't submitted any bids yet"}
              </p>
              {(searchTerm || statusFilter !== "all") ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/vendor-portal/rfqs')}
                >
                  Browse Available RFQs
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}