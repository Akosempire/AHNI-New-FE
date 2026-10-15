"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Lock
} from "lucide-react";
import { useVendorProfile } from "@/features/vendor-portal/controllers/vendorAuthController";
import { useUpdateVendorProfile } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { LoadingSpinner } from "@/components/Loading";
import { useToast } from "@/hooks/use-toast";

export default function VendorBankingPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { data: vendorProfile, isLoading, error } = useVendorProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateVendorProfile();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading banking information...</span>
      </div>
    );
  }

  if (error || !vendorProfile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load vendor profile. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Get banking data from vendor profile
  const bankingData = {
    bank_name: vendorProfile?.bank_name || '',
    account_name: vendorProfile?.account_name || vendorProfile?.company_name || '',
    account_number: vendorProfile?.account_number || '',
    bank_address: vendorProfile?.bank_address || '',
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(bankingData);
  };

  const handleSave = () => {
    updateProfile(formData, {
      onSuccess: (data: any) => {
        toast({
          title: "Success!",
          description: data.message || "Banking details updated successfully",
        });
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to update banking details",
          variant: "destructive",
        });
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    return showAccountNumber ? accountNumber : `****${accountNumber.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banking Information</h1>
          <p className="text-gray-600 mt-1">
            Manage your payment and banking details securely
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bankingData.is_verified ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending Verification
            </Badge>
          )}
          {!isEditing ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Banking Details
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your banking information is encrypted and stored securely. This information is only used for payment processing and will never be shared with unauthorized parties.
        </AlertDescription>
      </Alert>

      {/* Bank Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            Primary bank account for receiving payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name */}
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              {isEditing ? (
                <Select value={formData.bank_name} onValueChange={(value) => setFormData({ ...formData, bank_name: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Bank Nigeria">First Bank Nigeria</SelectItem>
                    <SelectItem value="Access Bank">Access Bank</SelectItem>
                    <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                    <SelectItem value="GTBank">GTBank</SelectItem>
                    <SelectItem value="UBA">UBA</SelectItem>
                    <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
                    <SelectItem value="FCMB">FCMB</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{bankingData.bank_name}</p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <Label htmlFor="account_name">Account Name</Label>
              {isEditing ? (
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{bankingData.account_name}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="account_number">Account Number</Label>
              {isEditing ? (
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="mt-1"
                  type="password"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-900 font-mono">
                    {maskAccountNumber(bankingData.account_number)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="h-6 w-6 p-0"
                  >
                    {showAccountNumber ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Routing Number */}
            <div>
              <Label htmlFor="routing_number">Routing Number / Sort Code</Label>
              {isEditing ? (
                <Input
                  id="routing_number"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-mono">{bankingData.routing_number}</p>
              )}
            </div>

            {/* SWIFT Code */}
            <div>
              <Label htmlFor="swift_code">SWIFT Code (for international transfers)</Label>
              {isEditing ? (
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-mono">{bankingData.swift_code}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Preferred Currency</Label>
              {isEditing ? (
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{bankingData.currency}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tax Information
          </CardTitle>
          <CardDescription>
            Tax identification and payment terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax ID */}
            <div>
              <Label htmlFor="tax_id">Tax Identification Number</Label>
              {isEditing ? (
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-mono">{bankingData.tax_id}</p>
              )}
            </div>

            {/* Payment Terms */}
            <div>
              <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
              {isEditing ? (
                <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="45">45 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{bankingData.payment_terms} Days</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Current status of your banking information verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {bankingData.is_verified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Banking Information Verified</div>
                    <div className="text-sm text-green-700">Your banking details have been verified and are ready for payments</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-900">Verification Pending</div>
                    <div className="text-sm text-yellow-700">Your banking information is being verified. This process typically takes 1-2 business days.</div>
                  </div>
                </>
              )}
            </div>

            {!bankingData.is_verified && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  You can still receive purchase orders, but payment processing will be delayed until verification is complete.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Related banking and payment actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => router.push('/vendor-portal/orders')}>
              View Purchase Orders
            </Button>
            <Button variant="outline" onClick={() => router.push('/vendor-portal/profile/basic')}>
              Update Company Info
            </Button>
            <Button variant="outline" onClick={() => router.push('/vendor-portal/support/contact')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}