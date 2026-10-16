"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "@/components/FileUpload";
import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextArea from "@/components/FormTextArea";
import Card from "@/components/Card";
import GoBack from "@/components/GoBack";
import { Form } from "@/components/ui/form";
import { HrRoutes } from "@/constants/RouterConstants";
import { jobAdvertismentSchema } from "@/features/hr/types/hr-validator";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useGetJobAdvertisement } from "@/features/hr/controllers/jobAdvertisementController";
import useApiManager from "@/constants/mainController";
import { useGetPositionPaginate } from "@/features/modules/controllers/config/positionController";
import { useGetAllGrades } from "@/features/modules/controllers/config/gradeController";
import { useGetLocationList } from "@/features/modules/controllers/config/locationController";
import { toast } from "sonner";
import { z } from "zod";
import React, { useMemo, useState } from "react";
import { formatDate } from "@/utils/date";
import { ChevronDown, ChevronUp } from "lucide-react";

export type TFormValues = z.infer<typeof jobAdvertismentSchema>;

const AddEditAdvertisement = () => {
  const router = useRouter();

  // Get URL params to check if we're in edit mode
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const editId = searchParams?.get('edit');
  const isEditing = !!editId;

  // Collapsible sections state
  const [showOrgProject, setShowOrgProject] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  // File upload API manager for FormData
  const { callApi: createAdvertisement, isLoading: isCreating } = useApiManager<any, Error, FormData>({
    endpoint: "hr/jobs/advertisements/",
    queryKey: ["job-advertisements"],
    isAuth: true,
    method: "POST",
    contentType: "multipart/form-data",
  });

  const { callApi: updateAdvertisement, isLoading: isUpdating } = useApiManager<any, Error, FormData>({
    endpoint: `hr/jobs/advertisements/${editId}/`,
    queryKey: ["job-advertisements", editId],
    isAuth: true,
    method: "PATCH",
    contentType: "multipart/form-data",
  });

  // Fetch dropdown options
  const { data: positions, isLoading: positionsLoading } = useGetPositionPaginate({
    page: 1,
    size: 1000,
    search: "",
  });
  const { data: grades, isLoading: gradesLoading } = useGetAllGrades({
    page: 1,
    size: 1000,
    search: "",
  });
  const { data: locations, isLoading: locationsLoading } = useGetLocationList({
    page: 1,
    size: 1000,
    search: "",
  });

  // Fetch advertisement data if in edit mode
  const { data: editData, isLoading: editLoading } = useGetJobAdvertisement(
    editId || "",
    isEditing
  );

  const form = useForm<TFormValues>({
    resolver: zodResolver(jobAdvertismentSchema),
    defaultValues: {
      // Basic Position Information
      position: "",
      grade_level: "",
      locations: "",
      job_type: "Internal",
      duration: "",
      commencement_date: "",
      number_of_positions: 1,
      background: "",

      // Organization & Project
      organization_name: "Achieving Health Nigeria Initiative (AHNi)",
      organization_background: "Achieving Health Nigeria Initiative (AHNi) is an indigenous non-governmental organization that promotes socio-economic development by supporting a broad range of global health interventions, education, and economic initiatives in Nigeria.",
      project_name: "",
      project_duration: "",
      project_location: "",
      project_objectives: "",
      project_scope: "",
      donor_name: "",

      // Role Description
      role_description: "",
      supervisor: "",

      // Requirements
      education_requirements: "",
      experience_years_min: 0,
      experience_requirements: "",
      technical_skills: "",
      soft_skills: "",
      location_context_requirement: "",

      // Application Details
      application_deadline: "",
      application_email: "careers@ahnigeria.org.ng",
      application_method: "Email",
      application_instructions: "Interested and qualified candidates should forward a suitability statement (application) and resume (CV) as a single MS Word document.",
      subject_line_format: "",
      salary_range: "",

      // Additional
      equal_opportunity_statement: "AHNi is an Equal Opportunity Employer.",
      disclaimer: "AHNi does not charge Candidates a fee for a test or interview",
      any_other_info: "",
      advert_document: null,
    },
  });

  // Update form values when edit data is loaded
  React.useEffect(() => {
    if (isEditing && editData?.data && !editLoading) {
      const data = editData.data;

      console.log("=== EDIT MODE: Loading Advertisement Data ===");
      console.log("Full advertisement data:", data);

      // Helper to safely extract ID from objects
      const getIdValue = (value: any): string => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object" && value.id) return String(value.id);
        return "";
      };

      // Helper to extract first location ID if array
      const getLocationId = (value: any): string => {
        if (!value) return "";
        if (Array.isArray(value) && value.length > 0) {
          return typeof value[0] === "object" ? String(value[0].id) : String(value[0]);
        }
        if (typeof value === "object" && value.id) return String(value.id);
        return "";
      };

      const positionId = getIdValue(data.position);
      const gradeId = getIdValue(data.grade);
      const locationId = getLocationId(data.locations);

      console.log("Extracted IDs:");
      console.log("- Position ID:", positionId, "from", data.position);
      console.log("- Grade ID:", gradeId, "from", data.grade);
      console.log("- Location ID:", locationId, "from", data.locations);

      const formValues = {
        // Basic Position Information
        position: positionId,
        grade_level: gradeId,
        locations: locationId,
        job_type: data.job_type || "Internal",
        duration: data.duration || "",
        commencement_date: data.commencement_date || "",
        number_of_positions: data.number_of_positions || 1,
        background: data.background || "",

        // Organization & Project
        organization_name: data.organization_name || "Achieving Health Nigeria Initiative (AHNi)",
        organization_background: data.organization_background || "",
        project_name: data.project_name || "",
        project_duration: data.project_duration || "",
        project_location: data.project_location || "",
        project_objectives: data.project_objectives || "",
        project_scope: data.project_scope || "",
        donor_name: data.donor_name || "",

        // Role Description
        role_description: data.role_description || "",
        supervisor: data.supervisor || "",

        // Requirements
        education_requirements: data.education_requirements || "",
        experience_years_min: data.experience_years_min || 0,
        experience_requirements: data.experience_requirements || "",
        technical_skills: data.technical_skills || "",
        soft_skills: data.soft_skills || "",
        location_context_requirement: data.location_context_requirement || "",

        // Application Details
        application_deadline: data.application_deadline || "",
        application_email: data.application_email || "careers@ahnigeria.org.ng",
        application_method: data.application_method || "Email",
        application_instructions: data.application_instructions || "",
        subject_line_format: data.subject_line_format || "",
        salary_range: data.salary_range || "",

        // Additional
        equal_opportunity_statement: data.equal_opportunity_statement || "AHNi is an Equal Opportunity Employer.",
        disclaimer: data.disclaimer || "AHNi does not charge Candidates a fee for a test or interview",
        any_other_info: data.any_other_info || "",
        advert_document: null,
      };

      console.log("Resetting form with values:", formValues);
      form.reset(formValues);

      // Open sections if they have data
      if (data.project_name || data.project_objectives) {
        console.log("Opening Organization & Project section");
        setShowOrgProject(true);
      }
      if (data.education_requirements || data.technical_skills) {
        console.log("Opening Requirements section");
        setShowRequirements(true);
      }
      if (data.application_deadline || data.application_email) {
        console.log("Opening Application section");
        setShowApplication(true);
      }

      console.log("=== Form reset complete ===");
    }
  }, [isEditing, editData, editLoading, form]);

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<TFormValues> = async (data: TFormValues) => {
    try {
      const formData = new FormData();

      // Basic Position Information (REQUIRED)
      if (data.position) formData.append("position", data.position);
      if (data.grade_level) formData.append("grade", data.grade_level);
      if (data.locations) formData.append("locations", data.locations);
      formData.append("job_type", data.job_type || "Internal");
      formData.append("duration", data.duration || "");
      if (data.commencement_date) {
        formData.append("commencement_date", formatDate(data.commencement_date));
      }
      formData.append("number_of_positions", String(data.number_of_positions || 1));
      formData.append("background", data.background || "");

      // Organization & Project Information
      if (data.organization_name) formData.append("organization_name", data.organization_name);
      if (data.organization_background) formData.append("organization_background", data.organization_background);
      if (data.project_name) formData.append("project_name", data.project_name);
      if (data.project_duration) formData.append("project_duration", data.project_duration);
      if (data.project_location) formData.append("project_location", data.project_location);
      if (data.project_objectives) formData.append("project_objectives", data.project_objectives);
      if (data.project_scope) formData.append("project_scope", data.project_scope);
      if (data.donor_name) formData.append("donor_name", data.donor_name);

      // Role Description
      if (data.role_description) formData.append("role_description", data.role_description);
      if (data.supervisor) formData.append("supervisor", data.supervisor);

      // Requirements & Qualifications
      if (data.education_requirements) formData.append("education_requirements", data.education_requirements);
      if (data.experience_years_min !== undefined) formData.append("experience_years_min", String(data.experience_years_min));
      if (data.experience_requirements) formData.append("experience_requirements", data.experience_requirements);
      if (data.technical_skills) formData.append("technical_skills", data.technical_skills);
      if (data.soft_skills) formData.append("soft_skills", data.soft_skills);
      if (data.location_context_requirement) formData.append("location_context_requirement", data.location_context_requirement);

      // Application Details
      if (data.application_deadline) formData.append("application_deadline", formatDate(data.application_deadline));
      if (data.application_email) formData.append("application_email", data.application_email);
      if (data.application_method) formData.append("application_method", data.application_method);
      if (data.application_instructions) formData.append("application_instructions", data.application_instructions);
      if (data.subject_line_format) formData.append("subject_line_format", data.subject_line_format);
      if (data.salary_range) formData.append("salary_range", data.salary_range);

      // Additional Settings
      if (data.equal_opportunity_statement) formData.append("equal_opportunity_statement", data.equal_opportunity_statement);
      if (data.disclaimer) formData.append("disclaimer", data.disclaimer);
      if (data.any_other_info) formData.append("any_other_info", data.any_other_info);

      // Handle file upload (only if a new file is provided)
      if (data.advert_document && data.advert_document[0]) {
        formData.append("advert_document", data.advert_document[0]);
      }

      console.log(`${isEditing ? 'Updating' : 'Creating'} advertisement with FormData`);

      // Use appropriate API based on edit mode
      if (isEditing) {
        await updateAdvertisement(formData);
        toast.success("Job advertisement updated successfully");
      } else {
        await createAdvertisement(formData);
        toast.success("Job advertisement created successfully");
      }

      router.push(HrRoutes.ADVERTISEMENT);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} job advertisement`);
      console.error("Submit error:", error);
    }
  };

  // Prepare dropdown options
  const positionOptions = useMemo(
    () => {
      const positionData = (positions as any)?.data?.results || positions?.results || [];
      if (!Array.isArray(positionData)) return [];
      return positionData.map((position: any) => ({
        label: String(position.name || position.title || 'Unknown'),
        value: String(position.id || ''),
      }));
    },
    [positions]
  );

  const gradeOptions = useMemo(
    () => {
      const gradeData = (grades as any)?.data?.results || grades?.results || [];
      if (!Array.isArray(gradeData)) return [];
      return gradeData.map((grade: any) => ({
        label: String(grade.name || 'Unknown'),
        value: String(grade.id || ''),
      }));
    },
    [grades]
  );

  const locationOptions = useMemo(
    () => {
      const locationData = (locations as any)?.data?.results || locations?.results || [];
      if (!Array.isArray(locationData)) return [];
      return locationData.map((location: any) => ({
        label: String(location.name || 'Unknown'),
        value: String(location.id || ''),
      }));
    },
    [locations]
  );

  const jobTypeOptions = [
    { value: "Internal", label: "Internal" },
    { value: "External", label: "External" },
    { value: "Both", label: "Both" },
  ];

  const applicationMethodOptions = [
    { value: "Email", label: "Email" },
    { value: "Online Portal", label: "Online Portal" },
    { value: "Both", label: "Both" },
  ];

  const isLoading = editLoading;
  const isSubmitting = isEditing ? isUpdating : isCreating;

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4">Loading advertisement data...</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <GoBack />
      <Card>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <h4 className='font-medium text-lg pb-4'>
              {isEditing ? 'Edit Job Advertisement' : 'Create New Job Advertisement'}
            </h4>

            {/* SECTION 1: Basic Position Information */}
            <div className="space-y-4 pb-6 border-b">
              <h5 className="font-semibold text-md">Basic Position Information</h5>

              <FormSelect
                name='position'
                label={`Position (${positionOptions.length} options)`}
                placeholder={positionsLoading ? 'Loading positions...' : 'Select Position'}
                options={positionOptions}
                required
              />
              <FormSelect
                name='grade_level'
                label={`Grade Level (${gradeOptions.length} options)`}
                placeholder={gradesLoading ? 'Loading grades...' : 'Select Grade Level'}
                options={gradeOptions}
                required
              />
              <FormSelect
                name='locations'
                label={`Location (${locationOptions.length} options)`}
                placeholder={locationsLoading ? 'Loading locations...' : 'Select Location'}
                options={locationOptions}
                required
              />
              <FormSelect
                name='job_type'
                label='Job Type (Internal/External)'
                placeholder='Select Job Type'
                options={jobTypeOptions}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name='duration'
                  label='Duration'
                  placeholder='Example: 18 months, 2 years, Permanent'
                  required
                />
                <FormInput
                  name='number_of_positions'
                  label='Number of Positions'
                  required
                  type='number'
                />
              </div>
              <FormInput
                name='commencement_date'
                label='Expected Commencement Date'
                required
                type='date'
              />
              <FormTextArea
                name='background'
                label='Position Background/Context'
                required
                rows={4}
                placeholder='Provide background and context for this position...'
              />
              <FormInput
                name='supervisor'
                label='Reports To (Optional)'
                placeholder='Position this role reports to'
              />
            </div>

            {/* SECTION 2: Organization & Project Information (Collapsible) */}
            <div className="space-y-4 pb-6 border-b">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowOrgProject(!showOrgProject)}
              >
                <h5 className="font-semibold text-md">Organization & Project Information (Optional)</h5>
                {showOrgProject ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              <p className="text-sm text-gray-600">
                Add organization details and project context for project-based positions
              </p>

              {showOrgProject && (
                <div className="space-y-4 mt-4">
                  <FormInput
                    name='organization_name'
                    label='Organization Name'
                    placeholder='Achieving Health Nigeria Initiative (AHNi)'
                  />
                  <FormTextArea
                    name='organization_background'
                    label='Organization Background'
                    rows={4}
                    placeholder='Brief description of the organization and its mission...'
                  />
                  <FormInput
                    name='project_name'
                    label='Project Name (if applicable)'
                    placeholder='e.g., GAVI-supported RI and PHC Integration Project'
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      name='donor_name'
                      label='Donor/Funder'
                      placeholder='e.g., GAVI, Global Fund, USAID'
                    />
                    <FormInput
                      name='project_duration'
                      label='Project Duration'
                      placeholder='e.g., 18 months, 2 years'
                    />
                  </div>
                  <FormInput
                    name='project_location'
                    label='Project Location/Scope'
                    placeholder='e.g., 11 priority LGAs in Kaduna State'
                  />
                  <FormTextArea
                    name='project_objectives'
                    label='Project Objectives'
                    rows={4}
                    placeholder='Brief description of project goals and objectives...'
                  />
                  <FormTextArea
                    name='project_scope'
                    label='Project Scope & Interventions'
                    rows={4}
                    placeholder='Detailed scope of project activities...'
                  />
                </div>
              )}
            </div>

            {/* SECTION 3: Role Description & Responsibilities */}
            <div className="space-y-4 pb-6 border-b">
              <h5 className="font-semibold text-md">Role Description & Key Responsibilities</h5>
              <FormTextArea
                name='role_description'
                label='Detailed Role Description'
                rows={6}
                placeholder='Describe the key responsibilities, duties, and what the successful candidate will do...'
              />
            </div>

            {/* SECTION 4: Requirements & Qualifications (Collapsible) */}
            <div className="space-y-4 pb-6 border-b">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowRequirements(!showRequirements)}
              >
                <h5 className="font-semibold text-md">Requirements & Qualifications</h5>
                {showRequirements ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {showRequirements && (
                <div className="space-y-4 mt-4">
                  <FormTextArea
                    name='education_requirements'
                    label='Education Requirements'
                    rows={3}
                    placeholder='Required educational qualifications (e.g., MBBS, MPH, MSc Public Health...)'
                  />
                  <FormInput
                    name='experience_years_min'
                    label='Minimum Years of Experience'
                    type='number'
                    placeholder='0'
                  />
                  <FormTextArea
                    name='experience_requirements'
                    label='Detailed Experience Requirements'
                    rows={4}
                    placeholder='Describe the type of experience required...'
                  />
                  <FormTextArea
                    name='technical_skills'
                    label='Technical Skills Required'
                    rows={3}
                    placeholder='e.g., DHIS2, Microsoft Excel, Power BI, SPSS, etc.'
                  />
                  <FormTextArea
                    name='soft_skills'
                    label='Soft Skills & Competencies'
                    rows={3}
                    placeholder='e.g., Strong communication, leadership, organizational skills'
                  />
                  <FormTextArea
                    name='location_context_requirement'
                    label='Location/Context Knowledge'
                    rows={2}
                    placeholder='e.g., Knowledge of local operational context and languages'
                  />
                </div>
              )}
            </div>

            {/* SECTION 5: Application Details (Collapsible) */}
            <div className="space-y-4 pb-6 border-b">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowApplication(!showApplication)}
              >
                <h5 className="font-semibold text-md">Application Details</h5>
                {showApplication ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {showApplication && (
                <div className="space-y-4 mt-4">
                  <FormInput
                    name='application_deadline'
                    label='Application Deadline'
                    type='date'
                  />
                  <FormInput
                    name='application_email'
                    label='Application Email'
                    type='email'
                    placeholder='careers@ahnigeria.org.ng'
                  />
                  <FormSelect
                    name='application_method'
                    label='Application Method'
                    options={applicationMethodOptions}
                  />
                  <FormTextArea
                    name='application_instructions'
                    label='Application Instructions'
                    rows={4}
                    placeholder='Detailed instructions for how to apply...'
                  />
                  <FormInput
                    name='subject_line_format'
                    label='Email Subject Line Format'
                    placeholder='e.g., JOB TITLE and LOCATION clearly indicated as subject'
                  />
                  <FormInput
                    name='salary_range'
                    label='Salary Range (Optional)'
                    placeholder='e.g., Competitive, NGN 500,000 - 800,000'
                  />
                </div>
              )}
            </div>

            {/* SECTION 6: Additional Information & Settings (Collapsible) */}
            <div className="space-y-4 pb-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAdditional(!showAdditional)}
              >
                <h5 className="font-semibold text-md">Additional Information & Settings</h5>
                {showAdditional ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {showAdditional && (
                <div className="space-y-4 mt-4">
                  <FormInput
                    name='equal_opportunity_statement'
                    label='Equal Opportunity Statement'
                    placeholder='AHNi is an Equal Opportunity Employer.'
                  />
                  <FormInput
                    name='disclaimer'
                    label='Disclaimer'
                    placeholder='AHNi does not charge Candidates a fee for a test or interview'
                  />
                  <FormTextArea
                    name='any_other_info'
                    label='Any Other Information'
                    rows={3}
                    placeholder='Additional information or notes...'
                  />
                </div>
              )}
            </div>

            {/* Document Upload */}
            <FileUpload
              name='advert_document'
              label="Upload Advertisement Document (Optional)"
            />

            {/* Submit Button */}
            <div className='flex justify-end gap-4'>
              <button
                type='button'
                onClick={() => router.push(HrRoutes.ADVERTISEMENT)}
                className='px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <FormButton loading={isSubmitting} disabled={isSubmitting}>
                {isEditing ? 'Update Advertisement' : 'Create Advertisement'}
              </FormButton>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditAdvertisement;
