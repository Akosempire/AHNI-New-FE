import useApiManager from "@/constants/mainController";
import { useQuery } from "@tanstack/react-query";
import AxiosWithToken from "@/constants/api_management/MyHttpHelperWithToken";
import { AxiosError } from "axios";
import {
  RecruitmentRequisition,
  RecruitmentRequisitionList,
  RecruitmentRequisitionCreateRequest,
  ApprovalActionRequest,
  ConvertToAdvertisementRequest,
} from "../types/recruitment-requisition";

const BASE_URL = "/hr/jobs/recruitment-requisitions/";

// ===== RECRUITMENT REQUISITION HOOKS =====

// Get All Recruitment Requisitions
export const useGetRecruitmentRequisitions = ({
  search = "",
  status = "",
  priority = "",
  department = "",
  position = "",
  employment_type = "",
  page = 1,
  size = 20,
  enabled = true,
}: {
  search?: string;
  status?: string;
  priority?: string;
  department?: string;
  position?: string;
  employment_type?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "recruitment-requisitions",
      page,
      size,
      search,
      status,
      priority,
      department,
      position,
      employment_type,
    ],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get(BASE_URL, {
          params: {
            page,
            size,
            ...(search && { search }),
            ...(status && { status }),
            ...(priority && { priority }),
            ...(department && { department }),
            ...(position && { position }),
            ...(employment_type && { employment_type }),
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

// Get Single Recruitment Requisition
export const useGetRecruitmentRequisition = (
  id: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["recruitment-requisition", id],
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

// Get My Recruitment Requisitions
export const useGetMyRecruitmentRequisitions = ({
  page = 1,
  size = 20,
  enabled = true,
}: {
  page?: number;
  size?: number;
  enabled?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ["my-recruitment-requisitions", page, size],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get(`${BASE_URL}my_requisitions/`, {
          params: {
            page,
            size,
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

// Get Pending Approvals
export const useGetPendingRecruitmentApprovals = ({
  page = 1,
  size = 20,
  enabled = true,
}: {
  page?: number;
  size?: number;
  enabled?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ["pending-recruitment-approvals", page, size],
    queryFn: async () => {
      try {
        const response = await AxiosWithToken.get(
          `${BASE_URL}pending_approvals/`,
          {
            params: {
              page,
              size,
            },
          }
        );
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

// Create Recruitment Requisition
export const useCreateRecruitmentRequisition = () => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    FormData
  >({
    endpoint: BASE_URL,
    queryKey: ["recruitment-requisitions"],
    isAuth: true,
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const createRecruitmentRequisition = async (
    details: RecruitmentRequisitionCreateRequest
  ) => {
    try {
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(details).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      await callApi(formData);
    } catch (error) {
      console.error("Recruitment requisition create error:", error);
    }
  };

  return { createRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Update Recruitment Requisition
export const useUpdateRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    FormData
  >({
    endpoint: `${BASE_URL}${id}/`,
    queryKey: ["recruitment-requisitions", "recruitment-requisition"],
    isAuth: true,
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const updateRecruitmentRequisition = async (
    details: Partial<RecruitmentRequisitionCreateRequest>
  ) => {
    try {
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(details).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      await callApi(formData);
    } catch (error) {
      console.error("Recruitment requisition update error:", error);
    }
  };

  return { updateRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Delete Recruitment Requisition
export const useDeleteRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    void,
    Error,
    void
  >({
    endpoint: `${BASE_URL}${id}/`,
    queryKey: ["recruitment-requisitions"],
    isAuth: true,
    method: "DELETE",
  });

  const deleteRecruitmentRequisition = async () => {
    try {
      await callApi(undefined);
    } catch (error) {
      console.error("Recruitment requisition delete error:", error);
    }
  };

  return { deleteRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Review Recruitment Requisition (1st approval step)
export const useReviewRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    ApprovalActionRequest
  >({
    endpoint: `${BASE_URL}${id}/review/`,
    queryKey: [
      "recruitment-requisitions",
      "recruitment-requisition",
      "pending-recruitment-approvals",
    ],
    isAuth: true,
    method: "POST",
  });

  const reviewRecruitmentRequisition = async (
    actionData: ApprovalActionRequest
  ) => {
    try {
      await callApi(actionData);
    } catch (error) {
      console.error("Recruitment requisition review error:", error);
    }
  };

  return { reviewRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Authorize Recruitment Requisition (2nd approval step)
export const useAuthorizeRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    ApprovalActionRequest
  >({
    endpoint: `${BASE_URL}${id}/authorize/`,
    queryKey: [
      "recruitment-requisitions",
      "recruitment-requisition",
      "pending-recruitment-approvals",
    ],
    isAuth: true,
    method: "POST",
  });

  const authorizeRecruitmentRequisition = async (
    actionData: ApprovalActionRequest
  ) => {
    try {
      await callApi(actionData);
    } catch (error) {
      console.error("Recruitment requisition authorize error:", error);
    }
  };

  return { authorizeRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Approve Recruitment Requisition (3rd approval step - final)
export const useApproveRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    ApprovalActionRequest
  >({
    endpoint: `${BASE_URL}${id}/approve/`,
    queryKey: [
      "recruitment-requisitions",
      "recruitment-requisition",
      "pending-recruitment-approvals",
    ],
    isAuth: true,
    method: "POST",
  });

  const approveRecruitmentRequisition = async (
    actionData: ApprovalActionRequest
  ) => {
    try {
      await callApi(actionData);
    } catch (error) {
      console.error("Recruitment requisition approve error:", error);
    }
  };

  return { approveRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Reject Recruitment Requisition
export const useRejectRecruitmentRequisition = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    RecruitmentRequisition,
    Error,
    ApprovalActionRequest
  >({
    endpoint: `${BASE_URL}${id}/reject/`,
    queryKey: [
      "recruitment-requisitions",
      "recruitment-requisition",
      "pending-recruitment-approvals",
    ],
    isAuth: true,
    method: "POST",
  });

  const rejectRecruitmentRequisition = async (
    actionData: ApprovalActionRequest
  ) => {
    try {
      await callApi(actionData);
    } catch (error) {
      console.error("Recruitment requisition reject error:", error);
    }
  };

  return { rejectRecruitmentRequisition, data, isLoading, isSuccess, error };
};

// Convert to Job Advertisement
export const useConvertToAdvertisement = (id: string) => {
  const { callApi, isLoading, isSuccess, error, data } = useApiManager<
    any,
    Error,
    ConvertToAdvertisementRequest
  >({
    endpoint: `${BASE_URL}${id}/convert_to_advertisement/`,
    queryKey: ["recruitment-requisitions", "recruitment-requisition"],
    isAuth: true,
    method: "POST",
  });

  const convertToAdvertisement = async (
    conversionData: ConvertToAdvertisementRequest
  ) => {
    try {
      await callApi(conversionData);
    } catch (error) {
      console.error("Convert to advertisement error:", error);
    }
  };

  return { convertToAdvertisement, data, isLoading, isSuccess, error };
};

// Parse Memo Document
export const useParseMemo = () => {
  const parseMemo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("memo_document", file);

      const response = await AxiosWithToken.post(
        `${BASE_URL}parse_memo/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error("Sorry: " + (axiosError.response?.data as any)?.message);
    }
  };

  return { parseMemo };
};
