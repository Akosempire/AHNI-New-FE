/**
 * Organizational Data Controller
 * Fetches departments, locations, and users for form dropdowns
 */

import { useQuery } from "@tanstack/react-query";
import AxiosWithToken from "@/constants/api_management/MyHttpHelperWithToken";

const ORG_BASE_URL = "/organizational";

export interface Department {
  id: string;
  name: string;
  code?: string;
}

export interface Location {
  id: string;
  name: string;
  state?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position_title?: string | null;
  position_id?: string | null;
  department_name?: string | null;
  department_id?: string | null;
}

export interface Position {
  id: string;
  title: string;
  code?: string;
  level?: string;
}

export interface FCONumber {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/**
 * Get departments list for dropdowns
 */
export const useGetDepartments = (enabled: boolean = true) => {
  return useQuery<Department[]>({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const response = await AxiosWithToken.get(`${ORG_BASE_URL}/quick/departments/`);
      return response.data.data || response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get locations list for dropdowns
 */
export const useGetLocations = (enabled: boolean = true) => {
  return useQuery<Location[]>({
    queryKey: ["locations-list"],
    queryFn: async () => {
      const response = await AxiosWithToken.get(`${ORG_BASE_URL}/quick/locations/`);
      return response.data.data || response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get users list for approver selection
 */
export const useGetUsers = (enabled: boolean = true) => {
  return useQuery<User[]>({
    queryKey: ["users-list"],
    queryFn: async () => {
      const response = await AxiosWithToken.get(`${ORG_BASE_URL}/quick/users/`);
      return response.data.data || response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get positions list for dropdowns
 */
export const useGetPositions = (enabled: boolean = true) => {
  return useQuery<Position[]>({
    queryKey: ["positions-list"],
    queryFn: async () => {
      const response = await AxiosWithToken.get(`${ORG_BASE_URL}/quick/positions/`);
      return response.data.data || response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get FCO numbers list for dropdowns
 */
export const useGetFCONumbers = (enabled: boolean = true) => {
  return useQuery<FCONumber[]>({
    queryKey: ["fco-numbers-list"],
    queryFn: async () => {
      const response = await AxiosWithToken.get(`/finance/fco-numbers/`);
      // Handle different response formats
      if (response.data.data) {
        // If wrapped in { data: {...} }
        if (response.data.data.results) {
          // If paginated { data: { results: [...] } }
          return response.data.data.results;
        }
        // If simple wrapper { data: [...] }
        return response.data.data;
      }
      // If direct response { results: [...] }
      if (response.data.results) {
        return response.data.results;
      }
      // If direct array [...]
      return response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};
