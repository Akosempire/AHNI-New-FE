import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import VendorAxiosWithToken from "@/constants/api_management/VendorHttpHelper";
import AxiosWithoutToken from "@/constants/api_management/MyHttpHelper";
import { VendorLoginCredentials, VendorAuthResponse, VendorPortalUser } from "../types/vendor-auth";

// Vendor authentication endpoints - Updated to match backend implementation
const VENDOR_AUTH_ENDPOINTS = {
  LOGIN: "/procurements/vendor/auth/login/",
  PROFILE: "/procurements/vendor/auth/profile/",
  REFRESH: "/procurements/vendor/auth/refresh/",
  LOGOUT: "/procurements/vendor/auth/logout/",
};

// Vendor Portal Authentication Utilities
export const VendorAuthUtils = {
  getVendorToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vendor_access_token');
    }
    return null;
  },

  setVendorToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vendor_access_token', token);
    }
  },

  removeVendorToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vendor_access_token');
      localStorage.removeItem('vendor_user');
    }
  },

  getVendorUser: (): VendorPortalUser | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('vendor_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setVendorUser: (user: VendorPortalUser): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vendor_user', JSON.stringify(user));
    }
  },

  isVendorAuthenticated: (): boolean => {
    return !!VendorAuthUtils.getVendorToken();
  },

  getVendorData: (): any => {
    // Return user data from localStorage for display purposes
    const user = VendorAuthUtils.getVendorUser();
    return user || { company_name: 'Vendor Company', email: 'vendor@company.com' };
  },
};

// Vendor Login Hook
export const useVendorLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: VendorLoginCredentials): Promise<VendorAuthResponse> => {
      // Development mode: allow mock login for demo purposes only
      if (process.env.NODE_ENV === 'development' && credentials.email === 'test@vendor.com' && credentials.password === 'test123') {
        // Mock successful login response for demo/testing
        return {
          status: 'success',
          message: 'Login successful (Mock)',
          data: {
            access_token: 'mock_access_token_' + Date.now(),
            refresh_token: 'mock_refresh_token_' + Date.now(),
            user: {
              id: 'mock_user_id',
              email: 'test@vendor.com',
              vendor: {
                id: 'mock_vendor_id',
                company_name: 'Test Vendor Company (Demo)',
                status: 'Approved' as const,
                is_active: true,
                approved_categories: [
                  { id: '1', name: 'Information Technology' },
                  { id: '2', name: 'Office Supplies' },
                  { id: '3', name: 'Consulting Services' }
                ]
              }
            }
          }
        };
      }

      // All other credentials use real API
      try {
        const response = await AxiosWithoutToken.post(VENDOR_AUTH_ENDPOINTS.LOGIN, credentials);
        return response.data;
      } catch (error: any) {
        // If backend credentials are invalid, provide helpful error message
        if (error?.response?.status === 401) {
          throw new Error('Invalid credentials. For live backend access, please contact procurement@ahni.org for valid vendor credentials.');
        }
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('🎉 Vendor Login Success - Raw Data:', data);

      // Handle new API response format
      const responseData = data.status === 'success' ? data.data : data;

      console.log('🔧 Processing vendor auth data:', {
        hasAccessToken: !!responseData.access_token,
        hasVendorData: !!responseData.user?.vendor,
        vendorData: responseData.user?.vendor,
        fullResponseData: responseData
      });

      // Store token
      VendorAuthUtils.setVendorToken(responseData.access_token);
      console.log('✅ Vendor token stored:', !!VendorAuthUtils.getVendorToken());

      // Store vendor user info from the nested structure
      if (responseData.user?.vendor) {
        VendorAuthUtils.setVendorUser(responseData.user.vendor as VendorPortalUser);
        console.log('✅ Vendor user data stored:', VendorAuthUtils.getVendorUser());
      } else {
        console.log('⚠️ No vendor data found in response');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-rfqs'] });

      console.log('🚀 Vendor login setup complete - ready for redirect to /vendor-portal/dashboard');
    },
    onError: (error: any) => {
      console.error('Vendor login error:', error);
      VendorAuthUtils.removeVendorToken();
    }
  });
};

// Vendor Profile Hook
export const useVendorProfile = () => {
  return useQuery({
    queryKey: ['vendor-profile'],
    queryFn: async (): Promise<VendorPortalUser> => {
      const token = VendorAuthUtils.getVendorToken();
      if (!token) {
        throw new Error('No vendor token found');
      }

      console.log('🔍 Vendor Profile Debug:', {
        tokenExists: !!token,
        tokenPrefix: token?.substring(0, 20) + '...',
        nodeEnv: process.env.NODE_ENV
      });

      // Development mode: return mock data for mock token
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock_access_token_')) {
        console.log('✅ Using mock vendor profile for demo account');
        const mockProfile: VendorPortalUser = {
          id: 'mock_vendor_id',
          company_name: 'Test Vendor Company',
          email: 'test@vendor.com',
          phone_number: '+1 234 567 8900',
          status: 'Approved' as const,
          is_active: true,
          approved_categories: [
            { id: '1', name: 'Information Technology' },
            { id: '2', name: 'Office Supplies' },
            { id: '3', name: 'Consulting Services' }
          ],
          submitted_categories: [
            { id: '1', name: 'Information Technology' },
            { id: '2', name: 'Office Supplies' },
            { id: '3', name: 'Consulting Services' }
          ],
          type_of_business: 'Limited Liability Company',
          registration_date: '2023-01-15T10:00:00Z',
          last_login: new Date().toISOString(),
          active_rfqs: ['rfq_1', 'rfq_2'],
          submitted_bids: 12,
          awarded_contracts: 3,
          prequalification_summary: {
            total_categories_applied: 5,
            categories_approved: 3,
            categories_rejected: 1,
            approval_rate: 75
          }
        };
        VendorAuthUtils.setVendorUser(mockProfile);
        return mockProfile;
      }

      try {
        console.log('🌐 Calling real backend for vendor profile...');
        const response = await VendorAxiosWithToken.get(VENDOR_AUTH_ENDPOINTS.PROFILE);

        console.log('📡 Profile API Response:', response.data);

        // Handle new API response format
        const responseData = response.data;
        // Backend returns vendor data directly in data, not nested under data.vendor
        const vendorUser = responseData.status === 'success' ? responseData.data : responseData.data || responseData;

        if (!vendorUser) {
          throw new Error('No vendor data found in response');
        }

        VendorAuthUtils.setVendorUser(vendorUser);
        console.log('✅ Vendor profile loaded successfully:', vendorUser);
        return vendorUser;
      } catch (error: any) {
        console.error('❌ Vendor profile API error:', error);

        const status = error?.response?.status;
        const errorData = error?.response?.data;

        // Handle 403 permission errors - create fallback profile from login data
        if (status === 403) {
          console.warn('🔒 Profile API permission denied - using fallback profile from login data');

          // Get user data from login response if available
          const storedUser = VendorAuthUtils.getVendorUser();
          if (storedUser) {
            console.log('✅ Using stored vendor profile as fallback for 403 error');
            return storedUser;
          }

          // Create minimal profile from error context if no stored data
          const fallbackProfile: VendorPortalUser = {
            id: 'fallback_vendor_id',
            company_name: 'Vendor Company',
            email: 'vendor@company.com',
            phone_number: '',
            status: 'Pending' as const,
            is_active: true,
            approved_categories: [],
            submitted_categories: [],
            type_of_business: 'Company',
            registration_date: new Date().toISOString(),
            last_login: new Date().toISOString(),
            active_rfqs: [],
            submitted_bids: 0,
            awarded_contracts: 0,
            prequalification_summary: {
              total_categories_applied: 0,
              categories_approved: 0,
              categories_rejected: 0,
              approval_rate: 0
            }
          };

          console.log('⚠️ Using minimal fallback profile due to permission error');
          VendorAuthUtils.setVendorUser(fallbackProfile);
          return fallbackProfile;
        }

        // For other errors, try stored user data
        const storedUser = VendorAuthUtils.getVendorUser();
        if (storedUser && status !== 401) {
          console.log('🔄 Using stored vendor profile as fallback');
          return storedUser;
        }

        throw error;
      }
    },
    enabled: VendorAuthUtils.isVendorAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;

      // Don't retry on authentication or permission errors
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

// Vendor Logout Hook
export const useVendorLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const token = VendorAuthUtils.getVendorToken();
      if (token) {
        try {
          await VendorAxiosWithToken.post(VENDOR_AUTH_ENDPOINTS.LOGOUT, {});
        } catch (error) {
          console.warn('Logout API call failed, proceeding with local cleanup:', error);
        }
      }
    },
    onSettled: () => {
      // Always clear local storage and queries, regardless of API success
      VendorAuthUtils.removeVendorToken();
      queryClient.clear();
    },
  });
};

// Check if vendor is eligible for RFQ
export const useVendorRFQEligibility = (rfqId: string) => {
  return useQuery({
    queryKey: ['vendor-rfq-eligibility', rfqId],
    queryFn: async () => {
      const response = await VendorAxiosWithToken.get(`/procurements/rfq/${rfqId}/vendor-eligibility/`);
      return response.data;
    },
    enabled: !!rfqId && VendorAuthUtils.isVendorAuthenticated(),
  });
};