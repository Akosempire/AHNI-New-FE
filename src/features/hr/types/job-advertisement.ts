// Job Advertisement Types - Matches backend JobAdvertisement model

export interface JobAdvertisementModel {
  status?: string;
  message?: string;
  data?: JobAdvertisement;
}

export interface Position {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  state?: string;
}

export interface Interviewer {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  mobile_number?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Comprehensive JobAdvertisement interface matching backend model
export interface JobAdvertisement {
  id?: string;

  // Organization & Advertisement Header
  advertisement_title?: string;
  organization_name?: string;
  organization_background?: string;
  organization_location?: string;

  // Project Context (for project-based positions)
  project_name?: string;
  project_duration?: string;
  project_location?: string;
  project_objectives?: string;
  project_scope?: string;
  donor_name?: string;

  // Position Details
  title?: string;
  position?: Position | string;
  grade?: Grade | string;
  level?: Level | string;
  contract_type?: "FIXED_TERM" | "PERMANENT" | "TEMPORARY" | "CONSULTANCY";
  position_type?: "PROGRAMS" | "TECHNICAL" | "OPERATIONS" | "FINANCE" | "ADMIN";
  position_category?: string;
  project_tag?: string;
  locations?: Location[] | string;
  job_type?: string;
  duration?: string;
  commencement_date?: Date | string;
  number_of_positions?: number;
  supervisor?: string;

  // Role Description & Responsibilities
  role_description?: string;
  background?: string;

  // Requirements & Qualifications
  education_requirements?: string;
  professional_certifications?: string;
  experience_years_min?: number;
  experience_years_max?: number;
  experience_requirements?: string;
  donor_experience?: string;
  technical_skills?: string;
  soft_skills?: string;
  location_context_requirement?: string;
  any_other_info?: string;

  // Application Details
  application_deadline?: Date | string;
  application_email?: string;
  application_method?: string;
  application_instructions?: string;
  application_format?: string;
  subject_line_format?: string;
  rolling_basis?: boolean;
  interview_date?: Date | string;
  salary_range?: string;

  // Status & Publication
  status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";
  is_published?: boolean;
  published_date?: Date | string;
  published_by?: User | string;
  closing_date?: Date | string;

  // Additional Statements
  equal_opportunity_statement?: string;
  disclaimer?: string;
  shortlist_notification?: string;
  contact_only_shortlisted?: boolean;

  // Documents & Resources
  advert_document?: string | File;
  interviewers?: Interviewer[] | string[];

  // Audit Fields
  created_datetime?: Date | string;
  updated_datetime?: Date | string;
  created_by?: User | string;
  updated_by?: User | string | null;
}

// Form input type for creating/updating advertisements
export interface JobAdvertisementFormInput {
  // Organization & Advertisement Header
  advertisement_title?: string;
  organization_name?: string;
  organization_background?: string;
  organization_location?: string;

  // Project Context
  project_name?: string;
  project_duration?: string;
  project_location?: string;
  project_objectives?: string;
  project_scope?: string;
  donor_name?: string;

  // Position Details
  title?: string;
  position?: string; // UUID
  grade?: string; // UUID
  level?: string; // UUID
  contract_type?: string;
  position_type?: string;
  position_category?: string;
  project_tag?: string;
  locations?: string; // UUID or comma-separated UUIDs
  job_type?: string;
  duration?: string;
  commencement_date?: string;
  number_of_positions?: number;
  supervisor?: string;

  // Role Description
  role_description?: string;
  background?: string;

  // Requirements
  education_requirements?: string;
  professional_certifications?: string;
  experience_years_min?: number;
  experience_years_max?: number;
  experience_requirements?: string;
  donor_experience?: string;
  technical_skills?: string;
  soft_skills?: string;
  location_context_requirement?: string;
  any_other_info?: string;

  // Application Details
  application_deadline?: string;
  application_email?: string;
  application_method?: string;
  application_instructions?: string;
  application_format?: string;
  subject_line_format?: string;
  rolling_basis?: boolean;
  interview_date?: string;
  salary_range?: string;

  // Status
  status?: string;

  // Additional Statements
  equal_opportunity_statement?: string;
  disclaimer?: string;
  shortlist_notification?: string;
  contact_only_shortlisted?: boolean;

  // Documents
  advert_document?: File | FileList | null;
  interviewers?: string[]; // Array of UUIDs
}

// Converts JSON strings to/from your types
export class Convert {
  public static toJobAdvertisementModel(json: string): JobAdvertisementModel {
    return JSON.parse(json);
  }

  public static jobAdvertisementModelToJson(
    value: JobAdvertisementModel
  ): string {
    return JSON.stringify(value);
  }
}
