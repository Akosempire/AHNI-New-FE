/**
 * AHNi Staffing Requisition Types
 * Matches the backend StaffingRequisition model
 */

export enum NatureOfHire {
  EXTERNAL_ADVERT = "EXTERNAL_ADVERT",
  INTERNAL_ADVERT = "INTERNAL_ADVERT",
}

export enum PositionType {
  FIXED_TERM = "FIXED_TERM",
  PERMANENT = "PERMANENT",
  TEMPORARY = "TEMPORARY",
  CONSULTANCY = "CONSULTANCY",
}

export enum EmploymentStatus {
  FULL_TIME = "FULL_TIME",
  REDUCED_SCHEDULE = "REDUCED_SCHEDULE",
  TEMPORARY = "TEMPORARY",
  INTERN = "INTERN",
}

export enum RequisitionStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum OfficeType {
  HQ = "HQ",
  STATE = "STATE",
}

export enum PositionNature {
  NEW = "NEW",
  REPLACEMENT = "REPLACEMENT",
}

// Minimal types for nested objects
export interface MinimalUser {
  id: string;
  email: string;
  name: string;
}

export interface MinimalPosition {
  id: string;
  name: string;
  grade_level: string;
}

export interface MinimalDepartment {
  id: string;
  name: string;
}

export interface MinimalLocation {
  id: string;
  name: string;
  state: string;
}

// List item type (for table views)
export interface StaffingRequisitionListItem {
  id: string;
  requisition_code: string;
  date: string;
  position: MinimalPosition;
  department: MinimalDepartment;
  number_of_staff: number;
  status: RequisitionStatus;
  approval_progress: number;
  current_approver: MinimalUser | null;
  created_by: MinimalUser;
  created_at: string;
}

// Full detail type
export interface StaffingRequisition {
  // Primary fields
  id: string;
  requisition_code: string;
  date: string;

  // Position Details
  position: MinimalPosition;
  nature_of_hire: NatureOfHire;
  position_type: PositionType;
  department: MinimalDepartment;
  location: MinimalLocation | null;
  supervisor: string;
  fco_number: string;
  number_of_staff: number;
  expected_date_of_resumption: string;
  working_tools_available: boolean;
  employment_status: EmploymentStatus;

  // Job Information
  major_duties_responsibilities: string;
  language_requirements: string;
  justification: string;

  // Conditional Fields
  office_type: OfficeType;
  position_nature: PositionNature;

  // Requisition Review
  grade_level: string;
  hiring_manager: MinimalUser | null;
  hiring_manager_approved_at: string | null;
  hiring_manager_comments: string;
  dof: MinimalUser | null;
  dof_approved_at: string | null;
  dof_comments: string;
  hr_reviewer: MinimalUser | null;
  hr_approved_at: string | null;
  hr_comments: string;

  // Approvals
  spm_stl: MinimalUser | null;
  spm_stl_approved_at: string | null;
  spm_stl_comments: string;
  director_of_operations: MinimalUser | null;
  director_of_operations_approved_at: string | null;
  director_of_operations_comments: string;
  managing_director: MinimalUser | null;
  managing_director_approved_at: string | null;
  managing_director_comments: string;

  // Status & Metadata
  status: RequisitionStatus;
  rejected_by: MinimalUser | null;
  rejected_at: string | null;
  rejection_reason: string;
  created_by: MinimalUser;
  created_at: string;
  updated_at: string;

  // Computed fields
  approval_progress: number;
  is_fully_approved: boolean;
  required_approvals: string[];
  completed_approvals: string[];
  current_approver: MinimalUser | null;
}

// Create/Update payload type
export interface StaffingRequisitionFormData {
  // Position Details
  position: string; // UUID
  nature_of_hire: NatureOfHire;
  position_type: PositionType;
  department: string; // UUID
  location?: string; // UUID
  supervisor: string;
  fco_number?: string;
  number_of_staff: number;
  expected_date_of_resumption: string;
  working_tools_available: boolean;
  employment_status: EmploymentStatus;

  // Job Information
  major_duties_responsibilities: string;
  language_requirements: string;
  justification: string;

  // Conditional Fields
  office_type: OfficeType;
  position_nature: PositionNature;

  // Requisition Review
  grade_level: string;
  hiring_manager: string; // UUID
  dof?: string; // UUID - Required for NEW positions
  hr_reviewer: string; // UUID

  // Approvals
  spm_stl?: string; // UUID - Required for STATE offices
  director_of_operations: string; // UUID
  managing_director: string; // UUID

  // Status
  status?: RequisitionStatus;
}

// Approval action payload
export interface ApprovalActionData {
  action: "approve" | "reject";
  comments?: string;
}

// Display labels
export const NATURE_OF_HIRE_LABELS: Record<NatureOfHire, string> = {
  [NatureOfHire.EXTERNAL_ADVERT]: "External Advert",
  [NatureOfHire.INTERNAL_ADVERT]: "Internal Advert",
};

export const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  [PositionType.FIXED_TERM]: "Fixed Term",
  [PositionType.PERMANENT]: "Permanent",
  [PositionType.TEMPORARY]: "Temporary",
  [PositionType.CONSULTANCY]: "Consultancy",
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  [EmploymentStatus.FULL_TIME]: "Full Time",
  [EmploymentStatus.REDUCED_SCHEDULE]: "Reduced Schedule",
  [EmploymentStatus.TEMPORARY]: "Temporary",
  [EmploymentStatus.INTERN]: "Intern",
};

export const REQUISITION_STATUS_LABELS: Record<RequisitionStatus, string> = {
  [RequisitionStatus.DRAFT]: "Draft",
  [RequisitionStatus.PENDING_REVIEW]: "Pending Review",
  [RequisitionStatus.PENDING_APPROVAL]: "Pending Approval",
  [RequisitionStatus.APPROVED]: "Approved",
  [RequisitionStatus.REJECTED]: "Rejected",
  [RequisitionStatus.CANCELLED]: "Cancelled",
};

export const OFFICE_TYPE_LABELS: Record<OfficeType, string> = {
  [OfficeType.HQ]: "Headquarters",
  [OfficeType.STATE]: "State Office",
};

export const POSITION_NATURE_LABELS: Record<PositionNature, string> = {
  [PositionNature.NEW]: "New Position",
  [PositionNature.REPLACEMENT]: "Replacement",
};
