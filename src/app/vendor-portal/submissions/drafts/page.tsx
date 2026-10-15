"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Clock, AlertCircle, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVendorAvailableRFQs } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { LoadingSpinner } from "@/components/Loading";

export default function DraftSubmissionsPage() {
  const router = useRouter();

  // Fetch available RFQs from the backend
  const { data: rfqData, isLoading, error } = useVendorAvailableRFQs({});

  // Transform available RFQs into draft format for display
  // Filter out RFQs where vendor has already submitted a bid
  const draftSubmissions = rfqData?.results
    ?.filter((rfq: any) => !rfq.has_submitted_bid) // Only show RFQs without submissions
    ?.map((rfq: any) => ({
      id: rfq.id,
      rfq_title: rfq.title,
      rfq_id: rfq.rfq_id,
      solicitation: {
        id: rfq.id,
        title: rfq.title,
        rfq_id: rfq.rfq_id,
        status: rfq.status,
        closing_date: rfq.closing_date
      },
      saved_at: rfq.opening_date,
      completion_percentage: 0, // New opportunity - not started
      items_completed: 0,
      total_items: rfq.items_count || 0,
      closing_date: rfq.closing_date
    })) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (closingDate: string) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading available opportunities...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load available RFQs. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Opportunities</h1>
        <p className="text-gray-600 mt-1">
          Start bidding on available RFQs that match your profile
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Click "Start Bid" to begin your submission. Your progress will be saved automatically. Remember to submit before the deadline.
        </AlertDescription>
      </Alert>

      {/* Draft Submissions List */}
      <div className="space-y-4">
        {draftSubmissions.length > 0 ? (
          draftSubmissions.map((draft) => {
            const daysRemaining = getDaysRemaining(draft.closing_date);
            const isUrgent = daysRemaining <= 3;

            return (
              <Card key={draft.id} className={`hover:shadow-md transition-shadow ${
                isUrgent ? 'border-orange-200 bg-orange-50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {draft.rfq_title}
                        </h3>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          New Opportunity
                        </Badge>
                        {isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Closing Soon - {daysRemaining} days left
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        RFQ ID: {draft.rfq_id}
                      </p>

                      {/* RFQ Info */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            RFQ Items
                          </span>
                          <span className="text-sm text-gray-500">
                            {draft.total_items} item{draft.total_items !== 1 ? 's' : ''} to quote
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-md p-3">
                          <p className="text-xs text-blue-800">
                            This is a new opportunity. Click "Start Bid" to begin your submission.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Opened: {formatDate(draft.saved_at)}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          isUrgent ? 'text-orange-600 font-medium' : ''
                        }`}>
                          <AlertCircle className="h-3 w-3" />
                          Closes: {formatDate(draft.closing_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => router.push(`/vendor-portal/rfqs/${draft.solicitation.id}/submit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Start Bid
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/vendor-portal/rfqs/${draft.solicitation.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {isUrgent && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This RFQ closes in {daysRemaining} day(s). Start your bid submission soon to avoid missing the deadline.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Opportunities</h3>
              <p className="text-gray-500 mb-4">
                There are currently no RFQs available that match your vendor profile. Check back later for new opportunities.
              </p>
              <Button onClick={() => router.push('/vendor-portal/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics */}
      {draftSubmissions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Opportunities Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{draftSubmissions.length}</p>
                <p className="text-sm text-blue-800">Available RFQs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {draftSubmissions.filter((d: any) => getDaysRemaining(d.closing_date) > 7).length}
                </p>
                <p className="text-sm text-green-800">Good Time to Bid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {draftSubmissions.filter((d: any) => getDaysRemaining(d.closing_date) <= 3).length}
                </p>
                <p className="text-sm text-orange-800">Closing Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}