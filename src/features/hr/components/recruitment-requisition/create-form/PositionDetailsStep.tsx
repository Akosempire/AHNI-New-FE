"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/forms/FormComponents";
import { FormSelect, FormSelectItem } from "@/components/forms/FormComponents";
import { useGetAllPositions } from "@/features/modules/controllers/config/positionController";
import { useGetAllDepartments } from "@/features/modules/controllers/config/departmentController";

interface PositionDetailsStepProps {
  form: UseFormReturn<any>;
}

export default function PositionDetailsStep({ form }: PositionDetailsStepProps) {
  const { data: positionsData, isLoading: loadingPositions } = useGetAllPositions({
    page: 1,
    size: 1000,
  });

  const { data: departmentsData, isLoading: loadingDepartments } = useGetAllDepartments({
    page: 1,
    size: 1000,
  });

  const positions = positionsData?.data?.results || [];
  const departments = departmentsData?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Position */}
      <FormSelect
        form={form}
        name="position"
        label="Position"
        placeholder={loadingPositions ? "Loading positions..." : "Select position"}
        required
        helpText="Select the position being recruited for"
      >
        {!loadingPositions && positions.map((position: any) => (
          <FormSelectItem key={position.id} value={position.id}>
            {position.name}
          </FormSelectItem>
        ))}
      </FormSelect>

      {/* Requesting Department */}
      <FormSelect
        form={form}
        name="requesting_department"
        label="Requesting Department"
        placeholder={loadingDepartments ? "Loading departments..." : "Select department"}
        required
        helpText="Department requesting the recruitment"
      >
        {!loadingDepartments && departments.map((dept: any) => (
          <FormSelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </FormSelectItem>
        ))}
      </FormSelect>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of Positions */}
        <FormInput
          form={form}
          name="number_of_positions"
          label="Number of Positions"
          type="number"
          min={1}
          required
          helpText="How many positions to fill"
        />

        {/* Grade Level */}
        <FormInput
          form={form}
          name="grade_level"
          label="Grade Level"
          placeholder="e.g., Grade 7, Level 3"
          required
          helpText="Grade level for the position"
        />
      </div>

      {/* FCO Number */}
      <FormInput
        form={form}
        name="fco_number"
        label="FCO Number (Optional)"
        placeholder="e.g., FCO/2026/001"
        helpText="Facility/Cost Center/Office Number for budget tracking"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment Type */}
        <FormSelect
          form={form}
          name="employment_type"
          label="Employment Type"
          required
          helpText="Type of employment contract"
        >
          <FormSelectItem value="PERMANENT">Permanent</FormSelectItem>
          <FormSelectItem value="CONTRACT">Contract</FormSelectItem>
          <FormSelectItem value="TEMPORARY">Temporary</FormSelectItem>
        </FormSelect>

        {/* Job Type */}
        <FormSelect
          form={form}
          name="job_type"
          label="Job Type"
          required
          helpText="Internal, external, or both"
        >
          <FormSelectItem value="Internal">Internal Only</FormSelectItem>
          <FormSelectItem value="External">External Only</FormSelectItem>
          <FormSelectItem value="Both">Both Internal & External</FormSelectItem>
        </FormSelect>
      </div>

      {/* Priority */}
      <FormSelect
        form={form}
        name="priority"
        label="Priority Level"
        required
        helpText="Urgency level of this recruitment"
      >
        <FormSelectItem value="LOW">Low</FormSelectItem>
        <FormSelectItem value="MEDIUM">Medium</FormSelectItem>
        <FormSelectItem value="HIGH">High</FormSelectItem>
        <FormSelectItem value="URGENT">Urgent</FormSelectItem>
      </FormSelect>
    </div>
  );
}
