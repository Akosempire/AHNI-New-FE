import useApiManager from "@/constants/mainController";
import { useQuery } from "@tanstack/react-query";
import AxiosWithToken from "@/constants/api_management/MyHttpHelperWithToken";
import { AxiosError } from "axios";
import {
  JobAdvertisement,
  JobAdvertisementModel,
} from "../types/job-advertisement";

const BASE_URL = "/hr/jobs/advertisements/";

// ===== JOB ADVERTISEMENT HOOKS =====

// Get All Job Advertisements
export const useGetJobAdvertisements = ({
  search = "",
  page = 1,
  size = 20,
  enabled = true,
}: {
  search?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["job-advertisements", page, size, search],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get(BASE_URL, {
          params: {
            page,
            size,
            ...(search && { search }),
          },
        });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
      }
    },
    enabled: enabled,
    refetchOnWindowFocus: false,
  });
};

// Get Single Job Advertisement
export const useGetJobAdvertisement = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["job-advertisement", id],
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

// Create Job Advertisement
export const useCreateJobAdvertisement = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    JobAdvertisement,
    Error,
    Partial<JobAdvertisement>
  >({
    endpoint: BASE_URL,
    queryKey: ["job-advertisements"],
    isAuth: true,
    method: "POST",
  });

  const createJobAdvertisement = async (details: Partial<JobAdvertisement>) => {
    try {
      await callApi(details);
    } catch (error) {
      console.error("Job advertisement create error:", error);
    }
  };

  return { createJobAdvertisement, data, isLoading, isSuccess, error };
};

// Update Job Advertisement
export const useUpdateJobAdvertisement = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    JobAdvertisement,
    Error,
    Partial<JobAdvertisement>
  >({
    endpoint: `${BASE_URL}${id}/`,
    queryKey: ["job-advertisements", "job-advertisement"],
    isAuth: true,
    method: "PUT",
  });

  const updateJobAdvertisement = async (details: Partial<JobAdvertisement>) => {
    try {
      await callApi(details);
    } catch (error) {
      console.error("Job advertisement update error:", error);
    }
  };

  return { updateJobAdvertisement, data, isLoading, isSuccess, error };
};

// Create Job Advertisement from Staffing Requisition
export const useCreateAdvertFromRequisition = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    JobAdvertisement,
    Error,
    void
  >({
    endpoint: "",  // Will be set dynamically
    queryKey: ["job-advertisements", "staffing-requisitions"],
    isAuth: true,
    method: "POST",
  });

  const createFromRequisition = async (requisitionId: string) => {
    try {
      const response = await AxiosWithToken.post(
        `${BASE_URL}from-requisition/${requisitionId}/`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        "Failed to create advertisement: " +
        ((axiosError.response?.data as any)?.message || "Unknown error")
      );
    }
  };

  return { createFromRequisition, data, isLoading, isSuccess, error };
};

// Legacy exports for backward compatibility
export const useGetJobAdvertisementsQuery = useGetJobAdvertisements;
export const useGetJobAdvertisementQuery = useGetJobAdvertisement;
export const useCreateJobAdvertisementMutation = useCreateJobAdvertisement;
export const useUpdateJobAdvertisementMutation = useUpdateJobAdvertisement;