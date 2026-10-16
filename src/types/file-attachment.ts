/**
 * File Attachment Types
 *
 * Used across the application for managing multiple file attachments
 * to various entities (Payment Requests, Reports, Deliverables, etc.)
 */

export type FileCategory =
  | 'INVOICE'
  | 'RECEIPT'
  | 'TIMESHEET'
  | 'REPORT'
  | 'APPENDIX'
  | 'SUPPORTING_DOC'
  | 'ITINERARY'
  | 'APPROVAL'
  | 'CONTRACT'
  | 'AGREEMENT'
  | 'ID_DOCUMENT'
  | 'CERTIFICATE'
  | 'MEMO'
  | 'OTHER';

export interface FileAttachment {
  id: string;
  file_url: string | null;
  original_filename: string;
  file_size: number;
  file_size_mb: number;
  file_type: string | null;
  file_extension: string;
  description: string;
  category: FileCategory;
  category_display: string;
  uploaded_by: string | null;
  created_at: string | null;
}

export interface FileAttachmentUploadData {
  files: File[];
  content_type: string;  // e.g., "adminapp.paymentrequest"
  object_id: string;
  descriptions?: string[];
  categories?: FileCategory[];
}

export interface FileAttachmentListParams {
  content_type: string;
  object_id: string;
}

export interface FileAttachmentResponse {
  status: boolean;
  message: string;
  data: {
    attachments: FileAttachment[];
    total: number;
  } | null;
}

export interface FileAttachmentUploadResponse {
  status: boolean;
  message: string;
  data: {
    attachments: FileAttachment[];
    total: number;
  } | null;
}

// Local file state for UI (before upload)
export interface PendingFile {
  id: string;  // Temporary client-side ID
  file: File;
  description: string;
  category: FileCategory;
  preview?: string;  // For image previews
  uploadProgress?: number;
}
