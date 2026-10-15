"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Star,
  AlertTriangle
} from "lucide-react";
import { VendorAuthUtils, useVendorProfile } from "@/features/vendor-portal/controllers/vendorAuthController";
import { useVendorDashboardStats, useVendorAvailableRFQs, useVendorDashboardOverview } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { useVendorOrderSummary, useVendorPurchaseOrders, useVendorGRNs, POGRNUtils } from "@/features/vendor-portal/controllers/purchaseOrderController";
import VendorNotifications from "@/features/vendor-portal/components/VendorNotifications";
import { LoadingSpinner } from "@/components/Loading";

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data: vendorProfile, isLoading: profileLoading, error: profileError } = useVendorProfile();
  const { data: dashboardStats, isLoading: statsLoading } = useVendorDashboardStats();
  const { data: rfqsData, isLoading: rfqsLoading } = useVendorAvailableRFQs();
  const availableRFQs = rfqsData?.results || [];

  // PO and GRN data
  const { data: orderSummary, isLoading: orderSummaryLoading } = useVendorOrderSummary();
  const { data: recentPOs, isLoading: recentPOsLoading } = useVendorPurchaseOrders();
  const { data: recentGRNs, isLoading: recentGRNsLoading } = useVendorGRNs();

  useEffect(() => {
    // Small delay to allow token storage after login before checking auth
    const checkAuth = setTimeout(() => {
      if (!VendorAuthUtils.isVendorAuthenticated()) {
        console.log('🔒 Dashboard: No vendor token found, redirecting to login');
        router.push('/vendor-portal/login');
      } else {
        console.log('✅ Dashboard: Vendor authenticated, proceeding to load dashboard');
      }
    }, 200);

    return () => clearTimeout(checkAuth);
  }, [router]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (profileError || !vendorProfile) {
    const isPermissionError = profileError?.response?.status === 403;

    return (
      <Alert variant={isPermissionError ? "default" : "destructive"} className={isPermissionError ? "border-orange-200 bg-orange-50" : ""}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {isPermissionError ? (
            <>
              <strong>Limited Access:</strong> Your vendor account has limited profile access.
              You can still browse RFQs and manage orders, but some profile features may be restricted.
              Contact support at procurement@ahni.org if you need full access.
            </>
          ) : (
            "Failed to load vendor profile. Please try refreshing the page or contact support if the issue persists."
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      case 'SUSPENDED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {vendorProfile.company_name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your RFQ submissions and track your performance
          </p>
        </div>
        <Badge variant={getStatusBadgeVariant(vendorProfile.status)} className="text-sm">
          {vendorProfile.status}
        </Badge>
      </div>

      {/* Status Alert for non-approved vendors */}
      {vendorProfile.status.toUpperCase() !== 'APPROVED' && (
        <Alert className={vendorProfile.status.toUpperCase() === 'REJECTED' ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {vendorProfile.status.toUpperCase() === 'PENDING' && (
              "Your vendor registration is under review. You'll be notified once approved to access RFQs."
            )}
            {vendorProfile.status.toUpperCase() === 'REJECTED' && (
              "Your vendor registration was not approved. Contact support for more information."
            )}
            {vendorProfile.status.toUpperCase() === 'SUSPENDED' && (
              "Your vendor account is currently suspended. Contact support to resolve this issue."
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : dashboardStats?.total_rfqs_available || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Open for submission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorProfile.submitted_bids}
            </div>
            <p className="text-xs text-muted-foreground">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : dashboardStats?.pending_evaluations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awarded Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorProfile.awarded_contracts}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful bids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderSummaryLoading ? "..." : orderSummary?.active_pos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderSummaryLoading ? "..." : orderSummary ? POGRNUtils.formatCurrency(orderSummary.total_value) : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Available RFQs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available RFQs</CardTitle>
              <CardDescription>
                New procurement opportunities you can bid on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rfqsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2">Loading RFQs...</span>
                </div>
              ) : availableRFQs && availableRFQs.length > 0 ? (
                <div className="space-y-4">
                  {availableRFQs.slice(0, 3).map((rfq: any) => (
                    <div
                      key={rfq.rfq_id || rfq.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/vendor-portal/rfqs/${rfq.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {rfq.title || rfq.rfq_title}
                            </h4>
                            {rfq.is_new && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {rfq.background}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Closes: {formatDate(rfq.closing_date)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rfq.days_remaining <= 3 ? 'bg-red-100 text-red-800' :
                              rfq.days_remaining <= 7 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rfq.days_remaining} days left
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rfq.eoi?.categories?.slice(0, 3).map((category: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {typeof category === 'string' ? category : category.name}
                              </Badge>
                            ))}
                          </div>
                          {rfq.items_count && (
                            <div className="text-xs text-gray-500 mt-1">
                              {rfq.items_count} items • {rfq.tender_type}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col gap-2 items-end">
                          <Badge
                            variant={rfq.vendor_eligible ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rfq.vendor_eligible ? 'Eligible' : 'Review Needed'}
                          </Badge>
                          {rfq.has_submitted_bid ? (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Bid Submitted
                            </Badge>
                          ) : rfq.can_submit_bid ? (
                            <Badge variant="default" className="text-xs bg-green-50 text-green-700">
                              Can Bid
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/vendor-portal/rfqs')}
                    >
                      View All RFQs
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No RFQs available at the moment</p>
                  <p className="text-sm">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchase Orders */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>
                Latest orders issued to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPOsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2">Loading orders...</span>
                </div>
              ) : recentPOs && recentPOs.length > 0 ? (
                <div className="space-y-4">
                  {recentPOs.slice(0, 3).map((po: any) => {
                    const completionPercentage = POGRNUtils.calculateCompletionPercentage(po);
                    const isOverdue = POGRNUtils.isPOOverdue(po);

                    return (
                      <div key={po.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                           onClick={() => router.push(`/vendor-portal/purchase-orders/${po.id}`)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {po.po_number}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {formatDate(po.delivery_date)}
                              </span>
                              {isOverdue && (
                                <span className="flex items-center gap-1 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  Overdue
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Value: {POGRNUtils.formatCurrency(po.total_amount)}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Badge variant={POGRNUtils.getPOStatusBadgeVariant(po.status)} className="text-xs">
                              {POGRNUtils.getPOStatusDisplayName(po.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{completionPercentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/vendor-portal/purchase-orders')}
                    >
                      View All Orders
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No purchase orders yet</p>
                  <p className="text-sm">Orders will appear here when issued</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent GRNs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent GRNs</CardTitle>
              <CardDescription>
                Goods received notes requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGRNsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2">Loading GRNs...</span>
                </div>
              ) : recentGRNs && recentGRNs.length > 0 ? (
                <div className="space-y-4">
                  {recentGRNs.slice(0, 3).map((grn: any) => {
                    const acceptanceRate = POGRNUtils.calculateGRNAcceptanceRate(grn);
                    const requiresResponse = ['RECEIVED', 'INSPECTED'].includes(grn.status);

                    return (
                      <div key={grn.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                           onClick={() => router.push(`/vendor-portal/grn/${grn.id}`)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {grn.grn_number}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Received: {formatDate(grn.received_date)}
                              </span>
                              {requiresResponse && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  Action Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              PO: {grn.po_number}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Badge variant={POGRNUtils.getGRNStatusBadgeVariant(grn.status)} className="text-xs">
                              {POGRNUtils.getGRNStatusDisplayName(grn.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {acceptanceRate}% accepted
                            </span>
                          </div>
                          {grn.quality_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600">
                                Quality: {grn.quality_rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/vendor-portal/grn')}
                    >
                      View All GRNs
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No goods received notes yet</p>
                  <p className="text-sm">GRNs will appear here when items are received</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Performance and Alert Widgets */}
      {orderSummary && (orderSummary.overdue_deliveries > 0 || orderSummary.pending_deliveries > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orderSummary.overdue_deliveries > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Deliveries
                </CardTitle>
                <CardDescription className="text-red-700">
                  Orders requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800 mb-2">
                  {orderSummary.overdue_deliveries}
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Orders past their delivery date need immediate action
                </p>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-800 hover:bg-red-100"
                  onClick={() => router.push('/vendor-portal/purchase-orders?status=overdue')}
                >
                  View Overdue Orders
                </Button>
              </CardContent>
            </Card>
          )}

          {orderSummary.pending_deliveries > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Deliveries
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Orders awaiting delivery updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800 mb-2">
                  {orderSummary.pending_deliveries}
                </div>
                <p className="text-sm text-orange-700 mb-4">
                  Update delivery status to keep customers informed
                </p>
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-800 hover:bg-orange-100"
                  onClick={() => router.push('/vendor-portal/purchase-orders?status=pending')}
                >
                  Update Deliveries
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vendor Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {dashboardStats?.success_rate !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Your delivery and quality performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {Math.round(dashboardStats.success_rate)}%
                    </div>
                    <p className="text-sm text-gray-600">Bid Success Rate</p>
                  </div>
                  {orderSummary?.average_delivery_rating && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {orderSummary.average_delivery_rating.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Delivery Rating</p>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {vendorProfile.awarded_contracts}
                    </div>
                    <p className="text-sm text-gray-600">Contracts Awarded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                Your vendor information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <p className="text-sm text-gray-900">{vendorProfile.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{vendorProfile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{vendorProfile.phone_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Business Type</label>
                <p className="text-sm text-gray-900">{vendorProfile.type_of_business || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Registration Date</label>
                <p className="text-sm text-gray-900">{formatDate(vendorProfile.registration_date)}</p>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/vendor-portal/profile')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved Categories</CardTitle>
              <CardDescription>
                Areas you're qualified to bid on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorProfile.approved_categories && vendorProfile.approved_categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendorProfile.approved_categories.map((category, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {typeof category === 'string' ? category : category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories approved yet</p>
              )}
            </CardContent>
          </Card>

          {dashboardStats?.success_rate !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Your bidding success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(dashboardStats.success_rate)}%
                  </div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="mt-8">
        <VendorNotifications maxItems={3} />
      </div>
    </div>
  );
}