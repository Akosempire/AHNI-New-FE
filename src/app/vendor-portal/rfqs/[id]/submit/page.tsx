"use client";

export const dynamic = "force-dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  ArrowLeft,
  Info
} from "lucide-react";
import {
  useVendorRFQDetails,
  useSubmitRFQBid,
  useSubmitRFPProposal,
  useSaveRFQDraft,
  useSaveRFPDraft
} from "@/features/vendor-portal/controllers/vendorDashboardController";
import { RFQBidForm } from "@/features/vendor-portal/components/RFQBidForm";
import { RFPProposalForm } from "@/features/vendor-portal/components/RFPProposalForm";
import { LoadingSpinner } from "@/components/Loading";
import { toast } from "sonner";

export default function SubmitBidPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  // Fetch RFQ/RFP details
  const { data: rfqData, isLoading, error } = useVendorRFQDetails(rfqId);

  // Submission hooks
  const submitRFQBid = useSubmitRFQBid();
  const submitRFPProposal = useSubmitRFPProposal();
  const saveRFQDraft = useSaveRFQDraft();
  const saveRFPDraft = useSaveRFPDraft();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Handle RFQ bid submission
  const handleRFQSubmit = useCallback(async (data: any) => {
    try {
      await submitRFQBid.mutateAsync({
        solicitation_id: rfqId,
        items: data.items.map((item: any) => ({
          solicitation_item_id: item.solicitation_item_id,
          unit_price: item.unit_price,
          quantity: item.quantity
        })),
        delivery_time: data.delivery_time,
        payment_terms: data.payment_terms,
        validity_period: data.validity_period,
        currency: data.currency || 'NGN',
        warranty: data.warranty || '',
      });

      toast.success("Bid submitted successfully!");
      router.push(`/vendor-portal/rfqs/${rfqId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit bid");
      throw error;
    }
  }, [rfqId, submitRFQBid, router]);

  // Handle RFQ draft save
  const handleRFQDraftSave = useCallback(async (data: any) => {
    try {
      await saveRFQDraft.mutateAsync({
        solicitation_id: rfqId,
        items: data.items.map((item: any) => ({
          solicitation_item_id: item.solicitation_item_id,
          unit_price: item.unit_price,
          quantity: item.quantity
        })),
        delivery_time: data.delivery_time,
        payment_terms: data.payment_terms,
        validity_period: data.validity_period,
        currency: data.currency || 'NGN',
        warranty: data.warranty || '',
        status: 'DRAFT'
      });

      toast.success("Draft saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
      throw error;
    }
  }, [rfqId, saveRFQDraft]);

  // Handle RFP proposal submission
  const handleRFPSubmit = useCallback(async (formData: FormData) => {
    try {
      await submitRFPProposal.mutateAsync(formData);
      toast.success("Proposal submitted successfully!");
      router.push(`/vendor-portal/rfqs/${rfqId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit proposal");
      throw error;
    }
  }, [rfqId, submitRFPProposal, router]);

  // Handle RFP draft save
  const handleRFPDraftSave = useCallback(async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("rfp_id", rfqId);
      formData.append("notes", data.notes);
      formData.append("status", "DRAFT");

      // Append documents
      data.documents.forEach((file: File) => {
        formData.append("documents", file);
      });

      await saveRFPDraft.mutateAsync(formData);
      toast.success("Draft saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
      throw error;
    }
  }, [rfqId, saveRFPDraft]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <LoadingSpinner />
        <p className="text-gray-600">Loading solicitation details...</p>
      </div>
    );
  }

  // Error state
  if (error || !rfqData) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/vendor-portal/submissions/drafts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load solicitation details. The RFQ/RFP may not exist or you may not have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(rfqData.closing_date);
  const isUrgent = daysRemaining <= 3;
  const isRFQ = rfqData.request_type === 'REQUEST FOR QUOTATION';
  const isRFP = rfqData.request_type === 'REQUEST FOR PROPOSAL';

  // Check if vendor has already submitted a bid
  const hasSubmittedBid = rfqData.vendor_eligibility?.has_submitted_bid;
  const canSubmitBid = rfqData.vendor_eligibility?.can_submit_bid;

  // If already submitted, show message instead of form
  if (hasSubmittedBid) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/vendor-portal/submissions/drafts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bid Already Submitted</strong>
            <p className="mt-2">You have already submitted a bid for this solicitation. You can view your submission in the "My Submissions" section.</p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{rfqData.title}</CardTitle>
            <CardDescription>RFQ ID: {rfqData.rfq_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
              <div>
                <p className="font-semibold text-green-900">Submission Status</p>
                <p className="text-sm text-green-700">Your bid has been successfully submitted and is pending review.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/vendor-portal/submissions/pending')}
              >
                View My Submissions
              </Button>
              <Button
                onClick={() => router.push(`/vendor-portal/rfqs/${rfqId}`)}
              >
                View RFQ Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/vendor-portal/submissions/drafts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>
        <Badge variant={isUrgent ? "destructive" : "secondary"}>
          {daysRemaining} days remaining
        </Badge>
      </div>

      {/* Solicitation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">{rfqData.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {rfqData.background}
              </CardDescription>
            </div>
            <div className="ml-4 flex flex-col gap-2">
              <Badge variant="outline" className="text-xs">
                {rfqData.rfq_id}
              </Badge>
              <Badge
                variant={isRFQ ? "default" : "secondary"}
                className="text-xs"
              >
                {rfqData.request_type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Opening Date</p>
                <p className="text-sm font-medium">{formatDate(rfqData.opening_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Closing Date</p>
                <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : ''}`}>
                  {formatDate(rfqData.closing_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant="outline" className="text-sm">
                  {rfqData.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgency Alert */}
      {isUrgent && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This solicitation closes in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Please submit your bid soon to avoid missing the deadline.
          </AlertDescription>
        </Alert>
      )}

      {/* Type Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {isRFQ && (
            <>
              <strong>RFQ Submission:</strong> Provide unit prices for each item in the solicitation. Your total bid amount will be calculated automatically.
            </>
          )}
          {isRFP && (
            <>
              <strong>RFP Submission:</strong> Submit a comprehensive proposal with supporting documents (technical proposal, financial proposal, company profile, etc.).
            </>
          )}
          {!isRFQ && !isRFP && (
            <>
              <strong>Unknown Type:</strong> This solicitation type ({rfqData.request_type}) is not recognized. Please contact support.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Conditional Form Rendering */}
      {isRFQ && rfqData.items && (
        <RFQBidForm
          rfqId={rfqId}
          items={rfqData.items}
          onSubmit={handleRFQSubmit}
          onSaveDraft={handleRFQDraftSave}
        />
      )}

      {isRFP && (
        <RFPProposalForm
          rfpId={rfqId}
          onSubmit={handleRFPSubmit}
          onSaveDraft={handleRFPDraftSave}
        />
      )}

      {!isRFQ && !isRFP && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This solicitation type ({rfqData.request_type}) is not supported. Please contact the procurement office for assistance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
