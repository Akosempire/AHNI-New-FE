"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Send, AlertCircle, Upload, X, File } from "lucide-react";
import { toast } from "sonner";

// Validation schema for RFP proposal submission
const RFPProposalSchema = z.object({
  notes: z.string().min(50, "Proposal must be at least 50 characters").max(10000, "Proposal is too long"),
  documents: z.any().optional(), // File validation handled separately
});

type RFPProposalFormData = z.infer<typeof RFPProposalSchema>;

interface RFPProposalFormProps {
  rfpId: string;
  onSubmit: (data: FormData) => Promise<void>;
  onSaveDraft?: (data: RFPProposalFormData & { documents: File[] }) => Promise<void>;
  initialData?: Partial<RFPProposalFormData>;
}

export function RFPProposalForm({
  rfpId,
  onSubmit,
  onSaveDraft,
  initialData,
}: RFPProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentError, setDocumentError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RFPProposalFormData>({
    resolver: zodResolver(RFPProposalSchema),
    defaultValues: initialData || {
      notes: "",
    },
  });

  const watchedNotes = watch("notes");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types (PDF, DOCX, XLSX, images)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'image/jpeg',
      'image/png',
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setDocumentError(`Invalid file type: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setDocumentError(`File too large: ${oversizedFiles.map(f => f.name).join(', ')} (max 10MB)`);
      return;
    }

    setDocumentError("");
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: RFPProposalFormData) => {
    // Validate at least one document
    if (documents.length === 0) {
      setDocumentError("At least one document is required for RFP submission");
      toast.error("Please upload at least one document");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("rfp_id", rfpId);
      formData.append("notes", data.notes);
      formData.append("status", "SUBMITTED");

      // Append all documents
      documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });

      await onSubmit(formData);
      toast.success("Proposal submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSavingDraft(true);
    try {
      const data = watch();
      await onSaveDraft({ ...data, documents });
      toast.success("Draft saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Instructions */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Provide a comprehensive proposal narrative and upload supporting documents (technical proposal, financial proposal, company profile, etc.)
        </AlertDescription>
      </Alert>

      {/* Proposal Narrative */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal Narrative</CardTitle>
          <CardDescription>
            Describe your proposal, approach, and why you are the best fit for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">
              Proposal Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Provide a detailed description of your proposal including:
- Your understanding of the requirements
- Your approach and methodology
- Your team's qualifications and experience
- Timeline and deliverables
- Any unique value propositions"
              rows={12}
              {...register("notes")}
              className={errors.notes ? "border-red-500" : ""}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.notes && (
                <p className="text-xs text-red-500">{errors.notes.message}</p>
              )}
              <p className={`text-xs ml-auto ${
                watchedNotes.length < 50 ? 'text-red-500' :
                watchedNotes.length > 9000 ? 'text-orange-500' :
                'text-gray-500'
              }`}>
                {watchedNotes.length} / 10,000 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload technical proposal, financial proposal, company profile, certifications, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload documents
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOCX, XLSX, or images (max 10MB each)
                  </p>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </Label>
            {documentError && (
              <p className="text-xs text-red-500 mt-2">{documentError}</p>
            )}
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents ({documents.length})</Label>
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <File className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Requirements Alert */}
          {documents.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                At least one document is required to submit your proposal
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submission Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-800 font-medium">Proposal Length</p>
              <p className="text-2xl font-bold text-blue-900">
                {watchedNotes.length} chars
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Documents Attached</p>
              <p className="text-2xl font-bold text-blue-900">
                {documents.length} file{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors Alert */}
      {(Object.keys(errors).length > 0 || documentError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors above before submitting your proposal.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isSavingDraft || documents.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Proposal"}
        </Button>
      </div>
    </form>
  );
}
