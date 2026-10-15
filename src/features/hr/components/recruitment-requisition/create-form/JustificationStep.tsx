"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormSelect, FormSelectItem } from "@/components/forms/FormComponents";
import { FormTextarea } from "@/components/forms/FormComponents";

interface JustificationStepProps {
  form: UseFormReturn<any>;
}

export default function JustificationStep({ form }: JustificationStepProps) {
  return (
    <div className="space-y-6">
      {/* Vacancy Reason */}
      <FormSelect
        form={form}
        name="vacancy_reason"
        label="Vacancy Reason"
        required
        helpText="Why is this position needed?"
      >
        <FormSelectItem value="NEW_POSITION">New Position</FormSelectItem>
        <FormSelectItem value="REPLACEMENT">Replacement</FormSelectItem>
        <FormSelectItem value="EXPANSION">Department Expansion</FormSelectItem>
        <FormSelectItem value="SUCCESSION">Succession Planning</FormSelectItem>
        <FormSelectItem value="TEMPORARY">Temporary Need</FormSelectItem>
      </FormSelect>

      {/* Business Justification */}
      <FormTextarea
        form={form}
        name="business_justification"
        label="Business Justification"
        placeholder="Provide detailed business justification for this recruitment..."
        rows={6}
        required
        helpText="Explain why this position is necessary from a business perspective (minimum 10 characters)"
      />

      {/* Impact If Not Filled */}
      <FormTextarea
        form={form}
        name="impact_if_not_filled"
        label="Impact If Not Filled"
        placeholder="Describe what will happen if this position is not filled..."
        rows={6}
        required
        helpText="Explain the consequences of not filling this position (minimum 10 characters)"
      />
    </div>
  );
}
