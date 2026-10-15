"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import FormSelect from "@/components/FormSelectField";
import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import Card from "@/components/Card";
import GoBack from "@/components/GoBack";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/Loading";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { HrRoutes } from "@/constants/RouterConstants";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { LocationResultsData } from "definitions/configs/location";
import { PositionsResultsData } from "definitions/configs/positions";
import { workforceNeedAnalysisSchema } from "@/features/hr/types/hr-validator";
import { Save } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useGetLocationList } from "@/features/modules/controllers/config/locationController";
import { useGetPositionPaginate } from "@/features/modules/controllers/config/positionController";
import {
  useCreateWorkforceNeedAnalysis,
  useUpdateWorkforceNeedAnalysis,
  useGetWorkforceNeedAnalysisId,
} from "@/features/hr/controllers/hrWorkforceNeedAnalysisController";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export type TFormValues = z.infer<typeof workforceNeedAnalysisSchema>;

const WorkforceNeedAnalysisForm = () => {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");
  const isEditMode = !!analysisId;

  const form = useForm<TFormValues>({
    resolver: zodResolver(workforceNeedAnalysisSchema),
    defaultValues: {
      position: "",
      location: "",
      wisn_required_staff_count: 1,
    },
    mode: "onChange",
  });

  const { createWorkforceNeedAnalysis, isLoading: isCreating, isSuccess: isCreateSuccess, error: createError } =
    useCreateWorkforceNeedAnalysis();
  const { updateWorkforceNeedAnalysis, isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError } =
    useUpdateWorkforceNeedAnalysis();
  const router = useRouter();

  const isLoading = isCreating || isUpdating;
  const isSuccess = isCreateSuccess || isUpdateSuccess;
  const error = createError || updateError;

  const { data: locations, isLoading: locationIsLoading } =
    useGetLocationList({ page: 1, size: 1000, search: "", enabled: true });
  const { data: positions, isLoading: positionIsLoading } =
    useGetPositionPaginate({ page: 1, size: 1000, search: "", enabled: true });

  const { data: analysis, isLoading: isLoadingAnalysis } = useGetWorkforceNeedAnalysisId(
    analysisId || "",
    !!analysisId
  );

  const { handleSubmit } = form;

  // Pre-populate form for edit mode
  React.useEffect(() => {
    if (analysis?.data && isEditMode) {
      const positionId = typeof analysis.data.position === 'object'
        ? analysis.data.position.id
        : analysis.data.position;
      const locationId = typeof analysis.data.location === 'object'
        ? analysis.data.location.id
        : analysis.data.location;

      form.reset({
        position: String(positionId),
        location: String(locationId),
        wisn_required_staff_count: analysis.data.wisn_required_staff_count,
      });
    }
  }, [analysis, isEditMode, form]);

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success(isEditMode
        ? "Workforce requirement updated successfully!"
        : "Workforce requirement created successfully!"
      );
      router.push(HrRoutes.WORKFORCE_NEED_ANALYSIS);
    }
  }, [isSuccess, isEditMode, router]);

  // Handle error
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || (isEditMode
        ? "Failed to update workforce requirement"
        : "Failed to create workforce requirement")
      );
    }
  }, [error, isEditMode]);

  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    try {
      // Prepare data - convert empty location string to null
      const submitData = {
        ...data,
        location: data.location && data.location.trim() !== "" ? data.location : undefined,
      };

      if (isEditMode && analysisId) {
        // Update existing requirement
        await updateWorkforceNeedAnalysis(analysisId, {
          wisn_required_staff_count: submitData.wisn_required_staff_count,
        });
      } else {
        // Create new requirement
        await createWorkforceNeedAnalysis(submitData);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  if (isEditMode && isLoadingAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <GoBack />

      <div className='pt-8'>
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Staffing Requirement" : "Set Staffing Requirement"}
            </h2>
            <p className="text-gray-600 mt-2">
              Define the required number of staff for a specific position and location.
              The system will automatically calculate shortages or surpluses.
            </p>
          </div>

          <Separator className="mb-6" />

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-6'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormSelect
                  label='Position'
                  name='position'
                  required
                  disabled={isEditMode}
                  placeholder="Select position"
                >
                  <SelectContent>
                    {positionIsLoading ? (
                      <div className="flex justify-center p-4">
                        <LoadingSpinner />
                      </div>
                    ) : (positions?.data?.results || []).length > 0 ? (
                      (positions?.data?.results || []).map(
                        (position: PositionsResultsData) => (
                          <SelectItem key={position.id} value={String(position.id)}>
                            {position.name}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No positions available
                      </div>
                    )}
                  </SelectContent>
                </FormSelect>

                <FormSelect
                  label='Location (Optional)'
                  name='location'
                  disabled={isEditMode}
                  placeholder="Select location or leave empty for organization-wide"
                  helpText="Leave empty for organization-wide positions (e.g., CEO, Managing Director)"
                >
                  <SelectContent>
                    {locationIsLoading ? (
                      <div className="flex justify-center p-4">
                        <LoadingSpinner />
                      </div>
                    ) : (locations?.data?.results || []).length > 0 ? (
                      (locations?.data?.results || []).map(
                        (location: LocationResultsData) => (
                          <SelectItem key={location.id} value={String(location.id)}>
                            {location.name}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No locations available
                      </div>
                    )}
                  </SelectContent>
                </FormSelect>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormInput
                  label='Required Staff Count (WISN)'
                  name='wisn_required_staff_count'
                  type='number'
                  required
                  min={1}
                  placeholder="Enter required number of staff"
                  helpText="Based on Workload Indicators of Staffing Need (WISN) methodology"
                />
              </div>

              {isEditMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Position and Location cannot be changed in edit mode.
                    If you need to change these, please create a new requirement.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>The system will count current staff for this position{form.watch("location") ? " at the selected location" : " across the entire organization"}</li>
                  <li>Automatically calculate shortage or surplus</li>
                  <li>Calculate WISN ratio and workload pressure</li>
                  <li>Provide workforce problem analysis</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-900">💡 Tip: When to use Location</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li><strong>Leave empty</strong> for organization-wide positions (e.g., CEO, Managing Director, CFO)</li>
                  <li><strong>Select location</strong> for positions that vary by location (e.g., Nurses, State Coordinators, Branch Managers)</li>
                </ul>
              </div>

              <Separator />

              <div className='flex justify-end gap-3'>
                <FormButton
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </FormButton>
                <FormButton
                  loading={isLoading}
                  disabled={isLoading}
                  type='submit'
                  className='flex items-center justify-center gap-2'
                >
                  <Save size={16} />
                  {isLoading
                    ? (isEditMode ? "Updating..." : "Creating...")
                    : (isEditMode ? "Update Requirement" : "Create Requirement")
                  }
                </FormButton>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default WorkforceNeedAnalysisForm;
