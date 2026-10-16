"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText, File as FileIcon, Image, FileCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PendingFile, FileCategory, FileAttachment } from "@/types/file-attachment";
import { useFileAttachments, useUploadFileAttachments, useDeleteFileAttachment } from "@/controllers/fileAttachmentController";

// Generate unique ID
const generateId = () => crypto.randomUUID();

interface FileUploadManagerProps {
  contentType: string;  // e.g., "adminapp.paymentrequest"
  objectId: string;
  maxFiles?: number;
  maxFileSize?: number;  // in MB
  allowedFileTypes?: string[];
  showCategorySelect?: boolean;
  defaultCategory?: FileCategory;
  className?: string;
}

const FILE_CATEGORIES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'TIMESHEET', label: 'Timesheet' },
  { value: 'REPORT', label: 'Report' },
  { value: 'APPENDIX', label: 'Appendix' },
  { value: 'SUPPORTING_DOC', label: 'Supporting Document' },
  { value: 'ITINERARY', label: 'Itinerary' },
  { value: 'APPROVAL', label: 'Approval Document' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'AGREEMENT', label: 'Agreement' },
  { value: 'ID_DOCUMENT', label: 'ID Document' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'MEMO', label: 'Memo' },
  { value: 'OTHER', label: 'Other' },
];

export default function FileUploadManager({
  contentType,
  objectId,
  maxFiles = 10,
  maxFileSize = 50,  // 50MB default
  allowedFileTypes,
  showCategorySelect = true,
  defaultCategory = 'OTHER',
  className = '',
}: FileUploadManagerProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing attachments
  const { data: attachmentsData, isLoading } = useFileAttachments({
    content_type: contentType,
    object_id: objectId,
  }, !!objectId);

  const uploadMutation = useUploadFileAttachments();
  const deleteMutation = useDeleteFileAttachment();

  const existingAttachments = attachmentsData?.data?.attachments || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Check total file count
    const totalFiles = existingAttachments.length + pendingFiles.length + files.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - existingAttachments.length - pendingFiles.length} more files.`);
      return;
    }

    // Validate each file
    const validFiles: PendingFile[] = [];
    for (const file of files) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds maximum size of ${maxFileSize}MB`);
        continue;
      }

      // Check file type if restricted
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedFileTypes.includes(`.${fileExtension}`)) {
          toast.error(`${file.name} is not an allowed file type. Allowed: ${allowedFileTypes.join(', ')}`);
          continue;
        }
      }

      validFiles.push({
        id: generateId(),
        file,
        description: '',
        category: defaultCategory,
      });
    }

    setPendingFiles([...pendingFiles, ...validFiles]);
    toast.success(`${validFiles.length} file(s) added`);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles(pendingFiles.filter(f => f.id !== id));
  };

  const updatePendingFile = (id: string, updates: Partial<PendingFile>) => {
    setPendingFiles(pendingFiles.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const uploadFiles = async () => {
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    uploadMutation.mutate({
      files: pendingFiles.map(pf => pf.file),
      content_type: contentType,
      object_id: objectId,
      descriptions: pendingFiles.map(pf => pf.description),
      categories: pendingFiles.map(pf => pf.category),
    }, {
      onSuccess: (data) => {
        toast.success(data.message || 'Files uploaded successfully');
        setPendingFiles([]);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
        toast.error(errorMessage);
      },
    });
  };

  const deleteAttachment = async (attachmentId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    deleteMutation.mutate(attachmentId, {
      onSuccess: () => {
        toast.success('File deleted successfully');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Delete failed';
        toast.error(errorMessage);
      },
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700"
            >
              Click to upload files
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileSelect}
                multiple
                accept={allowedFileTypes?.join(',') || undefined}
              />
            </label>
            <span className="text-sm text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {allowedFileTypes?.length ? `Allowed types: ${allowedFileTypes.join(', ')}` : 'All file types allowed'} • Max {maxFileSize}MB per file • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Pending Files (Not Yet Uploaded) */}
      {pendingFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Files to Upload ({pendingFiles.length})</h3>
            <Button
              size="sm"
              onClick={uploadFiles}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>

          <div className="space-y-2">
            {pendingFiles.map((pendingFile) => (
              <div key={pendingFile.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                {getFileIcon(pendingFile.file.name)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pendingFile.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(pendingFile.file.size)}</p>

                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Description (optional)"
                      value={pendingFile.description}
                      onChange={(e) => updatePendingFile(pendingFile.id, { description: e.target.value })}
                      className="text-xs h-8"
                    />

                    {showCategorySelect && (
                      <Select
                        value={pendingFile.category}
                        onValueChange={(value) => updatePendingFile(pendingFile.id, { category: value as FileCategory })}
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePendingFile(pendingFile.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Existing Attachments */}
      {isLoading && <p className="text-sm text-gray-500">Loading attachments...</p>}

      {!isLoading && existingAttachments.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Uploaded Files ({existingAttachments.length})</h3>

          <div className="space-y-2">
            {existingAttachments.map((attachment) => (
              <div key={attachment.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                {getFileIcon(attachment.original_filename)}

                <div className="flex-1 min-w-0">
                  <a
                    href={attachment.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:underline truncate block"
                  >
                    {attachment.original_filename}
                  </a>
                  <p className="text-xs text-gray-500">
                    {attachment.file_size_mb} MB • {attachment.category_display}
                  </p>
                  {attachment.description && (
                    <p className="text-xs text-gray-600 mt-1">{attachment.description}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAttachment(attachment.id, attachment.original_filename)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isLoading && existingAttachments.length === 0 && pendingFiles.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No files uploaded yet. Click above to add files.
        </p>
      )}
    </div>
  );
}
