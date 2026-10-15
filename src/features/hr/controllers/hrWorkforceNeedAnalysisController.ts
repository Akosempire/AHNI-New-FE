import useApiManager from "@/constants/mainController";
import { useQuery } from "@tanstack/react-query";
import AxiosWithToken from "@/constants/api_management/MyHttpHelperWithToken";
import { AxiosError } from "axios";
import { WorkforceNeedAnalysis } from "../types/hr-workforce-need-analysis";

// API Response interface
interface ApiResponse<TData = unknown> {
  status: boolean;
  message: string;
  data: TData;
}

// Filter parameters interface
interface WorkforceNeedAnalysisFilterParams {
  search?: string;
  location?: string;
  position?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}

const BASE_URL = "hr/employees/workforce/need-analysis/";

// ===== WORKFORCE NEED ANALYSIS HOOKS =====

// Get Workforce Need Analysis
export const useGetWorkforceNeedAnalysis = ({
  search = "",
  location = "",
  position = "",
  page = 1,
  size = 20,
  enabled = true,
}: WorkforceNeedAnalysisFilterParams = {}) => {
  return useQuery<ApiResponse<WorkforceNeedAnalysis[]>>({
    queryKey: ["workforce-need-analysis", search, location, position, page, size],
    queryFn: async () => {
      try {
        const params = {
          page,
          size,
          ...(search && { search }),
          ...(location && { location }),
          ...(position && { position }),
        };

        console.log('=== API REQUEST DEBUG ===');
        console.log('URL:', BASE_URL);
        console.log('Params:', params);
        console.log('========================');

        const response = await AxiosWithToken.get(BASE_URL, { params });

        console.log('=== API RESPONSE DEBUG ===');
        console.log('Response:', response.data);
        console.log('=========================');

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('=== API ERROR ===');
        console.error('Error:', axiosError);
        console.error('Response:', axiosError.response?.data);
        console.error('=================');
        throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
      }
    },
    enabled: enabled,
    refetchOnWindowFocus: false,
  });
};

// Get Single Workforce Need Analysis
export const useGetWorkforceNeedAnalysisId = (id: string, enabled: boolean = true) => {
  return useQuery<ApiResponse<WorkforceNeedAnalysis>>({
    queryKey: ["workforce-need-analysis-single", id],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get(`${BASE_URL}${id}/`);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
      }
    },
    enabled: enabled && !!id,
    refetchOnWindowFocus: false,
  });
};

// Create Workforce Need Analysis
export const useCreateWorkforceNeedAnalysis = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    WorkforceNeedAnalysis,
    Error,
    Partial<WorkforceNeedAnalysis>
  >({
    endpoint: BASE_URL,
    queryKey: ["workforce-need-analysis"],
    isAuth: true,
    method: "POST",
  });

  const createWorkforceNeedAnalysis = async (details: Partial<WorkforceNeedAnalysis>) => {
    try {
      await callApi(details);
    } catch (error) {
      console.error("Workforce need analysis create error:", error);
    }
  };

  return { createWorkforceNeedAnalysis, data, isLoading, isSuccess, error };
};

// Update Workforce Need Analysis
export const useUpdateWorkforceNeedAnalysis = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    WorkforceNeedAnalysis,
    Error,
    { id: string; data: Partial<WorkforceNeedAnalysis> }
  >({
    endpoint: BASE_URL,
    queryKey: ["workforce-need-analysis"],
    isAuth: true,
    method: "PUT",
  });

  const updateWorkforceNeedAnalysis = async (id: string, details: Partial<WorkforceNeedAnalysis>) => {
    try {
      await callApi({ id, data: details });
    } catch (error) {
      console.error("Workforce need analysis update error:", error);
    }
  };

  return { updateWorkforceNeedAnalysis, data, isLoading, isSuccess, error };
};

// Delete Workforce Need Analysis
export const useDeleteWorkforceNeedAnalysis = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    void,
    Error,
    { id: string }
  >({
    endpoint: BASE_URL,
    queryKey: ["workforce-need-analysis"],
    isAuth: true,
    method: "DELETE",
  });

  const deleteWorkforceNeedAnalysis = async (id: string) => {
    try {
      await callApi({ id });
    } catch (error) {
      console.error("Workforce need analysis delete error:", error);
    }
  };

  return { deleteWorkforceNeedAnalysis, data, isLoading, isSuccess, error };
};

// Legacy exports for backward compatibility
export const useCreateWorkforceNeedAnalysisMutation = useCreateWorkforceNeedAnalysis;
export const useGetWorkforceNeedAnalysisIdQuery = useGetWorkforceNeedAnalysisId;
export const useGetWorkforceNeedAnalysisQuery = useGetWorkforceNeedAnalysis;