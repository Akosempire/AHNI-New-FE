"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormInput } from "@/components/forms/FormComponents";
import { FormDatePicker } from "@/components/forms/FormComponents";
import { FileUp, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useParseMemo } from "@/features/hr/controllers/recruitmentRequisitionController";

interface MemoUploadStepProps {
  form: UseFormReturn<any>;
}

export default function MemoUploadStep({ form }: MemoUploadStepProps) {
  const [fileName, setFileName] = React.useState<string>("");
  const [isParsing, setIsParsing] = React.useState<boolean>(false);
  const [parseStatus, setParseStatus] = React.useState<"idle" | "success" | "error">("idle");
  const { parseMemo } = useParseMemo();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue("memo_document", file);
      form.trigger("memo_document");

      // Parse the memo document
      setIsParsing(true);
      setParseStatus("idle");

      try {
        const response = await parseMemo(file);

        if (response.status && response.data) {
          const { memo_reference, memo_approved_by_name, memo_approval_date } = response.data;

          // Auto-populate fields if data was extracted
          if (memo_reference) {
            form.setValue("memo_reference", memo_reference);
          }
          if (memo_approved_by_name) {
            form.setValue("memo_approved_by_name", memo_approved_by_name);
          }
          if (memo_approval_date) {
            form.setValue("memo_approval_date", memo_approval_date);
          }

          // Show success message
          const extractedFields = [
            memo_reference && "reference",
            memo_approved_by_name && "approver",
            memo_approval_date && "date"
          ].filter(Boolean);

          if (extractedFields.length > 0) {
            setParseStatus("success");
            toast.success(`Memo parsed successfully! Extracted: ${extractedFields.join(", ")}`);
          } else {
            setParseStatus("error");
            toast.warning("Memo uploaded but no information could be extracted. Please fill in the fields manually.");
          }
        } else {
          setParseStatus("error");
          toast.warning("Could not parse memo. Please fill in the fields manually.");
        }
      } catch (error: any) {
        setParseStatus("error");
        toast.error(error.message || "Failed to parse memo. Please fill in the fields manually.");
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Before creating a recruitment requisition, you must upload the approved memo from management.
          This memo serves as the authorization document for initiating the recruitment process.
          The system will automatically extract memo details from the document.
        </AlertDescription>
      </Alert>

      {/* Memo Document Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Approved Memo Document <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="memo_document"
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
              isParsing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isParsing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <FileUp className="w-5 h-5 mr-2" />
                Choose File
              </>
            )}
          </label>
          <input
            id="memo_document"
            name="memo_document"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={isParsing}
          />
          {fileName && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Selected: {fileName}</span>
              {parseStatus === "success" && (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
              {parseStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
          )}
        </div>
        {form.formState.errors.memo_document && (
          <p className="text-sm text-red-600">
            {form.formState.errors.memo_document.message as string}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Upload the signed/approved recruitment memo (PDF, DOC, or DOCX format). The system will automatically extract memo details.
        </p>
      </div>

      {/* Parsing Status Alert */}
      {isParsing && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            <strong>Parsing memo...</strong> Extracting reference number, approver, and approval date from the document.
          </AlertDescription>
        </Alert>
      )}

      {parseStatus === "success" && !isParsing && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Memo parsed successfully!</strong> Fields have been auto-populated. Please review and edit if needed.
          </AlertDescription>
        </Alert>
      )}

      {parseStatus === "error" && !isParsing && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Could not extract all details.</strong> Please fill in the fields manually below.
          </AlertDescription>
        </Alert>
      )}

      {/* Memo Reference Number */}
      <FormInput
        form={form}
        name="memo_reference"
        label="Memo Reference Number"
        placeholder="e.g., MEMO/HR/2026/001"
        required
        helpText="Enter the official reference number from the approved memo"
      />

      {/* Memo Approved By */}
      <FormInput
        form={form}
        name="memo_approved_by_name"
        label="Memo Approved By"
        placeholder="e.g., John Doe - Managing Director"
        required
        helpText="Name and title of the person who approved the memo"
      />

      {/* Memo Approval Date */}
      <FormDatePicker
        form={form}
        name="memo_approval_date"
        label="Memo Approval Date"
        required
        helpText="Date when the memo was approved"
      />
    </div>
  );
}
