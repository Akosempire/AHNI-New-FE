"use client";

export const dynamic = "force-dynamic";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {

ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Download,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Edit
} from "lucide-react";
import { LoadingSpinner } from "@/components/Loading";
import { useVendorSubmissionDetails } from "@/features/vendor-portal/controllers/vendorDashboardController";

export default function VendorSubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch submission details from API
  const { data: submissionDetails, isLoading, error } = useVendorSubmissionDetails(submissionId as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading submission details...</span>
      </div>
    );
  }

  if (error || !submissionDetails) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/vendor-portal/submissions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load submission details. The submission may not exist or you may not have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/vendor-portal/submissions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{submissionDetails.rfq_title}</h1>
          <p className="text-gray-600 mt-1">
            Submission #{submissionDetails.submission_reference} • {submissionDetails.rfq_reference}
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge
                  variant={getStatusBadgeVariant(submissionDetails.status)}
                  className="flex items-center gap-1 mt-1"
                >
                  {getStatusIcon(submissionDetails.status)}
                  {submissionDetails.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bid Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(submissionDetails.bid_amount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Evaluation Score</p>
                <p className="text-lg font-semibold text-blue-600">
                  {submissionDetails.evaluation_score ? `${submissionDetails.evaluation_score}/100` : 'Pending'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ranking</p>
                <p className="text-lg font-semibold text-purple-600">
                  {submissionDetails.rank ? `#${submissionDetails.rank} of ${submissionDetails.total_bidders}` : 'TBD'}
                </p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Alert */}
      {submissionDetails.feedback && (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Evaluator Feedback:</strong> {submissionDetails.feedback}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted Date:</span>
                  <span className="font-medium">{formatDate(submissionDetails.submitted_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <Badge variant={getStatusBadgeVariant(submissionDetails.status)}>
                    {submissionDetails.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RFQ Reference:</span>
                  <span className="font-medium">{submissionDetails.rfq_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submission ID:</span>
                  <span className="font-medium">{submissionDetails.submission_reference}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bidders:</span>
                  <span className="font-medium">{submissionDetails.total_bidders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Ranking:</span>
                  <span className="font-medium">
                    {submissionDetails.rank ? `#${submissionDetails.rank}` : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evaluation Score:</span>
                  <span className="font-medium">
                    {submissionDetails.evaluation_score ? `${submissionDetails.evaluation_score}/100` : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bid Amount:</span>
                  <span className="font-medium">{formatCurrency(submissionDetails.bid_amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{submissionDetails.technical_proposal}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{submissionDetails.financial_proposal}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{submissionDetails.implementation_timeline}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{submissionDetails.team_composition}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Breakdown</CardTitle>
              <CardDescription>
                Detailed scoring based on evaluation criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionDetails.evaluation_criteria.length > 0 ? (
                <div className="space-y-4">
                  {submissionDetails.evaluation_criteria.map((criteria, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{criteria.name}</span>
                        <span className="text-sm text-gray-600">
                          {criteria.score}/100 (Weight: {criteria.weight}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${criteria.score}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Weighted Score: {criteria.weighted_score}/100
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Score:</span>
                      <span className="font-semibold text-lg text-blue-600">
                        {submissionDetails.evaluation_score}/100
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Evaluation not yet started.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <CardDescription>
                All documents included with your submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionDetails.documents.length > 0 ? (
                <div className="space-y-3">
                  {submissionDetails.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.size} • Uploaded {formatDate(doc.uploaded_date)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Timeline</CardTitle>
              <CardDescription>
                Track the progress of your submission through the evaluation process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissionDetails.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      event.status === 'completed' ? 'bg-green-100 text-green-600' :
                      event.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {event.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                       event.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
                       <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.event}</p>
                      {event.date && (
                        <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}