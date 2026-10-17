"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Loader2, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types and Controllers
import {
  StaffingRequisitionFormData,
  NatureOfHire,
  PositionType,
  EmploymentStatus,
  OfficeType,
  PositionNature,
  NATURE_OF_HIRE_LABELS,
  POSITION_TYPE_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  OFFICE_TYPE_LABELS,
  POSITION_NATURE_LABELS,
} from "../../types/staffing-requisition";
import { useCreateStaffingRequisition } from "../../controllers/staffing-requisition";
import {
  useGetDepartments,
  useGetLocations,
  useGetUsers,
  useGetPositions,
  useGetFCONumbers,
} from "@/controllers/organizationalController";
import { useUploadFileAttachments } from "@/controllers/fileAttachmentController";

export default function CreateStaffingRequisitionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expectedResumptionDate, setExpectedResumptionDate] = useState<Date>();

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StaffingRequisitionFormData>({
    defaultValues: {
      working_tools_available: false,
      number_of_staff: 1,
      office_type: OfficeType.HQ,
      position_nature: PositionNature.REPLACEMENT,
    },
  });

  // Watch conditional fields
  const watchOfficeType = watch("office_type");
  const watchPositionNature = watch("position_nature");

  // API Hooks
  const createMutation = useCreateStaffingRequisition();
  const uploadMutation = useUploadFileAttachments();

  // Data fetching hooks
  const { data: positionsData, isLoading: positionsLoading } = useGetPositions();
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();
  const { data: locationsData, isLoading: locationsLoading } = useGetLocations();
  const { data: usersData, isLoading: usersLoading } = useGetUsers();
  const { data: fcoData, isLoading: fcoLoading } = useGetFCONumbers();

  const positions = positionsData || [];
  const departments = departmentsData || [];
  const locations = locationsData || [];
  const users = usersData || [];
  const fcoNumbers = Array.isArray(fcoData) ? fcoData : [];

  // Debug logging
  console.log('DEBUG: usersData =', usersData);
  console.log('DEBUG: users array length =', users.length);
  console.log('DEBUG: users array =', users);

  // Filter users by position for each role
  const hiringManagers = users.filter(user =>
    user.position_title?.toLowerCase().includes('manager') ||
    user.position_title?.toLowerCase().includes('director') ||
    user.position_title?.toLowerCase().includes('head')
  );

  const hrReviewers = users.filter(user =>
    user.position_title?.toLowerCase().includes('hr') &&
    (user.position_title?.toLowerCase().includes('manager') ||
     user.position_title?.toLowerCase().includes('director'))
  );

  const directorsOfFinance = users.filter(user =>
    user.position_title?.toLowerCase().includes('director') &&
    user.position_title?.toLowerCase().includes('finance')
  );

  const directorsOfOperations = users.filter(user =>
    user.position_title?.toLowerCase().includes('director') &&
    user.position_title?.toLowerCase().includes('operations')
  );

  const managingDirectors = users.filter(user =>
    user.position_title?.toLowerCase().includes('managing director')
  );

  const spmStlDirectors = users.filter(user =>
    user.position_title?.toLowerCase().includes('spm') ||
    user.position_title?.toLowerCase().includes('stl') ||
    user.position_title?.toLowerCase().includes('state team lead') ||
    user.position_title?.toLowerCase().includes('project director')
  );

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  // Form submission
  const onSubmit = async (data: StaffingRequisitionFormData) => {
    // Validate that approved memo is uploaded
    if (!selectedFile) {
      toast.error("Please upload an approved memo before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data
      const formData: StaffingRequisitionFormData = {
        ...data,
        expected_date_of_resumption: expectedResumptionDate
          ? format(expectedResumptionDate, "yyyy-MM-dd")
          : "",
      };

      // Create requisition
      const response = await new Promise<any>((resolve, reject) => {
        createMutation.mutate(formData, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });

      const requisitionId = response.id;

      // Upload memo file if selected
      if (selectedFile && requisitionId) {
        await new Promise<void>((resolve, reject) => {
          uploadMutation.mutate(
            {
              files: [selectedFile],
              content_type: "staffing_requisitions.staffingrequisition",
              object_id: requisitionId,
              descriptions: ["Approved Memo"],
              categories: ["MEMO"],
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });
      }

      toast.success("Staffing requisition created successfully!");
      router.push("/dashboard/hr/staffing-requisitions");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error?.response?.data?.message || "Failed to create requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/hr/staffing-requisitions")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Staffing Requisition Form
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Complete the form below to request staffing approval
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: POSITION DETAILS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Position Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select
                  onValueChange={(value) => setValue("position", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
              </div>

              {/* Nature of Hire */}
              <div className="space-y-2">
                <Label htmlFor="nature_of_hire">Nature of Hire *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("nature_of_hire", value as NatureOfHire)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nature of hire" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NATURE_OF_HIRE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Type */}
              <div className="space-y-2">
                <Label htmlFor="position_type">Position Type *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("position_type", value as PositionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Status */}
              <div className="space-y-2">
                <Label htmlFor="employment_status">Employment Status *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("employment_status", value as EmploymentStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  onValueChange={(value) => setValue("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  onValueChange={(value) => setValue("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} {loc.state ? `(${loc.state})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Supervisor */}
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor *</Label>
                <Select
                  onValueChange={(value) => setValue("supervisor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.supervisor && (
                  <p className="text-sm text-red-500">{errors.supervisor.message}</p>
                )}
              </div>

              {/* FCO Number */}
              <div className="space-y-2">
                <Label htmlFor="fco_number">FCO Number</Label>
                <Select
                  onValueChange={(value) => setValue("fco_number", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select FCO number" />
                  </SelectTrigger>
                  <SelectContent>
                    {fcoLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      fcoNumbers.map((fco) => (
                        <SelectItem key={fco.id} value={fco.id}>
                          {fco.name} ({fco.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Staff */}
              <div className="space-y-2">
                <Label htmlFor="number_of_staff">Number of Staff *</Label>
                <Input
                  id="number_of_staff"
                  type="number"
                  {...register("number_of_staff", {
                    required: "Number of staff is required",
                    min: { value: 1, message: "Must be at least 1" },
                  })}
                  placeholder="Enter number"
                />
                {errors.number_of_staff && (
                  <p className="text-sm text-red-500">{errors.number_of_staff.message}</p>
                )}
              </div>

              {/* Expected Resumption Date */}
              <div className="space-y-2">
                <Label>Expected Resumption Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedResumptionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedResumptionDate ? (
                        format(expectedResumptionDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expectedResumptionDate}
                      onSelect={setExpectedResumptionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Grade Level */}
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level *</Label>
                <Input
                  id="grade_level"
                  {...register("grade_level", { required: "Grade level is required" })}
                  placeholder="e.g., Grade 07"
                />
                {errors.grade_level && (
                  <p className="text-sm text-red-500">{errors.grade_level.message}</p>
                )}
              </div>

              {/* Working Tools Available */}
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="working_tools_available"
                  onCheckedChange={(checked) =>
                    setValue("working_tools_available", checked as boolean)
                  }
                />
                <Label htmlFor="working_tools_available" className="cursor-pointer">
                  Working tools available
                </Label>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONDITIONAL FIELDS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Office Type */}
              <div className="space-y-2">
                <Label htmlFor="office_type">Office Type *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("office_type", value as OfficeType)
                  }
                  defaultValue={OfficeType.HQ}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OFFICE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Nature */}
              <div className="space-y-2">
                <Label htmlFor="position_nature">Position Nature *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("position_nature", value as PositionNature)
                  }
                  defaultValue={PositionNature.REPLACEMENT}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_NATURE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECTION 3: JOB INFORMATION */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Job Information
            </h2>

            <div className="space-y-4">
              {/* Major Duties */}
              <div className="space-y-2">
                <Label htmlFor="major_duties_responsibilities">
                  Major Duties & Responsibilities *
                </Label>
                <Textarea
                  id="major_duties_responsibilities"
                  {...register("major_duties_responsibilities", {
                    required: "Major duties are required",
                  })}
                  placeholder="Describe the main responsibilities..."
                  rows={4}
                />
                {errors.major_duties_responsibilities && (
                  <p className="text-sm text-red-500">
                    {errors.major_duties_responsibilities.message}
                  </p>
                )}
              </div>

              {/* Language Requirements */}
              <div className="space-y-2">
                <Label htmlFor="language_requirements">Language Requirements *</Label>
                <Input
                  id="language_requirements"
                  {...register("language_requirements", {
                    required: "Language requirements are required",
                  })}
                  placeholder="e.g., English, Hausa"
                />
                {errors.language_requirements && (
                  <p className="text-sm text-red-500">
                    {errors.language_requirements.message}
                  </p>
                )}
              </div>

              {/* Justification */}
              <div className="space-y-2">
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  {...register("justification", {
                    required: "Justification is required",
                  })}
                  placeholder="Provide justification for this staffing request..."
                  rows={4}
                />
                {errors.justification && (
                  <p className="text-sm text-red-500">{errors.justification.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: APPROVERS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Approvers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hiring Manager */}
              <div className="space-y-2">
                <Label htmlFor="hiring_manager">Hiring Manager *</Label>
                <p className="text-xs text-gray-500">Manager of the department requesting the staff</p>
                <Select
                  onValueChange={(value) => setValue("hiring_manager", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : hiringManagers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No managers found
                      </SelectItem>
                    ) : (
                      hiringManagers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} - {user.position_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* DOF (Only for NEW positions) */}
              {watchPositionNature === PositionNature.NEW && (
                <div className="space-y-2">
                  <Label htmlFor="dof">Director of Finance *</Label>
                  <Select onValueChange={(value) => setValue("dof", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Director of Finance" />
                    </SelectTrigger>
                    <SelectContent>
                      {directorsOfFinance.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No Director of Finance found
                        </SelectItem>
                      ) : (
                        directorsOfFinance.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} - {user.position_title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* HR Reviewer */}
              <div className="space-y-2">
                <Label htmlFor="hr_reviewer">HR Reviewer *</Label>
                <p className="text-xs text-gray-500">HR Manager</p>
                <Select
                  onValueChange={(value) => setValue("hr_reviewer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HR Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrReviewers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No HR Managers found
                      </SelectItem>
                    ) : (
                      hrReviewers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} - {user.position_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* SPM/STL (Only for STATE offices) */}
              {watchOfficeType === OfficeType.STATE && (
                <div className="space-y-2">
                  <Label htmlFor="spm_stl">SPM/STL/Project Director *</Label>
                  <Select onValueChange={(value) => setValue("spm_stl", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SPM/STL/Project Director" />
                    </SelectTrigger>
                    <SelectContent>
                      {spmStlDirectors.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No SPM/STL/Project Directors found
                        </SelectItem>
                      ) : (
                        spmStlDirectors.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} - {user.position_title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Director of Operations */}
              <div className="space-y-2">
                <Label htmlFor="director_of_operations">
                  Director of Operations *
                </Label>
                <p className="text-xs text-gray-500">Director of the Operations department</p>
                <Select
                  onValueChange={(value) =>
                    setValue("director_of_operations", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Director of Operations" />
                  </SelectTrigger>
                  <SelectContent>
                    {directorsOfOperations.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No Director of Operations found
                      </SelectItem>
                    ) : (
                      directorsOfOperations.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} - {user.position_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Managing Director */}
              <div className="space-y-2">
                <Label htmlFor="managing_director">Managing Director *</Label>
                <p className="text-xs text-gray-500">AHNI Managing Director</p>
                <Select
                  onValueChange={(value) => setValue("managing_director", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Managing Director" />
                  </SelectTrigger>
                  <SelectContent>
                    {managingDirectors.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No Managing Director found
                      </SelectItem>
                    ) : (
                      managingDirectors.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} - {user.position_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECTION 5: MEMO UPLOAD */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Approved Memo <span className="text-red-500">*</span>
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label
                    htmlFor="memo-upload"
                    className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Click to upload approved memo
                    <input
                      id="memo-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, JPG, PNG up to 10MB (Required)
                </p>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm font-medium text-green-900">
                      Selected: {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Requisition"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
