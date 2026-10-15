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
  Building2,
  FileText,
  Clock,
  AlertCircle,
  Filter,
  ArrowRight
} from "lucide-react";
import { useVendorAvailableRFQs, useVendorCategories, useRFQSummary } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/Loading";

export default function VendorRFQsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tenderType, setTenderType] = useState<string>("");
  const [closingSoon, setClosingSoon] = useState(false);

  // Build filter parameters for the API
  const filterParams = {
    search: searchTerm || undefined,
    category: (selectedCategory && selectedCategory !== 'all') ? selectedCategory : undefined,
    tender_type: (tenderType && tenderType !== 'all') ? tenderType : undefined,
    closing_soon: closingSoon || undefined,
  };

  // API calls with filtering parameters
  const { data: rfqData, isLoading, error } = useVendorAvailableRFQs(filterParams);
  const { data: categories, isLoading: categoriesLoading } = useVendorCategories();
  const { data: summary } = useRFQSummary();

  const availableRFQs = rfqData?.results || [];
  const rfqSummary = rfqData?.summary;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 RFQ Page Debug:', {
      rfqData,
      availableRFQs,
      rfqSummary,
      isLoading,
      error
    });

    // Check if RFQs have proper UUIDs
    if (availableRFQs && availableRFQs.length > 0) {
      console.log('✅ First RFQ ID check:', {
        id: availableRFQs[0].id,
        rfq_id: availableRFQs[0].rfq_id,
        id_is_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(availableRFQs[0].id),
        title: availableRFQs[0].title
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading RFQs...</span>
      </div>
    );
  }

  if (error) {
    console.error('❌ RFQ Page Error:', error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load RFQs. Please try refreshing the page.
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs">
              Debug: {error?.message || 'Unknown error'}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // No need for client-side filtering since it's handled by the API
  const filteredRFQs = availableRFQs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (closingDate: string) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'CLOSING_SOON':
        return 'secondary';
      case 'CLOSED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEligibilityBadgeVariant = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return 'default';
      case 'NOT_ELIGIBLE':
        return 'destructive';
      case 'PENDING_REVIEW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available RFQs</h1>
        <p className="text-gray-600 mt-1">
          Browse and submit bids for procurement opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search RFQs by title, RFQ ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-60">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {!categoriesLoading && Array.isArray(categories) && categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name} ({category.rfq_count || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:w-60">
                <Select value={tenderType} onValueChange={setTenderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Tender Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tender Types</SelectItem>
                    <SelectItem value="National Open Tender">National Open Tender</SelectItem>
                    <SelectItem value="Restricted Tender">Restricted Tender</SelectItem>
                    <SelectItem value="Direct Procurement">Direct Procurement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="closing-soon"
                  checked={closingSoon}
                  onCheckedChange={setClosingSoon}
                />
                <label
                  htmlFor="closing-soon"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Closing Soon (7 days)
                </label>
              </div>
            </div>

            {/* Summary Stats */}
            {rfqSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{rfqSummary.total_available || rfqData?.count || 0}</div>
                  <div className="text-xs text-gray-600">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{rfqSummary.closing_soon || 0}</div>
                  <div className="text-xs text-gray-600">Closing Soon</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{rfqSummary.new_rfqs || 0}</div>
                  <div className="text-xs text-gray-600">New This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{rfqSummary.submitted_bids || 0}</div>
                  <div className="text-xs text-gray-600">Submitted Bids</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RFQ Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredRFQs.length} RFQ{filteredRFQs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        {filteredRFQs.length > 0 ? (
          filteredRFQs.map((rfq: any) => {
            const daysRemaining = getDaysRemaining(rfq.closing_date);
            const isClosingSoon = daysRemaining <= 7 && daysRemaining > 0;
            const isClosed = daysRemaining <= 0;

            return (
              <Card key={rfq.rfq_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {rfq.title || rfq.rfq_title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Closes: {formatDate(rfq.closing_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {isClosed ? 'Closed' : isClosingSoon ? `${daysRemaining} days left` : `${daysRemaining} days left`}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {rfq.eoi?.categories?.map((category: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof category === 'string' ? category : category.name}
                              </Badge>
                            ))}
                          </div>

                          {/* Lot-based tender information */}
                          {rfq.lot_info?.is_lot_based && (
                            <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="default" className="bg-purple-600">
                                  Lot-Based Tender
                                </Badge>
                                <span className="text-purple-900 font-medium">
                                  {rfq.lot_info.eligible_lots} of {rfq.lot_info.total_lots} lots eligible for you
                                </span>
                                {rfq.lot_info.submitted_lots > 0 && (
                                  <span className="text-purple-700">
                                    • {rfq.lot_info.submitted_lots} bid{rfq.lot_info.submitted_lots !== 1 ? 's' : ''} submitted
                                  </span>
                                )}
                              </div>
                              {rfq.lot_info.can_bid_more && (
                                <p className="text-xs text-purple-700 mt-1">
                                  You can bid on {rfq.lot_info.eligible_lots - rfq.lot_info.submitted_lots} more lot{(rfq.lot_info.eligible_lots - rfq.lot_info.submitted_lots) !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <Badge variant={getStatusBadgeVariant(rfq.status || rfq.rfq_status)}>
                              {rfq.status || rfq.rfq_status}
                            </Badge>
                            <Badge variant={getEligibilityBadgeVariant(rfq.vendor_eligible ? 'ELIGIBLE' : (rfq.eligibility_status || 'NOT_ELIGIBLE'))}>
                              {rfq.vendor_eligible ? 'Eligible to Bid' :
                               (rfq.eligibility_status === 'ELIGIBLE' ? 'Eligible to Bid' :
                                rfq.eligibility_status === 'NOT_ELIGIBLE' ? 'Not Eligible' : 'Under Review')}
                            </Badge>
                            {(rfq.submission_status || rfq.has_submitted_bid) && (
                              <Badge variant="secondary">
                                {rfq.has_submitted_bid ? 'Submitted' :
                                 rfq.submission_status === 'NOT_STARTED' ? 'Not Started' :
                                 rfq.submission_status === 'DRAFT' ? 'Draft Saved' :
                                 rfq.submission_status === 'SUBMITTED' ? 'Submitted' :
                                 rfq.submission_status === 'EVALUATED' ? 'Evaluated' :
                                 (rfq.submission_status || 'Not Started')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {isClosingSoon && !isClosed && (
                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                              <AlertCircle className="h-3 w-3" />
                              Closing Soon
                            </div>
                          )}

                          <Button
                            onClick={() => {
                              if (!rfq.id) {
                                console.error('❌ RFQ missing UUID, skipping navigation', rfq);
                                return;
                              }
                              router.push(`/vendor-portal/rfqs/${rfq.id}`);
                            }}
                            variant={(rfq.vendor_eligible || rfq.eligibility_status === 'ELIGIBLE') && !isClosed ? "default" : "outline"}
                            disabled={isClosed || (!rfq.vendor_eligible && rfq.eligibility_status === 'NOT_ELIGIBLE') || !rfq.id}
                            className="whitespace-nowrap"
                          >
                            {rfq.has_submitted_bid || rfq.submission_status === 'SUBMITTED' ? 'View Submission' :
                             rfq.submission_status === 'DRAFT' ? 'Continue Bid' :
                             isClosed ? 'View Details' :
                             rfq.lot_info?.is_lot_based ? 'View Lots & Bid' :
                             (rfq.vendor_eligible || rfq.eligibility_status === 'ELIGIBLE') ? 'Submit Bid' : 'View Details'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || (selectedCategory && selectedCategory !== 'all') || (tenderType && tenderType !== 'all') || closingSoon
                  ? "Try adjusting your search criteria or filters"
                  : "There are no RFQs available at the moment"}
              </p>
              {(searchTerm || (selectedCategory && selectedCategory !== 'all') || (tenderType && tenderType !== 'all') || closingSoon) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setTenderType("");
                    setClosingSoon(false);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}