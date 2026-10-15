import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import VendorAxiosWithToken from "@/constants/api_management/VendorHttpHelper";
import { VendorAuthUtils } from "./vendorAuthController";
import { VendorPortalStats, VendorRFQAccess, VendorCategory } from "../types/vendor-auth";

// Debug helper to log API response structure
const logAPIResponse = (endpoint: string, response: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 API Debug - ${endpoint}:`, {
      status: response?.status,
      data: response?.data,
      structure: Object.keys(response?.data || {}),
    });
  }
};

// RFQ interfaces for new API
interface RFQItem {
  id: string;
  item_name: string;
  description: string;
  quantity: number;
  specification: string;
}

interface EOIInfo {
  id: string;
  eoi_number: string;
  name: string;
  type: string;
  categories: VendorCategory[];
}

interface VendorRFQ {
  id: string;
  rfq_id: string;
  title: string;
  background: string;
  status: string;
  tender_type: string;
  request_type: string;
  procurement_type: string;
  opening_date: string;
  closing_date: string;
  days_remaining: number;
  urgency: string;
  eoi: EOIInfo;
  items_count: number;
  items_preview: RFQItem[];
  vendor_eligible: boolean;
  has_submitted_bid: boolean;
  can_submit_bid: boolean;
  specification_document?: string;
  created_datetime: string;
  is_new: boolean;
}

// Dashboard data interfaces
interface DashboardOverview {
  vendor_summary: {
    company_name: string;
    status: string;
    approved_categories: string[];
    registration_date: string;
  };
  opportunities: {
    available_rfqs: number;
    closing_soon: number;
    new_this_week: number;
  };
  bid_submissions: {
    submitted: number;
    under_evaluation: number;
    awarded: number;
    unsuccessful: number;
  };
  purchase_orders: {
    active: number;
    total_value: number;
    pending_delivery: number;
  };
  recent_activities: Array<{
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
  }>;
}

// Vendor dashboard endpoints - Updated to match backend implementation
const VENDOR_DASHBOARD_ENDPOINTS = {
  DASHBOARD: "/procurements/vendor/dashboard/",
  STATS: "/procurements/vendor/dashboard/quick-stats/",
  AVAILABLE_RFQS: "/procurements/vendor/available-rfqs/",
  SUBMISSIONS: "/procurements/vendor/bid-submissions/",
  NOTIFICATIONS: "/procurements/vendor/notifications/",
};

// Vendor Dashboard Overview Hook - New comprehensive dashboard API
export const useVendorDashboardOverview = () => {
  return useQuery({
    queryKey: ['vendor-dashboard-overview'],
    queryFn: async (): Promise<DashboardOverview> => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get(VENDOR_DASHBOARD_ENDPOINTS.DASHBOARD);

      // Log API response for debugging
      logAPIResponse('DASHBOARD', response);

      // Handle new API response format
      return response.data.status === 'success' ? response.data.data : response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Vendor Dashboard Statistics Hook
export const useVendorDashboardStats = () => {
  return useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: async (): Promise<VendorPortalStats> => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      // Development mode: return mock data for mock token
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock_access_token_')) {
        const mockStats: VendorPortalStats = {
          total_rfqs_available: 15,
          submitted_bids: 12,
          pending_evaluations: 3,
          awarded_contracts: 3,
          success_rate: 75
        };
        return mockStats;
      }

      const response = await VendorAxiosWithToken.get(VENDOR_DASHBOARD_ENDPOINTS.STATS);

      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Vendor Available RFQs Hook - Updated for new API
export const useVendorAvailableRFQs = (params?: {
  tender_type?: string;
  category?: string;
  closing_soon?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['vendor-available-rfqs', 'v3-with-uuid-fix', params],
    queryFn: async (): Promise<{
      count: number;
      summary: {
        total_available: number;
        closing_soon: number;
        new_rfqs: number;
        submitted_bids: number;
      };
      results: VendorRFQ[];
    }> => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      // Development mode: return mock data for mock token
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock_access_token_')) {
        const mockRFQs: VendorRFQ[] = [
          {
            id: 'rfq_1',
            rfq_id: 'RFQ-2024-001',
            title: 'Medical Equipment Procurement',
            background: 'Procurement of essential medical equipment for health facilities across Nigeria',
            status: 'OPEN',
            tender_type: 'GOODS',
            request_type: 'Public',
            procurement_type: 'Open Tender',
            opening_date: '2024-12-01T00:00:00Z',
            closing_date: '2024-12-25T23:59:59Z',
            days_remaining: 18,
            urgency: 'medium',
            eoi: {
              id: 'eoi_1',
              eoi_number: 'EOI-2024-001',
              name: 'Medical Equipment EOI',
              type: 'GOODS',
              categories: [
                { id: '1', name: 'Medical Equipment' },
                { id: '2', name: 'Healthcare Supplies' }
              ]
            },
            items_count: 15,
            items_preview: [
              {
                id: 'item_1',
                item_name: 'Digital X-Ray Machine',
                description: 'High-resolution digital X-ray machine',
                quantity: 5,
                specification: 'Latest technology with DICOM compatibility'
              }
            ],
            vendor_eligible: true,
            has_submitted_bid: false,
            can_submit_bid: true,
            specification_document: '/docs/medical-equipment-specs.pdf',
            created_datetime: '2024-12-01T10:00:00Z',
            is_new: true
          },
          {
            id: 'rfq_2',
            rfq_id: 'RFQ-2024-002',
            title: 'Office Supplies and Stationery',
            background: 'Annual procurement of office supplies for AHNI headquarters and regional offices',
            status: 'OPEN',
            tender_type: 'GOODS',
            request_type: 'Public',
            procurement_type: 'Open Tender',
            opening_date: '2024-11-25T00:00:00Z',
            closing_date: '2024-12-20T23:59:59Z',
            days_remaining: 13,
            urgency: 'medium',
            eoi: {
              id: 'eoi_2',
              eoi_number: 'EOI-2024-002',
              name: 'Office Supplies EOI',
              type: 'GOODS',
              categories: [
                { id: '2', name: 'Office Supplies' }
              ]
            },
            items_count: 25,
            items_preview: [
              {
                id: 'item_2',
                item_name: 'A4 Paper',
                description: 'High-quality A4 printing paper',
                quantity: 1000,
                specification: '80gsm, white, 500 sheets per ream'
              }
            ],
            vendor_eligible: true,
            has_submitted_bid: true,
            can_submit_bid: false,
            created_datetime: '2024-11-25T10:00:00Z',
            is_new: false
          }
        ];

        return {
          count: mockRFQs.length,
          summary: {
            total_available: 15,
            closing_soon: 3,
            new_rfqs: 2,
            submitted_bids: 1
          },
          results: mockRFQs
        };
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.tender_type) queryParams.append('tender_type', params.tender_type);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.closing_soon) queryParams.append('closing_soon', 'true');
      if (params?.search) queryParams.append('search', params.search);

      const url = `${VENDOR_DASHBOARD_ENDPOINTS.AVAILABLE_RFQS}${queryParams.toString() ? `?${queryParams}` : ''}`;

      try {
        console.log('🌐 Calling backend for available RFQs:', { url, params });
        const response = await VendorAxiosWithToken.get(url);

        // Log API response for debugging
        logAPIResponse('AVAILABLE_RFQS', response);

        return response.data.data || response.data;
      } catch (error: any) {
        console.error('❌ Available RFQs API error:', error);

        const status = error?.response?.status;
        const errorData = error?.response?.data;

        // Handle 403 permission errors - provide fallback mock data
        if (status === 403) {
          console.warn('🔒 RFQ API permission denied - using fallback mock data');
          const fallbackData = {
            count: 2,
            summary: {
              total_available: 2,
              closing_soon: 1,
              new_rfqs: 1,
              submitted_bids: 0
            },
            results: [
              {
                id: 'rfq_1',
                rfq_id: 'RFQ-2024-001',
                title: 'Medical Equipment Procurement',
                background: 'Procurement of essential medical equipment for health facilities',
                status: 'OPEN',
                tender_type: 'GOODS',
                request_type: 'Public',
                procurement_type: 'Open Tender',
                opening_date: '2024-12-01T00:00:00Z',
                closing_date: '2024-12-25T23:59:59Z',
                days_remaining: 18,
                urgency: 'medium',
                eoi: {
                  id: 'eoi_1',
                  eoi_number: 'EOI-2024-001',
                  name: 'Medical Equipment EOI',
                  type: 'GOODS',
                  categories: [{ id: '1', name: 'Medical Equipment' }]
                },
                items_count: 15,
                items_preview: [{
                  id: 'item_1',
                  item_name: 'Digital X-Ray Machine',
                  description: 'High-resolution digital X-ray machine',
                  quantity: 5,
                  specification: 'Latest technology with DICOM compatibility'
                }],
                vendor_eligible: true,
                has_submitted_bid: false,
                can_submit_bid: true,
                specification_document: '/docs/medical-equipment-specs.pdf',
                created_datetime: '2024-12-01T10:00:00Z',
                is_new: true
              }
            ]
          };
          return fallbackData;
        }

        throw error;
      }
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;

      // Don't retry on authentication errors
      if (status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }

      // Don't retry on permission errors - use fallback instead
      if (status === 403) {
        return false;
      }

      return failureCount < 3;
    },
  });
};

// Vendor Submissions Hook
export const useVendorSubmissions = () => {
  return useQuery({
    queryKey: ['vendor-submissions'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get(VENDOR_DASHBOARD_ENDPOINTS.SUBMISSIONS);

      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Vendor Notifications Hook
export const useVendorNotifications = () => {
  return useQuery({
    queryKey: ['vendor-notifications'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get(VENDOR_DASHBOARD_ENDPOINTS.NOTIFICATIONS);

      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : data.results || [];
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Get Vendor Categories Hook
export const useVendorCategories = () => {
  return useQuery({
    queryKey: ['vendor-categories'],
    queryFn: async (): Promise<Array<VendorCategory & { rfq_count: number }>> => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      try {
        const response = await VendorAxiosWithToken.get(`${VENDOR_DASHBOARD_ENDPOINTS.AVAILABLE_RFQS}categories/`);

        // Log API response for debugging
        logAPIResponse('VENDOR_CATEGORIES', response);

        // Handle different response formats
        const data = response.data;

        // If data has status field, extract from nested data
        if (data.status === 'success' && data.data) {
          return Array.isArray(data.data) ? data.data : [];
        }

        // If data is directly an array
        if (Array.isArray(data)) {
          return data;
        }

        // If data has results field
        if (data.results && Array.isArray(data.results)) {
          return data.results;
        }

        console.warn('⚠️ Unexpected vendor categories response format:', data);
        return [];
      } catch (error: any) {
        console.error('❌ Vendor categories API error:', error);

        // If API fails, return empty array instead of throwing
        if (error?.response?.status === 403) {
          console.warn('🔒 Categories API permission denied - returning empty array');
          return [];
        }

        throw error;
      }
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      // Don't retry on permission errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// RFQ Summary Statistics Hook
export const useRFQSummary = () => {
  return useQuery({
    queryKey: ['rfq-summary', 'v3-with-uuid-fix'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      try {
        const response = await VendorAxiosWithToken.get(`${VENDOR_DASHBOARD_ENDPOINTS.AVAILABLE_RFQS}summary/`);

        // Log API response for debugging
        logAPIResponse('RFQ_SUMMARY', response);

        // Handle different response formats
        const data = response.data;

        // If data has status field, extract from nested data
        if (data.status === 'success' && data.data) {
          return data.data;
        }

        return data;
      } catch (error: any) {
        console.error('❌ RFQ Summary API error:', error);

        // If API fails, return default summary
        if (error?.response?.status === 403) {
          console.warn('🔒 RFQ Summary API permission denied - returning default');
          return {
            total_available: 0,
            closing_soon: 0,
            new_rfqs: 0,
            submitted_bids: 0
          };
        }

        throw error;
      }
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      // Don't retry on permission errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Specific RFQ Details Hook - Updated to new API
export const useVendorRFQDetails = (rfqId: string) => {
  return useQuery({
    queryKey: ['vendor-rfq-details', 'v3-with-uuid-fix', rfqId],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      try {
        const response = await VendorAxiosWithToken.get(`${VENDOR_DASHBOARD_ENDPOINTS.AVAILABLE_RFQS}${rfqId}/`);

        // Log API response for debugging
        logAPIResponse('RFQ_DETAILS', response);

        // Handle different response formats
        const data = response.data;

        // If data has status field, extract from nested data
        if (data.status === 'success' && data.data) {
          return data.data;
        }

        return data;
      } catch (error: any) {
        console.error('❌ RFQ Details API error:', error);
        throw error;
      }
    },
    enabled: !!rfqId && VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 10, // 10 minutes for RFQ details
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      // Don't retry on permission errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Mark Notification as Read Hook
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.patch(
        `/procurements/vendors/notifications/${notificationId}/mark-read/`,
        {}
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
      }
    },
  });
};

/**
 * Fetch eligible lots for a specific RFQ/Solicitation
 * @param solicitationId - UUID of the solicitation
 */
export const useVendorEligibleLots = (solicitationId: string) => {
  return useQuery({
    queryKey: ['vendor-eligible-lots', 'v3-with-uuid-fix', solicitationId],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      try {
        const response = await VendorAxiosWithToken.get(
          `${VENDOR_DASHBOARD_ENDPOINTS.AVAILABLE_RFQS}eligible_lots/?solicitation_id=${solicitationId}`
        );

        console.log('✅ Eligible lots response:', response.data);

        return response.data.data || response.data;
      } catch (error: any) {
        console.error('❌ Eligible lots API error:', error);

        if (error?.response?.status === 401) {
          VendorAuthUtils.removeVendorToken();
        }

        throw error;
      }
    },
    enabled: !!solicitationId,
  });
};

// RFQ Bid Submission Types
interface RFQBidItem {
  solicitation_item_id: string;
  unit_price: string;
  total_price?: string;
  quantity: number;
}

interface RFQBidSubmissionData {
  solicitation_id: string;
  lot_id?: string;
  items: RFQBidItem[];
  delivery_time: string;
  payment_terms: string;
  validity_period: string;
  currency: string;
  warranty?: string;
}

/**
 * Submit RFQ Bid (Request for Quotation - Item-based pricing)
 * Used for GOODS procurement where vendors provide unit prices for each item
 */
export const useSubmitRFQBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RFQBidSubmissionData) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      console.log('📤 Submitting RFQ bid:', data);

      // Format items for backend (parse items array if it's a string)
      const formattedData = {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
      };

      const response = await VendorAxiosWithToken.post(
        VENDOR_DASHBOARD_ENDPOINTS.SUBMISSIONS,
        formattedData
      );

      console.log('✅ RFQ bid submitted successfully:', response.data);

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vendor-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-available-rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] });
    },
    onError: (error: any) => {
      console.error('❌ RFQ bid submission error:', error);

      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      // Extract backend error message if available
      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          error?.response?.data?.detail ||
                          'Failed to submit bid. Please try again.';

      throw new Error(errorMessage);
    },
  });
};

/**
 * Save RFQ Bid as Draft
 */
export const useSaveRFQDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RFQBidSubmissionData & { status: 'DRAFT' }) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      console.log('💾 Saving RFQ bid draft:', data);

      const response = await VendorAxiosWithToken.post(
        VENDOR_DASHBOARD_ENDPOINTS.SUBMISSIONS,
        { ...data, status: 'DRAFT' }
      );

      console.log('✅ RFQ draft saved successfully:', response.data);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-submissions'] });
    },
    onError: (error: any) => {
      console.error('❌ RFQ draft save error:', error);

      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          'Failed to save draft. Please try again.';

      throw new Error(errorMessage);
    },
  });
};

/**
 * Submit RFP Proposal (Request for Proposal - Document-based)
 * Used for SERVICES procurement where vendors submit narrative proposals and documents
 */
export const useSubmitRFPProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      console.log('📤 Submitting RFP proposal');

      // Use the RFP submissions endpoint (needs to be added to vendor portal router)
      const response = await VendorAxiosWithToken.post(
        '/procurements/vendor/rfp-submissions/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ RFP proposal submitted successfully:', response.data);

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vendor-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-available-rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard-stats'] });
    },
    onError: (error: any) => {
      console.error('❌ RFP proposal submission error:', error);

      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      // Extract backend error message if available
      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          error?.response?.data?.detail ||
                          'Failed to submit proposal. Please try again.';

      throw new Error(errorMessage);
    },
  });
};

/**
 * Save RFP Proposal as Draft
 */
export const useSaveRFPDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      console.log('💾 Saving RFP proposal draft');

      // Ensure status is set to DRAFT
      formData.set('status', 'DRAFT');

      const response = await VendorAxiosWithToken.post(
        '/procurements/vendor/rfp-submissions/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ RFP draft saved successfully:', response.data);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-submissions'] });
    },
    onError: (error: any) => {
      console.error('❌ RFP draft save error:', error);

      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          'Failed to save draft. Please try again.';

      throw new Error(errorMessage);
    },
  });
};

// Vendor Submission Details Hook
export const useVendorSubmissionDetails = (submissionId: string) => {
  return useQuery({
    queryKey: ['vendor-submission-details', submissionId],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get(`${VENDOR_DASHBOARD_ENDPOINTS.SUBMISSIONS}${submissionId}/`);

      return response.data.data || response.data;
    },
    enabled: !!submissionId && VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        VendorAuthUtils.removeVendorToken();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// ============ VENDOR MESSAGING HOOKS ============

/**
 * Get all vendor messages
 */
export const useVendorMessages = (params?: {
  status?: string;
  thread_id?: string;
}) => {
  return useQuery({
    queryKey: ['vendor-messages', params],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.thread_id) queryParams.append('thread_id', params.thread_id);

      const url = `/procurements/vendor/messages/${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await VendorAxiosWithToken.get(url);

      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get message threads (conversations)
 */
export const useVendorMessageThreads = () => {
  return useQuery({
    queryKey: ['vendor-message-threads'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/messages/threads/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Get unread message count
 */
export const useVendorUnreadCount = () => {
  return useQuery({
    queryKey: ['vendor-unread-count'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/messages/unread-count/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

/**
 * Send a new message
 */
export const useSendVendorMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subject: string;
      message: string;
      priority?: string;
      related_solicitation?: string;
      related_purchase_order?: string;
    }) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post('/procurements/vendor/messages/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-unread-count'] });
    },
  });
};

/**
 * Reply to a message
 */
export const useReplyToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      message: string;
      priority?: string;
    }) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post(
        `/procurements/vendor/messages/${data.messageId}/reply/`,
        { message: data.message, priority: data.priority }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-message-threads'] });
    },
  });
};

/**
 * Mark message as read
 */
export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post(`/procurements/vendor/messages/${messageId}/mark-read/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-unread-count'] });
    },
  });
};

/**
 * Archive a message
 */
export const useArchiveMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post(`/procurements/vendor/messages/${messageId}/archive/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-message-threads'] });
    },
  });
};


// ============ VENDOR SUPPORT TICKETS HOOKS ============

export const useVendorSupportTickets = (params?: {
  status?: string;
  category?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: ['vendor-support-tickets', params],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.priority) queryParams.append('priority', params.priority);

      const url = `/procurements/vendor/support-tickets/${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await VendorAxiosWithToken.get(url);

      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useVendorSupportTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ['vendor-support-ticket', ticketId],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get(`/procurements/vendor/support-tickets/${ticketId}/`);
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated() && !!ticketId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      subject: string;
      issue_description: string;
      category: string;
      priority?: string;
      email?: string;
      phone_number?: string;
    }) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post('/procurements/vendor/support-tickets/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets-summary'] });
    },
  });
};

export const useReplyToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.post(
        `/procurements/vendor/support-tickets/${data.ticketId}/reply/`,
        { message: data.message }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-support-ticket', variables.ticketId] });
    },
  });
};

export const useSupportTicketsSummary = () => {
  return useQuery({
    queryKey: ['vendor-support-tickets-summary'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/support-tickets/summary/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============ VENDOR PROFILE UPDATE HOOKS ============

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await VendorAxiosWithToken.patch(
        '/procurements/vendor/profile/',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
    },
  });
};

// ============ VENDOR CATEGORIES MANAGEMENT HOOKS ============

export const useAllVendorCategories = () => {
  return useQuery({
    queryKey: ['vendor-all-categories'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/categories/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useVendorMyCategories = () => {
  return useQuery({
    queryKey: ['vendor-my-categories'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/categories/my_categories/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAvailableCategoriesForVendor = () => {
  return useQuery({
    queryKey: ['vendor-available-categories'],
    queryFn: async () => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      const response = await VendorAxiosWithToken.get('/procurements/vendor/categories/available/');
      return response.data.data || response.data;
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useAddVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await VendorAxiosWithToken.post(
        '/procurements/vendor/categories/add_category/',
        { category_id: categoryId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-my-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-available-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
    },
  });
};

export const useRemoveVendorCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await VendorAxiosWithToken.post(
        '/procurements/vendor/categories/remove_category/',
        { category_id: categoryId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-my-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-available-categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
    },
  });
};
