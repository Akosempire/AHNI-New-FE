"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/forms/FormComponents";
import { FormTextarea } from "@/components/forms/FormComponents";

interface RequirementsStepProps {
  form: UseFormReturn<any>;
}

export default function RequirementsStep({ form }: RequirementsStepProps) {
  return (
    <div className="space-y-6">
      {/* Qualifications */}
      <FormTextarea
        form={form}
        name="qualifications"
        label="Required Qualifications"
        placeholder="List educational qualifications and certifications required..."
        rows={5}
        required
        helpText="Educational qualifications and certifications required (e.g., Bachelor's degree in Computer Science)"
      />

      {/* Key Responsibilities */}
      <FormTextarea
        form={form}
        name="key_responsibilities"
        label="Key Responsibilities"
        placeholder="List the main responsibilities of this position..."
        rows={6}
        required
        helpText="Main responsibilities and duties of the position"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Years */}
        <FormInput
          form={form}
          name="experience_years"
          label="Years of Experience Required"
          type="number"
          min={0}
          required
          helpText="Minimum years of relevant experience"
        />
      </div>

      {/* Skills Required */}
      <FormTextarea
        form={form}
        name="skills_required"
        label="Skills Required (Optional)"
        placeholder="List key skills and competencies required..."
        rows={4}
        helpText="Key technical and soft skills needed for this role"
      />

      {/* Language Requirements */}
      <FormTextarea
        form={form}
        name="language_requirements"
        label="Language Requirements (Optional)"
        placeholder="e.g., Fluency in English required; Hausa, Igbo, or Yoruba is an advantage"
        rows={3}
        helpText="Required languages for this position"
      />
    </div>
  );
}
