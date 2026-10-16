"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";

import { recruitmentRequisitionSchema } from "@/features/hr/types/hr-validator";
import {
  useUpdateRecruitmentRequisition,
  useGetRecruitmentRequisition
} from "@/features/hr/controllers/recruitmentRequisitionController";

import MemoUploadStep from "../create-form/MemoUploadStep";
import PositionDetailsStep from "../create-form/PositionDetailsStep";
import JustificationStep from "../create-form/JustificationStep";
import RequirementsStep from "../create-form/RequirementsStep";
import DetailsAndBudgetStep from "../create-form/DetailsAndBudgetStep";
import ApproversStep from "../create-form/ApproversStep";

const STEPS = [
  { id: 1, title: "Approved Memo", description: "Upload approved recruitment memo" },
  { id: 2, title: "Position Details", description: "Position and department information" },
  { id: 3, title: "Justification", description: "Business justification" },
  { id: 4, title: "Requirements", description: "Qualifications and responsibilities" },
  { id: 5, title: "Details & Budget", description: "Timeline and budget information" },
  { id: 6, title: "Approvers", description: "Assign approval workflow" },
];

interface EditRecruitmentRequisitionFormProps {
  requisitionId: string;
}

export default function EditRecruitmentRequisitionForm({
  requisitionId,
}: EditRecruitmentRequisitionFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch existing requisition data
  const { data: requisitionData, isLoading: isFetching } = useGetRecruitmentRequisition(requisitionId);

  const {
    updateRecruitmentRequisition,
    isLoading,
    isSuccess,
    error,
  } = useUpdateRecruitmentRequisition(requisitionId);

  const form = useForm({
    resolver: zodResolver(recruitmentRequisitionSchema),
    mode: "onChange",
    defaultValues: {
      memo_reference: "",
      memo_approved_by_name: "",
      memo_approval_date: "",
      position: "",
      requesting_department: "",
      number_of_positions: 1,
      grade_level: "",
      fco_number: "",
      employment_type: "PERMANENT" as const,
      job_type: "Both" as const,
      priority: "MEDIUM" as const,
      vacancy_reason: "NEW_POSITION" as const,
      business_justification: "",
      impact_if_not_filled: "",
      qualifications: "",
      key_responsibilities: "",
      experience_years: 0,
      skills_required: "",
      language_requirements: "",
      required_start_date: "",
      estimated_salary_range: "",
      working_tools_available: false,
      additional_notes: "",
      reviewer_id: "",
      authorizer_id: "",
      approver_id: "",
    },
  });

  // Pre-populate form when data is loaded
  useEffect(() => {
    if (requisitionData?.data) {
      const req = requisitionData.data;
      form.reset({
        memo_reference: req.memo_reference || "",
        memo_approved_by_name: req.memo_approved_by_name || "",
        memo_approval_date: req.memo_approval_date || "",
        position: req.position?.id || "",
        requesting_department: req.requesting_department?.id || "",
        number_of_positions: req.number_of_positions || 1,
        grade_level: req.grade_level || "",
        fco_number: req.fco_number || "",
        employment_type: req.employment_type || "PERMANENT",
        job_type: req.job_type || "Both",
        priority: req.priority || "MEDIUM",
        vacancy_reason: req.vacancy_reason || "NEW_POSITION",
        business_justification: req.business_justification || "",
        impact_if_not_filled: req.impact_if_not_filled || "",
        qualifications: req.qualifications || "",
        key_responsibilities: req.key_responsibilities || "",
        experience_years: req.experience_years || 0,
        skills_required: req.skills_required || "",
        language_requirements: req.language_requirements || "",
        required_start_date: req.required_start_date || "",
        estimated_salary_range: req.estimated_salary_range || "",
        working_tools_available: req.working_tools_available || false,
        additional_notes: req.additional_notes || "",
        reviewer_id: req.reviewer?.id || "",
        authorizer_id: req.authorizer?.id || "",
        approver_id: req.approver?.id || "",
      });
    }
  }, [requisitionData, form]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Recruitment requisition updated successfully!");
      router.push("/dashboard/hr/recruitment-requisitions");
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update recruitment requisition");
    }
  }, [error]);

  const onSubmit = async (data: any) => {
    console.log("Updating requisition:", data);
    await updateRecruitmentRequisition(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await form.trigger(fieldsToValidate as any);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1:
        return ["memo_document", "memo_reference", "memo_approved_by_name", "memo_approval_date"];
      case 2:
        return ["position", "requesting_department", "number_of_positions", "grade_level", "employment_type", "job_type", "priority"];
      case 3:
        return ["vacancy_reason", "business_justification", "impact_if_not_filled"];
      case 4:
        return ["qualifications", "key_responsibilities", "experience_years"];
      case 5:
        return ["required_start_date", "estimated_salary_range"];
      case 6:
        return ["reviewer_id", "authorizer_id", "approver_id"];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <MemoUploadStep form={form} />;
      case 2:
        return <PositionDetailsStep form={form} />;
      case 3:
        return <JustificationStep form={form} />;
      case 4:
        return <RequirementsStep form={form} />;
      case 5:
        return <DetailsAndBudgetStep form={form} />;
      case 6:
        return <ApproversStep form={form} />;
      default:
        return null;
    }
  };

  if (isFetching) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="text-center py-12">Loading requisition data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/hr/recruitment-requisitions")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Recruitment Requisitions
      </Button>

      {/* Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Recruitment Requisition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="text-xs mt-2 text-center max-w-[100px]">
                    <div className="font-semibold">{step.title}</div>
                    <div className="text-gray-500 text-[10px]">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Requisition"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
