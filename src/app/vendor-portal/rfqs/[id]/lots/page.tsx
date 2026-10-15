"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  Package,
  DollarSign,
  CheckCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import { LoadingSpinner } from "@/components/Loading";
import { useVendorEligibleLots } from "@/features/vendor-portal/controllers/vendorDashboardController";

export default function VendorRFQLotsPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // Use the vendor dashboard controller hook
  const { data: lotsData, isLoading, error } = useVendorEligibleLots(rfqId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading lots...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load eligible lots'}
        </AlertDescription>
      </Alert>
    );
  }

  const solicitation = lotsData?.solicitation;
  const lots = lotsData?.lots || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/vendor-portal/rfqs')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to RFQs
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{solicitation?.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Closes: {formatDate(solicitation?.closing_date)}
              </span>
              <Badge variant="default">Lot-Based Tender</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <Package className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              This is a lot-based tender. You can bid on individual lots based on your approved categories.
              You have {lotsData?.eligible_lots_count} eligible lot{lotsData?.eligible_lots_count !== 1 ? 's' : ''} to bid on.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lots List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Eligible Lots ({lots.length})
        </h2>

        {lots.length > 0 ? (
          lots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {lot.name}
                      </h3>
                      {lot.description && (
                        <p className="text-gray-600 text-sm">{lot.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {lot.estimated_budget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Estimated Budget</p>
                            <p className="font-medium">{formatCurrency(lot.estimated_budget)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="font-medium">{lot.items_count || 0} item(s)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <Badge variant={lot.has_submitted_bid ? "secondary" : "outline"}>
                            {lot.has_submitted_bid ? "Bid Submitted" : "Not Submitted"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Matching Categories */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Your Matching Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {lot.matching_categories?.map((category: any) => (
                          <Badge key={category.id} variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* All Lot Categories */}
                    {lot.category_details && lot.category_details.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Required Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {lot.category_details.map((category: any) => (
                            <Badge key={category.id} variant="secondary" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    <Button
                      onClick={() => router.push(`/vendor-portal/rfqs/${rfqId}/submit?lot_id=${lot.id}`)}
                      disabled={lot.has_submitted_bid}
                      variant={lot.has_submitted_bid ? "outline" : "default"}
                    >
                      {lot.has_submitted_bid ? 'View Bid' : 'Bid on This Lot'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Lots</h3>
              <p className="text-gray-500">
                You don't have any approved categories that match the lots in this tender.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
