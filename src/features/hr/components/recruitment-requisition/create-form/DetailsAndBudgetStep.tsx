"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/forms/FormComponents";
import { FormSelect, FormSelectItem } from "@/components/forms/FormComponents";
import { FormDatePicker } from "@/components/forms/FormComponents";
import { FormTextarea } from "@/components/forms/FormComponents";
import { FormCheckbox } from "@/components/forms/FormComponents";
import { useGetEmployeesForPayroll } from "@/features/hr/controllers/hrPayRollController";
import { useGetAllLocations } from "@/features/modules/controllers/config/locationController";
import { useGetAllBudgetLines } from "@/features/modules/controllers/finance/budgetLineController";

interface DetailsAndBudgetStepProps {
  form: UseFormReturn<any>;
}

export default function DetailsAndBudgetStep({ form }: DetailsAndBudgetStepProps) {
  const { data: employeesData, isLoading: loadingEmployees } = useGetEmployeesForPayroll(true);

  const { data: locationsData, isLoading: loadingLocations } = useGetAllLocations({
    page: 1,
    size: 1000,
  });

  const { data: budgetLinesData, isLoading: loadingBudgetLines } = useGetAllBudgetLines({
    page: 1,
    size: 1000,
  });

  const employees = employeesData?.data?.results || [];
  const locations = locationsData?.data?.results || [];
  const budgetLines = budgetLinesData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporting To */}
        <FormSelect
          form={form}
          name="reporting_to"
          label="Reporting To (Optional)"
          placeholder="Select supervisor"
          helpText="Person/position this role will report to"
        >
          <FormSelectItem value="">None</FormSelectItem>
          {loadingEmployees ? (
            <FormSelectItem value="">Loading employees...</FormSelectItem>
          ) : (
            employees.map((employee: any) => (
              <FormSelectItem key={employee.id} value={employee.id}>
                {employee.legal_firstname} {employee.legal_lastname} - {employee.employee_number}
              </FormSelectItem>
            ))
          )}
        </FormSelect>

        {/* Location */}
        <FormSelect
          form={form}
          name="location"
          label="Work Location (Optional)"
          placeholder="Select location"
          helpText="Primary work location for this position"
        >
          <FormSelectItem value="">Not specified</FormSelectItem>
          {loadingLocations ? (
            <FormSelectItem value="">Loading locations...</FormSelectItem>
          ) : (
            locations.map((location: any) => (
              <FormSelectItem key={location.id} value={location.id}>
                {location.name} {location.state ? `- ${location.state}` : ""}
              </FormSelectItem>
            ))
          )}
        </FormSelect>
      </div>

      {/* Working Tools Available */}
      <FormCheckbox
        form={form}
        name="working_tools_available"
        label="Working Tools Available"
        helpText="Check if workspace and equipment are ready for this position"
      />

      {/* Required Start Date */}
      <FormDatePicker
        form={form}
        name="required_start_date"
        label="Required Start Date"
        required
        helpText="Expected/required start date for the hire"
      />

      {/* Estimated Salary Range */}
      <FormInput
        form={form}
        name="estimated_salary_range"
        label="Estimated Salary Range"
        placeholder="e.g., NGN 200,000 - 300,000 per month"
        required
        helpText="Salary range for this position"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Line */}
        <FormSelect
          form={form}
          name="budget_line"
          label="Budget Line (Optional)"
          placeholder="Select budget line"
          helpText="Budget line for this recruitment"
        >
          <FormSelectItem value="">None</FormSelectItem>
          {loadingBudgetLines ? (
            <FormSelectItem value="">Loading budget lines...</FormSelectItem>
          ) : (
            budgetLines.map((budgetLine: any) => (
              <FormSelectItem key={budgetLine.id} value={budgetLine.id}>
                {budgetLine.name} - {budgetLine.code}
              </FormSelectItem>
            ))
          )}
        </FormSelect>

        {/* Total Budget Estimate */}
        <FormInput
          form={form}
          name="total_budget_estimate"
          label="Total Budget Estimate (Optional)"
          type="number"
          min={0}
          step={0.01}
          placeholder="e.g., 5000000"
          helpText="Total estimated budget for all positions"
        />
      </div>

      {/* Additional Notes */}
      <FormTextarea
        form={form}
        name="additional_notes"
        label="Additional Notes (Optional)"
        placeholder="Any additional information or special requirements..."
        rows={4}
        helpText="Any other relevant information about this recruitment"
      />
    </div>
  );
}
