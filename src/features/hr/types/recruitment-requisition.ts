// Recruitment Requisition Types

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  designation?: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  state?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export interface BudgetLine {
  id: string;
  name: string;
  code: string;
}

export interface JobAdvertisementMinimal {
  id: string;
  position_title: string;
  status: string;
}

export enum RequisitionStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  CONVERTED_TO_AD = "CONVERTED_TO_AD",
}

export enum RequisitionPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum VacancyReason {
  NEW_POSITION = "NEW_POSITION",
  REPLACEMENT = "REPLACEMENT",
  EXPANSION = "EXPANSION",
  SUCCESSION = "SUCCESSION",
  TEMPORARY = "TEMPORARY",
}

export enum EmploymentType {
  PERMANENT = "PERMANENT",
  CONTRACT = "CONTRACT",
  TEMPORARY = "TEMPORARY",
}

export enum JobType {
  INTERNAL = "Internal",
  EXTERNAL = "External",
  BOTH = "Both",
}

// List view model (optimized)
export interface RecruitmentRequisitionList {
  id: string;
  requisition_number: string;
  position: Position;
  requesting_department: Department;
  location?: Location;
  number_of_positions: number;
  grade_level: string;
  employment_type: EmploymentType;
  employment_type_display: string;
  job_type: JobType;
  priority: RequisitionPriority;
  priority_display: string;
  required_start_date: string;
  status: RequisitionStatus;
  status_display: string;
  reviewer_detail: User;
  authorizer_detail: User;
  approver_detail: User;
  reviewed_at?: string;
  authorized_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_by: User;
  created_datetime: string;
  updated_datetime: string;
}

// Detail view model (complete)
export interface RecruitmentRequisition {
  id: string;
  requisition_number: string;

  // Memo fields
  memo_document: string; // File URL
  memo_reference: string;
  memo_approved_by_name: string;
  memo_approval_date: string;

  // Position details
  position: Position;
  requesting_department: Department;
  number_of_positions: number;
  grade_level: string;
  employment_type: EmploymentType;
  employment_type_display: string;
  job_type: JobType;
  job_type_display: string;
  priority: RequisitionPriority;
  priority_display: string;

  // Vacancy justification
  vacancy_reason: VacancyReason;
  vacancy_reason_display: string;
  business_justification: string;
  impact_if_not_filled: string;

  // Requirements
  qualifications: string;
  key_responsibilities: string;
  experience_years: number;
  skills_required?: string;

  // Reporting & Location
  reporting_to?: Employee;
  location?: Location;

  // Timeline & Budget
  required_start_date: string;
  estimated_salary_range: string;
  budget_line?: BudgetLine;
  total_budget_estimate?: number;

  // Additional
  additional_notes?: string;

  // Approvers
  reviewer: string;
  reviewer_detail: User;
  authorizer: string;
  authorizer_detail: User;
  approver: string;
  approver_detail: User;

  // Approval tracking
  reviewed_at?: string;
  reviewed_by?: string;
  reviewed_by_detail?: User;
  review_comments?: string;

  authorized_at?: string;
  authorized_by?: string;
  authorized_by_detail?: User;
  authorization_comments?: string;

  approved_at?: string;
  approved_by?: string;
  approved_by_detail?: User;
  approval_comments?: string;

  // Rejection tracking
  rejected_at?: string;
  rejected_by?: string;
  rejected_by_detail?: User;
  rejection_reason?: string;

  // Status
  status: RequisitionStatus;
  status_display: string;

  // Conversion
  converted_to_advertisement: boolean;
  job_advertisement?: JobAdvertisementMinimal;
  converted_by?: string;
  converted_by_detail?: User;
  converted_at?: string;

  // Helper properties
  approval_progress: number;
  current_approver?: User;
  can_be_edited: boolean;
  can_be_deleted: boolean;
  can_be_converted: boolean;

  // Audit
  created_by: User;
  updated_by?: User;
  created_datetime: string;
  updated_datetime: string;
}

// Create/Update request model
export interface RecruitmentRequisitionCreateRequest {
  // Memo fields (REQUIRED)
  memo_document: File | string;
  memo_reference: string;
  memo_approved_by_name: string;
  memo_approval_date: string;

  // Position details
  position: string; // UUID
  requesting_department: string; // UUID
  number_of_positions: number;
  grade_level: string;
  employment_type: EmploymentType;
  job_type: JobType;
  priority: RequisitionPriority;

  // Vacancy justification
  vacancy_reason: VacancyReason;
  business_justification: string;
  impact_if_not_filled: string;

  // Requirements
  qualifications: string;
  key_responsibilities: string;
  experience_years: number;
  skills_required?: string;

  // Reporting & Location
  reporting_to?: string; // UUID
  location?: string; // UUID

  // Timeline & Budget
  required_start_date: string;
  estimated_salary_range: string;
  budget_line?: string; // UUID
  total_budget_estimate?: number;

  // Additional
  additional_notes?: string;

  // Approvers (UUIDs)
  reviewer_id: string;
  authorizer_id: string;
  approver_id: string;
}

// Approval action request
export interface ApprovalActionRequest {
  action: "review" | "authorize" | "approve" | "reject";
  comments?: string;
}

// Convert to advertisement request
export interface ConvertToAdvertisementRequest {
  application_deadline: string;
  application_email: string;
  interview_date?: string;
  additional_requirements?: string;
}

// API Response wrapper
export interface RecruitmentRequisitionResponse {
  status: boolean;
  message: string;
  data: RecruitmentRequisition | RecruitmentRequisitionList | RecruitmentRequisition[];
}
