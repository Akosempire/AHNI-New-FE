/**
 * Staffing Requisition API Controllers
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AxiosWithToken from "@/constants/api_management/MyHttpHelperWithToken";
import type {
  StaffingRequisition,
  StaffingRequisitionListItem,
  StaffingRequisitionFormData,
  ApprovalActionData,
} from "../types/staffing-requisition";

const BASE_URL = "/hr/staffing-requisitions";

/**
 * Get all staffing requisitions (with optional filters)
 */
export const useGetStaffingRequisitions = (filters?: {
  status?: string;
  department?: string;
  position?: string;
  office_type?: string;
  position_nature?: string;
}) => {
  return useQuery({
    queryKey: ["staffing-requisitions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const response = await AxiosWithToken.get<{
        status: boolean;
        data: { results: StaffingRequisitionListItem[] };
      }>(
        `${BASE_URL}/?${params.toString()}`
      );
      return response.data.data.results;
    },
  });
};

/**
 * Get user's created requisitions
 */
export const useGetMyRequisitions = () => {
  return useQuery({
    queryKey: ["staffing-requisitions", "my-requisitions"],
    queryFn: async () => {
      const response = await AxiosWithToken.get<{
        status: boolean;
        data: { results: StaffingRequisitionListItem[] };
      }>(
        `${BASE_URL}/my-requisitions/`
      );
      return response.data.data.results;
    },
  });
};

/**
 * Get requisitions pending user's approval
 */
export const useGetPendingApprovals = () => {
  return useQuery({
    queryKey: ["staffing-requisitions", "pending-approvals"],
    queryFn: async () => {
      const response = await AxiosWithToken.get<{
        status: boolean;
        data: { results: StaffingRequisitionListItem[] };
      }>(
        `${BASE_URL}/pending-approvals/`
      );
      return response.data.data.results;
    },
  });
};

/**
 * Get single staffing requisition by ID
 */
export const useGetStaffingRequisition = (id: string | undefined) => {
  return useQuery({
    queryKey: ["staffing-requisition", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await AxiosWithToken.get<StaffingRequisition>(
        `${BASE_URL}/${id}/`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Create new staffing requisition
 */
export const useCreateStaffingRequisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffingRequisitionFormData) => {
      const response = await AxiosWithToken.post<StaffingRequisition>(
        `${BASE_URL}/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      toast.success("Staffing requisition created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create staffing requisition"
      );
    },
  });
};

/**
 * Update staffing requisition
 */
export const useUpdateStaffingRequisition = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<StaffingRequisitionFormData>) => {
      const response = await AxiosWithToken.patch<StaffingRequisition>(
        `${BASE_URL}/${id}/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      toast.success("Staffing requisition updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update staffing requisition"
      );
    },
  });
};

/**
 * Delete staffing requisition
 */
export const useDeleteStaffingRequisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await AxiosWithToken.delete(`${BASE_URL}/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      toast.success("Staffing requisition deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete staffing requisition"
      );
    },
  });
};

/**
 * Submit requisition for review
 */
export const useSubmitForReview = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await AxiosWithToken.post<StaffingRequisition>(
        `${BASE_URL}/${id}/submit_for_review/`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      toast.success("Requisition submitted for review");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error || "Failed to submit for review"
      );
    },
  });
};

/**
 * Approve requisition
 */
export const useApproveRequisition = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalActionData) => {
      const response = await AxiosWithToken.post<StaffingRequisition>(
        `${BASE_URL}/${id}/approve/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions", "pending-approvals"] });
      toast.success("Requisition approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to approve requisition");
    },
  });
};

/**
 * Super Admin: Approve all remaining levels at once
 */
export const useApproveAllLevels = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalActionData) => {
      const response = await AxiosWithToken.post<{
        message: string;
        requisition: StaffingRequisition;
      }>(
        `${BASE_URL}/${id}/approve-all-levels/`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions", "pending-approvals"] });
      toast.success(data.message || "All approval levels approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to approve all levels");
    },
  });
};

/**
 * Reject requisition
 */
export const useRejectRequisition = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalActionData) => {
      const response = await AxiosWithToken.post<StaffingRequisition>(
        `${BASE_URL}/${id}/reject/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions", "pending-approvals"] });
      toast.success("Requisition rejected");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to reject requisition");
    },
  });
};

/**
 * Cancel requisition
 */
export const useCancelRequisition = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await AxiosWithToken.post<StaffingRequisition>(
        `${BASE_URL}/${id}/cancel/`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffing-requisition", id] });
      queryClient.invalidateQueries({ queryKey: ["staffing-requisitions"] });
      toast.success("Requisition cancelled");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to cancel requisition");
    },
  });
};

/**
 * Download requisition as PDF
 * Only works for APPROVED requisitions
 */
export const useDownloadRequisitionPDF = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosWithToken.get(`${BASE_URL}/${id}/download-pdf/`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `staffing_requisition_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onSuccess: () => {
      toast.success("PDF downloaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error || "Failed to download PDF. Only approved requisitions can be downloaded."
      );
    },
  });
};
