import { z } from "zod";
const { object, string } = z;

// const isBrowser =
//   typeof window !== "undefined" && typeof FileList !== "undefined";

export const workforceQualificationSchema = object({
  certificate_name: string().min(1, "Field is required"),
  institution_name: string().min(1, "Field is required"),
  date_of_qualification: string().min(1, "Field is required"),
  certificate_file: z.any(),
  employee: string().min(1, "Field is required"),
});

export const workforcePensionSchema = object({
  pfa_name: string().min(1, "Field is required"),
  pfc_account_name: string().min(1, "Field is required"),
  rsa_number: string().min(1, "Field is required"),
  pfc_account_number: string().min(1, "Field is required"),
  has_existing_retirement_savings: z.boolean(),
  is_match_existing_pfa: z.boolean(),
  pfa_registeration_date: string().min(1, "Field is required"),
  employee: string().min(1, "Field is required"),
});

export const workforceBankAccountSchema = object({
  bank_name: string().min(1, "Field is required"),
  branch_name: string().min(1, "Field is required"),
  account_name: string().min(1, "Field is required"),
  account_number: string().min(1, "Field is required"),
  sort_code: string().min(1, "Field is required"),
  employee: string().min(1, "Field is required"),
});

export const workforceSchema = object({
  legal_firstname: z.string().min(1, "Field is required"),
  legal_middlename: z.string().optional(),
  legal_lastname: z.string().min(1, "Field is required"),
  address: z.string().min(1, "Field is required"),
  designation: z.string().min(1, "Field is required"),
  phone_number: z.string().min(1, "Field is required"),
  other_number: z.string().optional(),
  date_of_birth: z.string().date("Field is required"),
  date_of_hire: z.string().min(1, "Field is required"),
  // ss_number: z.string().min(1, "Field is required"),
  serial_id_code: z.string().min(1, "Field is required"),
  signature_file: z.any(),
  passport_file: z.any(),
  marital_status: z.enum(["single", "married", "divorced"]),
  own_computer: z.boolean(),
  require_email_access: z.boolean(),
  employment_type: z.enum(["INTERNAL", "EXTERNAL", "BOTH"]),
  // group: z.string().min(1, "Field is required"),
  location: z.string().min(1, "Field is required"),
  // application: z.string().min(1, "Field is required"),
  department: z.string().min(1, "Field is required"),
  project: z.string().min(1, "Field is required"),
});

export const hrEmergencySchema = object({
  name: string().min(1, "Field is required"),
  relationship: string().min(1, "Field is required"),
  home_phone: string().min(1, "Field is required"),
  mobile_phone: string().min(1, "Field is required"),
  email_address: string().email().min(1, "Field is required"),
  address: string().min(1, "Field is required"),
  employee: string().min(1, "Field is required"),
});

export const hrGradeSchema = object({
  name: z.string().min(1, "Field is required"),
});

export const hrBeneficiarySchema = object({
  is_primary: z.boolean(),
  name: string().min(1, "Field is required"),
  relationship: string().min(1, "Field is required"),
  percentage_of_benefit: z.preprocess(
    (val) => String(val),
    string().min(1, "Field is required")
  ),
  phone_number: string().min(1, "Field is required"),
});

export const hrContingentBeneficiarySchema = object({
  is_primary: z.boolean(),
  name: string().min(1, "Field is required"),
  relationship: string().min(1, "Field is required"),
  phone_number: string().min(1, "Field is required"),
});

export const hrSignatoriesBeneficiarySchema = object({
  witness_name: string().min(1, "Field is required"),
  witness_date: string().min(1, "Field is required"),
  withness_signature: z.any(),
});

export const jobAdvertismentSchema = z.object({
  // Organization & Advertisement Header
  advertisement_title: z.string().optional(),
  organization_name: z.string().optional(),
  organization_background: z.string().optional(),
  organization_location: z.string().optional(),

  // Project Context (for project-based positions)
  project_name: z.string().optional(),
  project_duration: z.string().optional(),
  project_location: z.string().optional(),
  project_objectives: z.string().optional(),
  project_scope: z.string().optional(),
  donor_name: z.string().optional(),

  // Position Details (REQUIRED fields)
  title: z.string().optional(), // Legacy field for direct title input
  position: z.string().optional(), // UUID of Position
  grade: z.string().optional(), // UUID of Grade (renamed from grade_level for backend consistency)
  grade_level: z.string().optional(), // Keep for backward compatibility
  level: z.string().optional(), // UUID of Level
  contract_type: z.enum(["FIXED_TERM", "PERMANENT", "TEMPORARY", "CONSULTANCY"]).optional(),
  position_type: z.enum(["PROGRAMS", "TECHNICAL", "OPERATIONS", "FINANCE", "ADMIN"]).optional(),
  position_category: z.string().optional(),
  project_tag: z.string().optional(),
  locations: z.string().min(1, "Location is required"),
  job_type: z.enum(["Internal", "External", "Both"]),
  duration: z.string().min(1, "Duration is required"),
  commencement_date: z.string().min(1, "Commencement Date is required"),
  number_of_positions: z.preprocess(
    (val) => Number(val),
    z.number().positive("Must be a positive number")
  ),
  supervisor: z.string().optional(),

  // Role Description & Responsibilities
  role_description: z.string().optional(),
  background: z.string().min(1, "Background is required"),

  // Requirements & Qualifications
  education_requirements: z.string().optional(),
  professional_certifications: z.string().optional(),
  experience_years_min: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().nonnegative("Experience years cannot be negative").optional()
  ),
  experience_years_max: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().nonnegative("Experience years cannot be negative").optional()
  ),
  experience_requirements: z.string().optional(),
  donor_experience: z.string().optional(),
  technical_skills: z.string().optional(),
  soft_skills: z.string().optional(),
  location_context_requirement: z.string().optional(),
  any_other_info: z.string().optional(),

  // Application Details
  application_deadline: z.string().optional(),
  application_email: z.string().email("Valid email required").optional().or(z.literal("")),
  application_method: z.string().optional(),
  application_instructions: z.string().optional(),
  application_format: z.string().optional(),
  subject_line_format: z.string().optional(),
  rolling_basis: z.boolean().optional(),
  interview_date: z.string().optional(),
  salary_range: z.string().optional(),

  // Status & Publication
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]).optional(),
  is_published: z.boolean().optional(),

  // Additional Statements
  equal_opportunity_statement: z.string().optional(),
  disclaimer: z.string().optional(),
  shortlist_notification: z.string().optional(),
  contact_only_shortlisted: z.boolean().optional(),

  // Documents & Resources
  advert_document: z.any().optional(),
  interviewers: z.array(z.string().uuid()).optional(),
});

export const jobApplicationSchema = z.object({
  applicant_first_name: z.string().min(3, "Name must be at least 3 characters"),
  applicant_last_name: z.string().min(3, "Name must be at least 3 characters"),
  applicant_middle_name: z
    .string()
    .min(3, "Name must be at least 3 characters"),
  applicant_email: z.string().email("Invalid email"),
  application_notes: z.string().optional(),
  cover_letter: z.any().optional(),
  employment_type: z.enum(["INTERNAL", "EXTERNAL", "BOTH"]),
  advertisement: z.string().uuid("Invalid Advert ID"),
  interview_date: z.string().optional(),
  position_applied: z.string().min(2, "Position is required"),
  referees: z
    .array(
      z.object({
        // name: z.string().min(3, "Name must be at least 3 characters"),
        name: z.string().optional(),
        email: z.string().email("Invalid email").optional(),
      })
    )
    .optional(),
  // .min(1, "At least one referee is required"),
  resume: z.any().optional(), // File will be converted to Base64
  status: z.enum(["applied", "interviewed", "hired", "rejected"]),
});

export const workforceNeedAnalysisSchema = z.object({
  position: z.string().min(1, "Position is required"),
  location: z.string().optional().or(z.literal("")),
  wisn_required_staff_count: z.preprocess(
    (val) => Number(val),
    z.number().positive("Required staff count must be a positive number")
  ),
});

export const hrSystemAuthorizationSchema = z.object({
  user_login_name: z.string().min(1, "User Login Name is required"),
  computer_name: z.string().min(1, "Computer Name is required"),
  email_alias: z.string().min(1, "Email Alias is required"),
  is_training_completed: z.boolean(),
  authorization_officer_name: z.string().min(1, "Name is required"),
  authorization_date: z.string().min(1, "Date Completed is required"),
  employee: z.string(),
});

// Recruitment Requisition Schemas
export const recruitmentRequisitionMemoSchema = z.object({
  memo_document: z.any(), // File upload
  memo_reference: z.string().min(1, "Memo reference number is required"),
  memo_approved_by_name: z.string().min(1, "Memo approver name is required"),
  memo_approval_date: z.string().min(1, "Memo approval date is required"),
});

export const recruitmentRequisitionPositionSchema = z.object({
  position: z.string().min(1, "Position is required"),
  requesting_department: z.string().min(1, "Department is required"),
  number_of_positions: z.preprocess(
    (val) => Number(val),
    z.number().positive("Number of positions must be at least 1")
  ),
  grade_level: z.string().min(1, "Grade level is required"),
  fco_number: z.string().optional(),
  employment_type: z.enum(["PERMANENT", "CONTRACT", "TEMPORARY"]),
  job_type: z.enum(["Internal", "External", "Both"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const recruitmentRequisitionJustificationSchema = z.object({
  vacancy_reason: z.enum(["NEW_POSITION", "REPLACEMENT", "EXPANSION", "SUCCESSION", "TEMPORARY"]),
  business_justification: z.string().min(10, "Business justification is required (min 10 characters)"),
  impact_if_not_filled: z.string().min(10, "Impact description is required (min 10 characters)"),
});

export const recruitmentRequisitionRequirementsSchema = z.object({
  qualifications: z.string().min(10, "Qualifications are required"),
  key_responsibilities: z.string().min(10, "Key responsibilities are required"),
  experience_years: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative("Experience years cannot be negative")
  ),
  skills_required: z.string().optional(),
  language_requirements: z.string().optional(),
});

export const recruitmentRequisitionDetailsSchema = z.object({
  reporting_to: z.string().optional(),
  location: z.string().optional(),
  working_tools_available: z.boolean().default(false),
  required_start_date: z.string().min(1, "Required start date is required"),
  estimated_salary_range: z.string().min(1, "Estimated salary range is required"),
  budget_line: z.string().optional(),
  total_budget_estimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive("Budget estimate must be positive").optional()
  ),
  additional_notes: z.string().optional(),
});

export const recruitmentRequisitionApproversSchema = z.object({
  reviewer_id: z.string().uuid("Invalid reviewer ID"),
  authorizer_id: z.string().uuid("Invalid authorizer ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
});

// Complete recruitment requisition schema (combines all steps)
export const recruitmentRequisitionSchema = recruitmentRequisitionMemoSchema
  .merge(recruitmentRequisitionPositionSchema)
  .merge(recruitmentRequisitionJustificationSchema)
  .merge(recruitmentRequisitionRequirementsSchema)
  .merge(recruitmentRequisitionDetailsSchema)
  .merge(recruitmentRequisitionApproversSchema);

// Approval action schema
export const recruitmentRequisitionApprovalSchema = z.object({
  action: z.enum(["review", "authorize", "approve", "reject"]),
  comments: z.string().optional(),
});

// Convert to advertisement schema
export const convertToAdvertisementSchema = z.object({
  application_deadline: z.string().min(1, "Application deadline is required"),
  interview_date: z.string().optional(),
  additional_requirements: z.string().optional(),
});

export type HrContingentBeneficiaryFormValues = z.infer<
  typeof hrContingentBeneficiarySchema
>;

export type HrSignatoriesBeneficiaryFormValues = z.infer<
  typeof hrSignatoriesBeneficiarySchema
>;

export type HrJobAdvertismentFormValues = z.infer<typeof jobAdvertismentSchema>;
export type HrBeneficiaryFormValues = z.infer<typeof hrBeneficiarySchema>;
export type HrGradeFormValues = z.infer<typeof hrGradeSchema>;
export type WorkforceFormValues = z.infer<typeof workforceSchema>;
export type WorkforcePensionFormValues = z.infer<typeof workforcePensionSchema>;
export type HrEmergencyFormValues = z.infer<typeof hrEmergencySchema>;
export type WorkforceBankAccountFormValues = z.infer<
  typeof workforceBankAccountSchema
>;
export type WorkforceQualificationFormValues = z.infer<
  typeof workforceQualificationSchema
>;
export type hrSystemAuthorizationFormValues = z.infer<
  typeof hrSystemAuthorizationSchema
>;

// Recruitment Requisition Type Exports
export type RecruitmentRequisitionMemoFormValues = z.infer<typeof recruitmentRequisitionMemoSchema>;
export type RecruitmentRequisitionPositionFormValues = z.infer<typeof recruitmentRequisitionPositionSchema>;
export type RecruitmentRequisitionJustificationFormValues = z.infer<typeof recruitmentRequisitionJustificationSchema>;
export type RecruitmentRequisitionRequirementsFormValues = z.infer<typeof recruitmentRequisitionRequirementsSchema>;
export type RecruitmentRequisitionDetailsFormValues = z.infer<typeof recruitmentRequisitionDetailsSchema>;
export type RecruitmentRequisitionApproversFormValues = z.infer<typeof recruitmentRequisitionApproversSchema>;
export type RecruitmentRequisitionFormValues = z.infer<typeof recruitmentRequisitionSchema>;
export type RecruitmentRequisitionApprovalFormValues = z.infer<typeof recruitmentRequisitionApprovalSchema>;
export type ConvertToAdvertisementFormValues = z.infer<typeof convertToAdvertisementSchema>;
