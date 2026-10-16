"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, GitBranch, ChevronDown, ChevronUp } from "lucide-react";
import {
  FormDatePicker,
  FormTextarea,
  FormInput,
} from "@/components/forms/FormComponents";

import {
  useConvertToAdvertisement,
  useGetRecruitmentRequisition,
} from "@/features/hr/controllers/recruitmentRequisitionController";
import { ConvertToAdvertisementRequest } from "@/features/hr/types/recruitment-requisition";

// Validation schema
const convertToAdvertisementSchema = z.object({
  application_deadline: z.string().min(1, "Application deadline is required"),
  application_email: z.string().email("Valid email is required").min(1, "Application email is required"),
  interview_date: z.string().optional(),
  additional_requirements: z.string().optional(),

  // Project information (optional)
  project_name: z.string().optional(),
  donor_name: z.string().optional(),
  project_duration: z.string().optional(),
  project_location: z.string().optional(),
  project_objectives: z.string().optional(),
  project_scope: z.string().optional(),
});

type ConvertToAdvertisementForm = z.infer<typeof convertToAdvertisementSchema>;

interface ConvertToAdvertisementProps {
  requisitionId: string;
}

export default function ConvertToAdvertisement({
  requisitionId,
}: ConvertToAdvertisementProps) {
  const router = useRouter();
  const { data: requisitionData, isLoading: loadingRequisition } =
    useGetRecruitmentRequisition(requisitionId);
  const { convertToAdvertisement, isLoading: converting } =
    useConvertToAdvertisement(requisitionId);

  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const form = useForm<ConvertToAdvertisementForm>({
    resolver: zodResolver(convertToAdvertisementSchema),
    defaultValues: {
      application_deadline: "",
      application_email: "careers@ahnigeria.org.ng",
      interview_date: "",
      additional_requirements: "",
      project_name: "",
      donor_name: "",
      project_duration: "",
      project_location: "",
      project_objectives: "",
      project_scope: "",
    },
  });

  const onSubmit = async (data: ConvertToAdvertisementForm) => {
    try {
      const conversionData: ConvertToAdvertisementRequest = {
        application_deadline: data.application_deadline,
        application_email: data.application_email,
        interview_date: data.interview_date || undefined,
        additional_requirements: data.additional_requirements || undefined,

        // Project information
        project_name: data.project_name || undefined,
        donor_name: data.donor_name || undefined,
        project_duration: data.project_duration || undefined,
        project_location: data.project_location || undefined,
        project_objectives: data.project_objectives || undefined,
        project_scope: data.project_scope || undefined,
      };

      await convertToAdvertisement(conversionData);
      toast.success("Requisition converted to job advertisement successfully!");
      router.push("/dashboard/hr/advertisement");
    } catch (error) {
      toast.error("Failed to convert requisition to advertisement");
    }
  };

  const requisition = requisitionData?.data;

  if (loadingRequisition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="p-6">
        <p className="text-red-600">Requisition not found</p>
      </div>
    );
  }

  if (requisition.status !== "APPROVED") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">
              This requisition must be approved before it can be converted to a
              job advertisement.
            </p>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/hr/recruitment-requisitions/${requisitionId}`)
              }
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requisition
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() =>
            router.push(`/dashboard/hr/recruitment-requisitions/${requisitionId}`)
          }
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Requisition
        </Button>
        <h1 className="text-3xl font-bold">Convert to Job Advertisement</h1>
        <p className="text-gray-600 mt-2">
          Convert approved recruitment requisition{" "}
          <span className="font-semibold">{requisition.requisition_number}</span>{" "}
          to a job advertisement.
        </p>
      </div>

      {/* Requisition Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Requisition Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold">{requisition.position?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold">
                {requisition.requesting_department?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Positions</p>
              <p className="font-semibold">{requisition.number_of_positions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="font-semibold">{requisition.employment_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormDatePicker
                form={form}
                name="application_deadline"
                label="Application Deadline"
                required
                helpText="Closing date for receiving applications"
              />

              <FormInput
                form={form}
                name="application_email"
                label="Application Email"
                type="email"
                placeholder="careers@ahnigeria.org.ng"
                required
                helpText="Email address where candidates should send their applications"
              />

              <FormDatePicker
                form={form}
                name="interview_date"
                label="Planned Interview Date (Optional)"
                helpText="Tentative date for conducting interviews"
              />

              <FormTextarea
                form={form}
                name="additional_requirements"
                label="Additional Requirements for Advertisement (Optional)"
                placeholder="Add any additional information specific to the job advertisement..."
                rows={5}
                helpText="Any extra requirements or instructions for applicants"
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Project Information (Collapsible) */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowProjectInfo(!showProjectInfo)}>
            <CardTitle>Project Information (Optional)</CardTitle>
            {showProjectInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Add project context if this position is project-based (e.g., GAVI, Global Fund, USAID projects)
          </p>
        </CardHeader>
        {showProjectInfo && (
          <CardContent>
            <Form {...form}>
              <div className="space-y-6">
                <FormInput
                  form={form}
                  name="project_name"
                  label="Project Name"
                  placeholder="e.g., GAVI-supported RI and PHC Integration Project"
                  helpText="Full name of the project (if applicable)"
                />

                <FormInput
                  form={form}
                  name="donor_name"
                  label="Donor/Funder"
                  placeholder="e.g., GAVI, Global Fund, USAID, UNICEF"
                  helpText="Name of the funding organization"
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    form={form}
                    name="project_duration"
                    label="Project Duration"
                    placeholder="e.g., 18-month, 2 years"
                    helpText="Duration of the project"
                  />

                  <FormInput
                    form={form}
                    name="project_location"
                    label="Project Location/Scope"
                    placeholder="e.g., 11 priority LGAs in Kaduna State"
                    helpText="Geographic scope of the project"
                  />
                </div>

                <FormTextarea
                  form={form}
                  name="project_objectives"
                  label="Project Objectives"
                  placeholder="Describe the project goals, objectives, and expected outcomes..."
                  rows={5}
                  helpText="Brief description of what the project aims to achieve"
                />

                <FormTextarea
                  form={form}
                  name="project_scope"
                  label="Project Scope & Interventions"
                  placeholder="Describe the project activities, interventions, and approach..."
                  rows={6}
                  helpText="Detailed scope of project activities and implementation strategy"
                />
              </div>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Submit Buttons */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/dashboard/hr/recruitment-requisitions/${requisitionId}`
                    )
                  }
                  disabled={converting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={converting}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  {converting ? "Converting..." : "Convert to Advertisement"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
