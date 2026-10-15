"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X
} from "lucide-react";
import { useVendorProfile, VendorAuthUtils } from "@/features/vendor-portal/controllers/vendorAuthController";
import { useUpdateVendorProfile } from "@/features/vendor-portal/controllers/vendorDashboardController";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/Loading";

export default function VendorBasicProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { data: vendorProfile, isLoading, error } = useVendorProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateVendorProfile();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading profile...</span>
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

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      company_name: vendorProfile.company_name || '',
      email: vendorProfile.email || '',
      phone_number: vendorProfile.phone_number || '',
      type_of_business: vendorProfile.type_of_business || '',
      address: vendorProfile.address || '',
      website: vendorProfile.website || '',
      description: vendorProfile.description || ''
    });
  };

  const handleSave = () => {
    updateProfile(formData, {
      onSuccess: (data: any) => {
        toast({
          title: "Success!",
          description: data.message || "Profile updated successfully",
        });
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.error || error.response?.data?.message || "Failed to update profile",
          variant: "destructive",
        });
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Basic Information</h1>
          <p className="text-gray-600 mt-1">
            Manage your company's basic information and contact details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(vendorProfile.status)} className="text-sm">
            {vendorProfile.status}
          </Badge>
          {!isEditing ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert for non-approved vendors */}
      {vendorProfile.status.toUpperCase() !== 'APPROVED' && (
        <Alert className={vendorProfile.status.toUpperCase() === 'REJECTED' ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {vendorProfile.status.toUpperCase() === 'PENDING' && (
              "Your vendor registration is under review. You'll be notified once approved."
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

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Basic details about your company and business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              {isEditing ? (
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{vendorProfile.company_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{vendorProfile.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{vendorProfile.phone_number || 'Not provided'}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <Label htmlFor="type_of_business">Type of Business</Label>
              {isEditing ? (
                <Input
                  id="type_of_business"
                  value={formData.type_of_business}
                  onChange={(e) => setFormData({ ...formData, type_of_business: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{vendorProfile.type_of_business || 'Not specified'}</p>
              )}
            </div>

            {/* Registration Date */}
            <div>
              <Label>Registration Date</Label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(vendorProfile.registration_date)}</p>
            </div>

            {/* Status */}
            <div>
              <Label>Account Status</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(vendorProfile.status)}>
                  {vendorProfile.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Business Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1"
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{vendorProfile.address || 'Not provided'}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Website</Label>
            {isEditing ? (
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1"
                placeholder="https://www.example.com"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {vendorProfile.website ? (
                  <a href={vendorProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {vendorProfile.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Company Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={4}
                placeholder="Brief description of your company and services..."
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{vendorProfile.description || 'No description provided'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Navigate to other sections of your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => router.push('/vendor-portal/profile/categories')}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Categories</div>
                <div className="text-sm text-gray-600">Manage approved categories</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => router.push('/vendor-portal/profile/banking')}
            >
              <Building2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Banking Details</div>
                <div className="text-sm text-gray-600">Payment information</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-auto p-4"
              onClick={() => router.push('/vendor-portal/profile/certifications')}
            >
              <CheckCircle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Certifications</div>
                <div className="text-sm text-gray-600">Licenses and certificates</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}